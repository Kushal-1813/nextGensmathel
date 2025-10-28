'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { APIProvider } from '@/components/api-provider';
import { MapView } from '@/components/map-view';
import { NavigationPanel } from '@/components/navigation-panel';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { generateInstructions } from '@/ai/flows/bluetooth-instruction-generator';

// Helper function to calculate distance between two LatLngs using Google Maps Geometry library
const calculateDistance = (loc1: google.maps.LatLng, loc2: google.maps.LatLng): number => {
  if (window.google && window.google.maps.geometry) {
    return window.google.maps.geometry.spherical.computeDistanceBetween(loc1, loc2);
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
  const [isSending, setIsSending] = useState(false);

  const sendInstruction = useCallback(async (instruction: string) => {
    if (!instruction || instruction === lastSentInstruction.current) return;
    if (!rxCharacteristic || !rxCharacteristic.service.device.gatt?.connected) {
      toast({
        variant: "destructive",
        title: "Bluetooth Error",
        description: "Helmet not connected or characteristic not available.",
      });
      return;
    }
  
    setIsSending(true);
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(instruction);
      await rxCharacteristic.writeValue(data);
      lastSentInstruction.current = instruction;
      console.log(`Sent instruction (arrow,distance): ${instruction}`);
    } catch (error) {
      console.error("Failed to send instruction:", error);
      toast({
        variant: "destructive",
        title: "Bluetooth Error",
        description: "Failed to send instruction to helmet."
      });
    } finally {
        setIsSending(false);
    }
  }, [rxCharacteristic, toast]);

  useEffect(() => {
    if (!isTripStarted || !directions) {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      setUserPosition(null);
      if (rxCharacteristic?.service.device.gatt?.connected) {
        sendInstruction("idle,0");
      }
      return;
    }

    const handlePositionUpdate = (position: GeolocationPosition) => {
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

      if (currentStepIndex.current < steps.length) {
        const currentStep = steps[currentStepIndex.current];
        const distanceToStepEnd = calculateDistance(userLocation, currentStep.end_location);

        if (distanceToStepEnd < proximityThresholdMeters) {
          currentStepIndex.current++;
        }
      }

      if (currentStepIndex.current >= steps.length) {
        if (lastSentInstruction.current !== "rerouting,0") {
          sendInstruction("rerouting,0");
        }
        return;
      }

      const foundStep = steps[currentStepIndex.current];

      if (foundStep && foundStep !== currentLeg) { 
        setCurrentLeg(foundStep);
        const rawInstructionText = foundStep.instructions.replace(/<[^>]*>/g, '');
        generateInstructions({text: rawInstructionText})
            .then(simplified => {
                if (simplified && simplified.instructions) {
                    sendInstruction(simplified.instructions);
                }
            })
            .catch(err => {
                console.error("AI simplification failed:", err);
            })
      }
    };

    currentStepIndex.current = 0;
    lastSentInstruction.current = null;

    watchId.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      (error) => {
        console.error("Geolocation error:", error);
        toast({
          variant: "destructive",
          title: "Geolocation Error",
          description: error.message
        });
      },
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
  }, [isTripStarted, directions, selectedRouteIndex, sendInstruction, currentLeg, rxCharacteristic, toast]);


  return (
    <APIProvider>
        <SidebarProvider>
            <div className="flex h-full w-full">
              <Sidebar collapsible="offcanvas">
                <NavigationPanel
                  setDirections={setDirections}
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
              />
            </div>
        </SidebarProvider>
    </APIProvider>
  );
}
