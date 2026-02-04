import { useState, useEffect } from 'react';

interface LocationState {
    loaded: boolean;
    coordinates?: { lat: number; lng: number };
    error?: { code: number; message: string };
    permissionStatus: 'prompt' | 'granted' | 'denied';
}

export const useGeoLocation = () => {
    const [location, setLocation] = useState<LocationState>({
        loaded: false,
        permissionStatus: 'prompt'
    });

    const [watching, setWatching] = useState(false);

    // Initial permission check
    useEffect(() => {
        if (!("geolocation" in navigator)) {
            setLocation(prev => ({
                ...prev,
                loaded: true,
                error: { code: 0, message: "Geolocation not supported" }
            }));
            return;
        }

        navigator.permissions?.query({ name: 'geolocation' }).then(result => {
            setLocation(prev => ({ ...prev, permissionStatus: result.state }));
            result.onchange = () => {
                setLocation(prev => ({ ...prev, permissionStatus: result.state }));
            };
        });
    }, []);

    const onSuccess = (location: GeolocationPosition) => {
        setLocation({
            loaded: true,
            coordinates: {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
            },
            permissionStatus: 'granted'
        });
    };

    const onError = (error: GeolocationPositionError) => {
        setLocation({
            loaded: true,
            error: {
                code: error.code,
                message: error.message,
            },
            permissionStatus: 'denied'
        });
        setWatching(false);
    };

    const requestLocation = () => {
        if (!("geolocation" in navigator)) return;

        setWatching(true);
        navigator.geolocation.getCurrentPosition(onSuccess, onError);

        const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        });

        return () => navigator.geolocation.clearWatch(watchId);
    };

    return { ...location, requestLocation, isWatching: watching };
};
