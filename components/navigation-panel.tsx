'use client';

import { useState, type Dispatch, type SetStateAction, useTransition } from 'react';
import { AutocompleteInput } from './autocomplete-input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Loader2, Search } from 'lucide-react';
import { RouteDetails } from './route-details';
import { ScrollArea } from './ui/scroll-area';
import { BluetoothConnector } from './bluetooth-connector';
import { SidebarContent, SidebarHeader, SidebarTrigger } from './ui/sidebar';
import { TripPanel } from './trip-panel';

interface NavigationPanelProps {
  onGetDirections: (to: google.maps.places.PlaceResult | null) => void;
  directions: google.maps.DirectionsResult | null;
  setSelectedRouteIndex: Dispatch<SetStateAction<number>>;
  selectedRouteIndex: number;
  rxCharacteristic: BluetoothRemoteGATTCharacteristic | null;
  setRxCharacteristic: Dispatch<SetStateAction<BluetoothRemoteGATTCharacteristic | null>>;
  isTripStarted: boolean;
  setIsTripStarted: Dispatch<SetStateAction<boolean>>;
  currentLeg: google.maps.DirectionsStep | null;
}

export function NavigationPanel({
  onGetDirections,
  directions,
  setSelectedRouteIndex,
  selectedRouteIndex,
  rxCharacteristic,
  setRxCharacteristic,
  isTripStarted,
  setIsTripStarted,
  currentLeg,
}: NavigationPanelProps) {
  const [to, setTo] = useState<google.maps.places.PlaceResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGetDirectionsClick = () => {
    startTransition(() => {
        onGetDirections(to);
    });
  }

  return (
    <SidebarContent className="flex flex-col bg-background h-full">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Next Gen Connect</h1>
            <p className="text-sm text-muted-foreground">Your Smart Helmet Companion</p>
          </div>
          <SidebarTrigger className="md:hidden"/>
        </div>
      </SidebarHeader>
      
      <div className="p-4 space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="relative">
              <AutocompleteInput id="to" placeholder="To (Destination Location)" onPlaceSelect={setTo} className="pl-10" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>

            <Button onClick={handleGetDirectionsClick} disabled={isPending} className="w-full">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Get Directions
            </Button>
          </CardContent>
        </Card>
      </div>

      <ScrollArea className="flex-grow">
        <div className="p-4 pt-0 space-y-4">
          <BluetoothConnector setRxCharacteristic={setRxCharacteristic} />
          
          {directions && (
            <TripPanel 
              isTripStarted={isTripStarted}
              setIsTripStarted={setIsTripStarted}
              currentLeg={currentLeg}
              isBluetoothReady={!!rxCharacteristic}
            />
          )}

          {!isTripStarted && directions && (
            <RouteDetails
              directions={directions}
              selectedRouteIndex={selectedRouteIndex}
              setSelectedRouteIndex={setSelectedRouteIndex}
            />
          )}
        </div>
      </ScrollArea>
      
      <footer className="p-2 border-t text-center text-xs text-muted-foreground mt-auto">
          <p>Next Gen Connect © 2024. For a smarter ride.</p>
      </footer>
    </SidebarContent>
  );
}
