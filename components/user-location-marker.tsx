'use client';

import { AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { useEffect } from 'react';
import { Circle } from './map-geofence';

interface UserLocationMarkerProps {
  position: GeolocationPosition;
  panOnUpdate?: boolean;
}

export function UserLocationMarker({ position, panOnUpdate = true }: UserLocationMarkerProps) {
  const map = useMap();

  const coords = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  };

  useEffect(() => {
    if (map && panOnUpdate) {
      map.panTo(coords);
    }
  }, [map, coords.lat, coords.lng, panOnUpdate]);

  return (
    <>
      <AdvancedMarker position={coords} title={'Your Location'}>
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-40"></div>
          <div className="absolute inset-2 bg-blue-600 border-2 border-white rounded-full"></div>
        </div>
      </AdvancedMarker>
      <Circle
        center={coords}
        radius={position.coords.accuracy}
        strokeColor="#3B82F6"
        strokeOpacity={0.4}
        strokeWeight={1}
        fillColor="#3B82F6"
        fillOpacity={0.1}
      />
    </>
  );
}
