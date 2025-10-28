'use client';

import { useState, useTransition, type Dispatch, type SetStateAction } from 'react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Bluetooth, BluetoothConnected, BluetoothSearching, Loader2 } from 'lucide-react';
import { Badge } from './ui/badge';

// Custom ESP32 Navigation Service UUIDs
const NAV_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const NAV_CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

interface BluetoothConnectorProps {
  setRxCharacteristic: Dispatch<SetStateAction<BluetoothRemoteGATTCharacteristic | null>>;
}

export function BluetoothConnector({ setRxCharacteristic }: BluetoothConnectorProps) {
  const [isConnecting, startConnectTransition] = useTransition();
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const { toast } = useToast();

  const handleDisconnect = () => {
    if (device?.gatt?.connected) {
      device.gatt.disconnect();
      setDevice(null);
      setRxCharacteristic(null);
      toast({
        title: 'Device Disconnected',
        description: `${device.name || 'The device'} has been disconnected.`,
      });
    }
  };

  const handleConnect = () => {
    startConnectTransition(async () => {
      try {
        if (typeof navigator === 'undefined' || !navigator.bluetooth) {
          toast({
            variant: 'destructive',
            title: 'Web Bluetooth Not Supported',
            description: 'Your browser does not support the Web Bluetooth API. Please use a compatible browser like Chrome.',
          });
          return;
        }

        toast({ title: 'Searching for devices...' });
        const requestedDevice = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [NAV_SERVICE_UUID],
        });

        if (!requestedDevice) {
            toast({ title: 'Connection Cancelled', description: 'You cancelled the device selection.' });
            return;
        }

        if (device) {
          handleDisconnect();
        }

        setDevice(requestedDevice);

        if (!requestedDevice.gatt) {
          throw new Error('GATT server not available on this device.');
        }

        toast({ title: `Connecting to ${requestedDevice.name || 'device'}...` });
        const server = await requestedDevice.gatt.connect();
        
        if (!server.connected) {
          throw new Error('GATT Server is disconnected. Cannot retrieve services.');
        }

        const service = await server.getPrimaryService(NAV_SERVICE_UUID);
        const characteristic = await service.getCharacteristic(NAV_CHARACTERISTIC_UUID);

        if (!characteristic) {
          throw new Error('Could not find the Navigation characteristic.');
        }

        setRxCharacteristic(characteristic);

        toast({
          title: 'Connected!',
          description: `Successfully connected to ${requestedDevice.name || 'device'}.`,
        });

      } catch (error) {
        let description = 'An unknown error occurred during connection.';
        if (error instanceof Error) {
            if (error.name === 'NotFoundError') {
              description = 'No matching device found. Is your helmet turned on and in range?';
            } else if (error.name === 'NotAllowedError') {
              description = 'You cancelled the device selection or permissions were denied.';
            } else {
              description = error.message;
            }
        }
        
        toast({
          variant: 'destructive',
          title: 'Connection Failed',
          description,
        });

        if (device?.gatt?.connected) {
          device.gatt.disconnect();
        }
        setDevice(null);
        setRxCharacteristic(null);
      }
    });
  };

  const getConnectionStatus = () => {
    if (isConnecting) return { icon: <BluetoothSearching className="animate-pulse text-primary"/>, text: "Connecting...", badge: "default" as const };
    if (device?.gatt?.connected) return { icon: <BluetoothConnected className="text-green-500" />, text: device?.name || "Connected", badge: "default" as const };
    return { icon: <Bluetooth />, text: "Not Connected", badge: "secondary" as const };
  }

  const { icon, text, badge } = getConnectionStatus();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Helmet Connection</CardTitle>
          <Badge variant={badge} className="flex items-center gap-2">
            {icon}
            <span>{text}</span>
          </Badge>
        </div>
        <CardDescription>Connect to your ESP32-powered smart helmet via Bluetooth LE.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!device?.gatt?.connected ? (
            <Button onClick={handleConnect} disabled={isConnecting} className="w-full bg-ring text-background hover:bg-ring/90">
                {isConnecting ? <Loader2 className="mr-2 animate-spin" /> : <Bluetooth className="mr-2" />}
                Connect Helmet
            </Button>
        ) : (
            <Button onClick={handleDisconnect} variant="destructive" className="w-full">
                Disconnect Helmet
            </Button>
        )}
      </CardContent>
    </Card>
  );
}
