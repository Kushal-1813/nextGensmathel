"use client";

import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useRef } from 'react';
import { Input } from './ui/input';

interface AutocompleteInputProps extends Omit<React.ComponentProps<typeof Input>, 'value' | 'defaultValue'> {
    onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
    value?: string;
}

export function AutocompleteInput({ onPlaceSelect, value, ...props }: AutocompleteInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const places = useMapsLibrary('places');

    useEffect(() => {
        if (!places || !inputRef.current) return;
        
        const autocomplete = new places.Autocomplete(inputRef.current, {
            fields: ["geometry", "name", "formatted_address"],
        });
        
        const listener = autocomplete.addListener('place_changed', () => {
            onPlaceSelect(autocomplete.getPlace());
        });

        return () => {
            listener.remove();
            // The pac-container is attached to the body, so we need to remove it manually.
            const pacContainer = document.querySelector('.pac-container');
            if (pacContainer && pacContainer.parentElement) {
                pacContainer.parentElement.removeChild(pacContainer);
            }
        }
    }, [places, onPlaceSelect]);

    useEffect(() => {
        if (inputRef.current && value !== undefined) {
            inputRef.current.value = value;
        }
    }, [value]);

    return <Input ref={inputRef} {...props} defaultValue={value} />;
}
