'use client';

import { Dispatch, SetStateAction } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { MapPin, Play, Square, Navigation, Bluetooth, CheckCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface TripPanelProps {
  isTripStarted: boolean;
  setIsTripStarted: Dispatch<SetStateAction<boolean>>;
  currentLeg: google.maps.DirectionsStep | null;
  isBluetoothReady: boolean;
}

export function TripPanel({ isTripStarted, setIsTripStarted, currentLeg, isBluetoothReady }: TripPanelProps) {
  const handleStartTrip = () => {
    setIsTripStarted(true);
  };

  const handleStopTrip = () => {
    setIsTripStarted(false);
  };
  
  const StartButton = (
    <Button onClick={handleStartTrip} className="w-full bg-green-600 hover:bg-green-700" disabled={!isBluetoothReady}>
      <Play className="mr-2" />
      Start Trip
    </Button>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="text-primary" />
          <span>Real-Time Navigation</span>
        </CardTitle>
        <CardDescription>
          {isTripStarted ? 'Live trip in progress. Following your location.' : 'Start the trip to get live navigation updates.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isTripStarted ? (
           !isBluetoothReady ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full">{StartButton}</div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="flex items-center gap-2"><Bluetooth size={16} />Connect to your helmet to start the trip.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
           ) : StartButton
        ) : (
          <Button onClick={handleStopTrip} variant="destructive" className="w-full">
            <Square className="mr-2" />
            Stop Trip
          </Button>
        )}

        {isTripStarted && currentLeg && (
          <div className="p-4 bg-muted rounded-md space-y-2">
            <div className="flex items-center gap-3 text-sm font-semibold text-foreground">
                <Navigation size={20} className="text-primary" />
                <span>Current Instruction:</span>
            </div>
            <div
              className="pl-8 text-base"
              dangerouslySetInnerHTML={{ __html: currentLeg.instructions }}
            />
            <p className="pl-8 text-sm text-muted-foreground font-medium">
              Distance: {currentLeg.distance?.text}
            </p>
          </div>
        )}
        {isTripStarted && !currentLeg && (
          <div className="p-4 bg-muted rounded-md space-y-2 text-center">
             <div className="flex items-center justify-center gap-3 text-sm font-semibold text-green-500">
                <CheckCircle size={20} />
                <span>You have arrived!</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
