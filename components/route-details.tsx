'use client';

import { Dispatch, SetStateAction } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { ScrollArea } from "./ui/scroll-area";
import { Route } from "lucide-react";
import { Separator } from "./ui/separator";

interface RouteDetailsProps {
    directions: google.maps.DirectionsResult;
    selectedRouteIndex: number;
    setSelectedRouteIndex: Dispatch<SetStateAction<number>>;
}

export function RouteDetails({ directions, selectedRouteIndex, setSelectedRouteIndex }: RouteDetailsProps) {
    const route = directions.routes[selectedRouteIndex];
    if (!route || !route.legs || route.legs.length === 0) {
        return null;
    }

    const leg = route.legs[0];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Route Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-around items-center text-center p-2 bg-muted rounded-md">
                    <div>
                        <p className="text-sm text-muted-foreground">Distance</p>
                        <p className="font-bold text-lg">{leg.distance?.text}</p>
                    </div>
                    <Separator orientation="vertical" className="h-10" />
                    <div>
                        <p className="text-sm text-muted-foreground">ETA</p>
                        <p className="font-bold text-lg">{leg.duration?.text}</p>
                    </div>
                </div>

                <Accordion type="single" collapsible className="w-full" defaultValue={'turn-by-turn'}>
                    <ScrollArea className="max-h-96 w-full">
                        <AccordionItem value="turn-by-turn">
                            <AccordionTrigger className="text-base">Turn-by-Turn Instructions</AccordionTrigger>
                            <AccordionContent>
                                <ol className="space-y-3 p-1">
                                    {leg.steps.map((step, index) => (
                                        <li key={index} className="flex gap-3 text-sm">
                                            <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground font-bold">{index + 1}</span>
                                            <span className="flex-grow pt-0.5" dangerouslySetInnerHTML={{ __html: step.instructions }} />
                                        </li>
                                    ))}
                                </ol>
                            </AccordionContent>
                        </AccordionItem>
                        
                        {directions.routes.length > 1 && (
                            <AccordionItem value="alt-routes">
                                <AccordionTrigger className="text-base">Alternative Routes</AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-2">
                                        {directions.routes.map((altRoute, index) => {
                                            if (index === selectedRouteIndex) return null;
                                            const altLeg = altRoute.legs[0];
                                            return (
                                                <Button
                                                    key={index}
                                                    variant="outline"
                                                    className="w-full h-auto justify-between p-3"
                                                    onClick={() => setSelectedRouteIndex(index)}
                                                >
                                                    <div className="text-left">
                                                        <p className="font-semibold">{altRoute.summary || `Route ${index + 1}`}</p>
                                                        <p className="text-xs text-muted-foreground">{altLeg.distance?.text} &bull; {altLeg.duration?.text}</p>
                                                    </div>
                                                    <Route className="h-5 w-5 text-primary"/>
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )}
                    </ScrollArea>
                </Accordion>
            </CardContent>
        </Card>
    );
}
