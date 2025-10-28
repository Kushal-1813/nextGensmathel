"use client";

import { Map, useMap } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';
import { SidebarInset, SidebarTrigger } from './ui/sidebar';
import { UserLocationMarker } from './user-location-marker';

interface MapViewProps {
  directions: google.maps.DirectionsResult | null;
  selectedRouteIndex: number;
  userPosition: GeolocationPosition | null;
  isTripStarted: boolean;
}

function DirectionsRenderer({ directions, routeIndex }: { directions: google.maps.DirectionsResult, routeIndex: number }) {
  const map = useMap();
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!map) return;
    if (!directionsRenderer) {
      setDirectionsRenderer(new google.maps.DirectionsRenderer());
    }
  }, [map, directionsRenderer]);

  useEffect(() => {
    if (!directionsRenderer || !map) return;
    directionsRenderer.setMap(map);
    directionsRenderer.setDirections(directions);
    directionsRenderer.setRouteIndex(routeIndex);
    directionsRenderer.setOptions({
        suppressMarkers: true,
        polylineOptions: {
            strokeColor: "#3B82F6",
            strokeWeight: 5,
            strokeOpacity: 0.9,
        }
    });

    return () => {
        if (directionsRenderer) {
          directionsRenderer.setMap(null);
        }
    }
  }, [directionsRenderer, map, directions, routeIndex]);
  
  return null;
}

function RouteUpdater({ directions, selectedRouteIndex }: Omit<MapViewProps, 'userPosition' | 'isTripStarted'>) {
    const map = useMap();

    useEffect(() => {
        if (!map || !directions) return;

        const route = directions.routes[selectedRouteIndex];
        if (!route) return;

        const { bounds } = route;
        map.fitBounds(bounds);
    }, [map, directions, selectedRouteIndex]);

    return null;
}

export function MapView({ directions, selectedRouteIndex, userPosition, isTripStarted }: MapViewProps) {
  return (
    <SidebarInset>
      <div className="relative h-full w-full bg-muted overflow-hidden">
        <SidebarTrigger className="absolute top-4 left-4 z-10 md:hidden" />
        <Map
          defaultCenter={{ lat: 40.7128, lng: -74.0060 }}
          defaultZoom={12}
          mapId="a3a79d355f366e4"
          disableDefaultUI={true}
          gestureHandling={'greedy'}
          className="h-full w-full"
        >
          {directions && (
              <>
                  <DirectionsRenderer
                      directions={directions}
                      routeIndex={selectedRouteIndex}
                  />
                  <RouteUpdater directions={directions} selectedRouteIndex={selectedRouteIndex} />
              </>
          )}
          {userPosition && <UserLocationMarker position={userPosition} panOnUpdate={!isTripStarted} />}
        </Map>
      </div>
    </SidebarInset>
  );
}
