'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapView } from '@/components/map-view';
import { NavigationPanel } from '@/components/navigation-panel';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { generateInstructions } from '@/ai/flows/bluetooth-instruction-generator';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

// Helper function to calculate distance between two LatLngs using Google Maps Geometry library
const calculateDistance = (loc1: google.maps.LatLng, loc2: google.maps.LatLng): number => {
  const geometry = window.google.maps.geometry;
  if (geometry) {
    return geometry.spherical.computeDistanceBetween(loc1, loc2);
  }
  // Fallback Haversine for illustration if Google Maps API isn't loaded/geometry not available
  const R = 6371e3; // metres
  const φ1 = loc1.lat() * Math.PI / 180; // φ, λ in radians
  const φ2 = loc2.lat() * Math.PI / 180;
  const Δφ = (loc2.lat() - loc1.lat()) * Math.PI / 180;
  const Δλ = (loc2.lng() - loc1.lng()) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
};


export default function DashboardPage() {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [rxCharacteristic, setRxCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const { toast } = useToast();

  const [isTripStarted, setIsTripStarted] = useState(false);
  const [currentLeg, setCurrentLeg] = useState<google.maps.DirectionsStep | null>(null);
  const [userPosition, setUserPosition] = useState<GeolocationPosition | null>(null);
  const watchId = useRef<number | null>(null);
  const lastSentInstruction = useRef<string | null>(null);
  const currentStepIndex = useRef<number>(0);
  
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();

  useEffect(() => {
    if (!routesLibrary) return;
    setDirectionsService(new routesLibrary.DirectionsService());
  }, [routesLibrary]);

  const handleGetDirections = (to: google.maps.places.PlaceResult | null) => {
    if (!to) {
      toast({
        variant: 'destructive',
        title: 'Missing Destination',
        description: 'Please select a destination location.',
      });
      return;
    }

    if (!to.geometry?.location) {
        toast({
            variant: 'destructive',
            title: 'Invalid Destination',
            description: 'Please select a valid destination from the suggestions.',
        });
        return;
    }

    if (!directionsService) {
        toast({ variant: 'destructive', title: 'Map service not ready. Please try again.'});
        return;
    };

    if (!navigator.geolocation) {
        toast({ variant: 'destructive', title: 'Geolocation is not supported by this browser.' });
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const currentPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
        };
        setUserPosition(position);

        const request: google.maps.DirectionsRequest = {
            origin: currentPosition,
            destination: to.geometry!.location!,
            travelMode: google.maps.TravelMode.DRIVING,
            provideRouteAlternatives: true,
        };

        try {
            const response = await directionsService.route(request);
            setDirections(response);
            setSelectedRouteIndex(0);
        } catch (e) {
            toast({
                variant: 'destructive',
                title: 'Error Fetching Directions',
                description: 'Could not fetch directions. Please try again.',
            });
            console.error('Directions request failed', e);
        }
    }, () => {
        toast({ variant: 'destructive', title: 'Could not get current location' });
    });
  };

  const sendInstruction = useCallback(async (instruction: string) => {
    if (!instruction || instruction === lastSentInstruction.current) return;
    if (!rxCharacteristic || !rxCharacteristic.service.device.gatt?.connected) {
      // Don't toast here, as it can be annoying during a trip. The connector handles toasts.
      console.warn("Instruction send failed: Helmet not connected.");
      return;
    }
  
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(instruction);
      await rxCharacteristic.writeValue(data);
      lastSentInstruction.current = instruction;
      console.log(`Sent instruction: ${instruction}`);
    } catch (error) {
      console.error("Failed to send instruction:", error);
      toast({
        variant: "destructive",
        title: "Bluetooth Error",
        description: "Failed to send instruction to helmet."
      });
    }
  }, [rxCharacteristic, toast]);

    const onLocationError = useCallback((error: GeolocationPositionError) => {
        console.error("Geolocation error:", error);
        toast({
          variant: "destructive",
          title: "Geolocation Error",
          description: error.message
        });
      }, [toast]);

    const onLocationSuccess = useCallback((position: GeolocationPosition) => {
      if (!directions) return;
      setUserPosition(position);
      const userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      const route = directions.routes[selectedRouteIndex];
      const leg = route.legs[0];
      const steps = leg.steps;
      
      const proximityThresholdMeters = 20;

      const distanceToDestination = calculateDistance(userLocation, leg.end_location);
      if (distanceToDestination < 50) { 
        if (lastSentInstruction.current !== "destination,0") {
            const arrivalStep = { 
                instructions: "You have arrived at your destination.", 
                distance: { text: "0 m", value: 0 } 
            } as google.maps.DirectionsStep;
            setCurrentLeg(arrivalStep);
            sendInstruction("destination,0");
        }
        return;
      }

      let closestStepIndex = -1;
      let minDistance = Infinity;

      steps.forEach((step, index) => {
          const distanceToStart = calculateDistance(userLocation, step.start_location);
          if (distanceToStart < minDistance) {
              minDistance = distanceToStart;
              closestStepIndex = index;
          }
      });
      
      // A simple check to see if we are on the path of the current step
      if (closestStepIndex !== -1) {
          const step = steps[closestStepIndex];
          const distanceToStepStart = calculateDistance(userLocation, step.start_location);
          const distanceToStepEnd = calculateDistance(userLocation, step.end_location);
          const stepLength = calculateDistance(step.start_location, step.end_location);

          if(distanceToStepStart + distanceToStepEnd > stepLength + proximityThresholdMeters) {
             // User is off the current step path, maybe they made a wrong turn.
             // For now, we don't handle rerouting, just stick to the closest step.
          }
      }

      if(closestStepIndex > currentStepIndex.current) {
          currentStepIndex.current = closestStepIndex;
      }


      if (currentStepIndex.current >= steps.length) {
        if (lastSentInstruction.current !== "rerouting,0") {
          sendInstruction("rerouting,0");
        }
        return;
      }

      const foundStep = steps[currentStepIndex.current];
      const nextStep = steps[currentStepIndex.current + 1];
      const distanceToNextManeuver = nextStep ? calculateDistance(userLocation, nextStep.start_location) : 0;


      if (foundStep && foundStep !== currentLeg) { 
        setCurrentLeg(foundStep);
        const rawInstructionText = foundStep.instructions.replace(/<[^>]*>/g, '');
        generateInstructions({text: rawInstructionText})
            .then(simplified => {
                if (simplified && simplified.instructions) {
                    const [arrow] = simplified.instructions.split(',');
                    const instructionWithDistance = `${arrow},${Math.round(distanceToNextManeuver)}`;
                    sendInstruction(instructionWithDistance);
                }
            })
            .catch(err => {
                console.error("AI simplification failed:", err);
            })
      }
    }, [directions, selectedRouteIndex, sendInstruction, currentLeg]);

    useEffect(() => {
        if (!isTripStarted || !directions) {
          if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
          }
          return;
        }

        currentStepIndex.current = 0;
        lastSentInstruction.current = null;

        watchId.current = navigator.geolocation.watchPosition(
          onLocationSuccess,
          onLocationError,
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );

        return () => {
          if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
          }
          if (rxCharacteristic?.service.device.gatt?.connected) {
            sendInstruction("idle,0");
          }
        };
      }, [isTripStarted, directions, sendInstruction, onLocationSuccess, onLocationError, rxCharacteristic]);


  return (
      <SidebarProvider>
          <div className="flex h-full w-full">
            <Sidebar collapsible="offcanvas">
              <NavigationPanel
                onGetDirections={handleGetDirections}
                directions={directions}
                setSelectedRouteIndex={setSelectedRouteIndex}
                selectedRouteIndex={selectedRouteIndex}
                rxCharacteristic={rxCharacteristic}
                setRxCharacteristic={setRxCharacteristic}
                isTripStarted={isTripStarted}
                setIsTripStarted={setIsTripStarted}
                currentLeg={currentLeg}
              />
            </Sidebar>
            <MapView 
              directions={directions} 
              selectedRouteIndex={selectedRouteIndex} 
              userPosition={userPosition}
              isTripStarted={isTripStarted}
            />
          </div>
      </SidebarProvider>
  );
}
