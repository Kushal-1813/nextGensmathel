"use client";
import type { ReactNode } from 'react';
import { APIProvider as GoogleMapsAPIProvider } from '@vis.gl/react-google-maps';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal } from 'lucide-react';

interface APIProviderProps {
  children: ReactNode;
}

export function APIProvider({ children }: APIProviderProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>API Key Error</AlertTitle>
          <AlertDescription>
            Google Maps API Key is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file to use the app.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <GoogleMapsAPIProvider apiKey={apiKey} libraries={['places', 'routes', 'geometry']}>{children}</GoogleMapsAPIProvider>;
}
