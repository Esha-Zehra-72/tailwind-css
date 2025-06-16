import { useEffect, useState } from 'react';

const useGeolocation = () => {
    const [position, setPosition] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setIsLoading(false);
            return;
        }

        const onSuccess = (pos) => {
            setPosition({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy
            });
            setError(null);
            setIsLoading(false);
        };

        const onError = (err) => {
            setError(getErrorMessage(err));
            setIsLoading(false);
        };

        const getErrorMessage = (error) => {
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    return "User denied the request for Geolocation.";
                case error.POSITION_UNAVAILABLE:
                    return "Location information is unavailable.";
                case error.TIMEOUT:
                    return "The request to get user location timed out.";
                case error.UNKNOWN_ERROR:
                    return "An unknown error occurred.";
                default:
                    return error.message;
            }
        };

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        setIsLoading(true);
        const watcher = navigator.geolocation.watchPosition(onSuccess, onError, options);

        return () => navigator.geolocation.clearWatch(watcher);
    }, []);

    return { position, error, isLoading };
};

export default useGeolocation;