"use client"

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function SplashScreen() {
  const [show, setShow] = useState(true);
  const [render, setRender] = useState(true);

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      setShow(false);
    }, 3000); // Start fading out after 3 seconds

    const unmountTimer = setTimeout(() => {
      setRender(false);
    }, 3500); // Unmount after fade out animation (0.5s)

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (!render) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-500",
        show ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="animate-fade-in text-8xl font-bold tracking-widest text-primary">
        NRK
      </div>
    </div>
  );
}
