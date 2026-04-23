import { useEffect, useState } from 'react';

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 10000,
  timeout: 15000,
};

const useCurrentLocation = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [trackingLocation, setTrackingLocation] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      return undefined;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setTrackingLocation(true);
      },
      (error) => {
        console.warn('Geolocation unavailable:', error);
        setTrackingLocation(false);
      },
      GEOLOCATION_OPTIONS
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return { currentLocation, trackingLocation };
};

export default useCurrentLocation;