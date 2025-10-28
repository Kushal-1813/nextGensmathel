'use client';

import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Trash2, BotMessageSquare } from "lucide-react";

interface SerialMonitorProps {
    logs: string[];
    setLogs: Dispatch<SetStateAction<string[]>>;
}

export function SerialMonitor({ logs, setLogs }: SerialMonitorProps) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <BotMessageSquare className="text-primary"/>
                        <CardTitle>Bluetooth Serial Monitor</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setLogs([])}>
                        <Trash2 size={18}/>
                    </Button>
                </div>
                <CardDescription>
                    Live logs from the Bluetooth connection and navigation events.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-64 w-full bg-muted rounded-md p-2">
                     <div ref={scrollAreaRef} className="p-2">
                        {logs.map((log, index) => (
                            <p key={index} className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
                                {log}
                            </p>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
