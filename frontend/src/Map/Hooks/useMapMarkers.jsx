import { useRef } from 'react';
import leaflet from 'leaflet';

export const useMapMarkers = (mapInstance) => {
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  const userIcon = leaflet.divIcon({
    className: 'user-location-marker',
    html: '<div class="user-location-pulse"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  const addMarker = (lat, lng, popupContent = '', isUserMarker = false) => {
    if (!mapInstance.current) return null;

    const marker = leaflet.marker([lat, lng], {
      icon: isUserMarker ? userIcon : undefined,
      zIndexOffset: isUserMarker ? 1000 : 0
    }).addTo(mapInstance.current);

    if (popupContent) {
      marker.bindPopup(popupContent);
    }

    if (isUserMarker) {
      if (userMarkerRef.current) {
        mapInstance.current.removeLayer(userMarkerRef.current);
      }
      userMarkerRef.current = marker;
    } else {
      markersRef.current.push(marker);
    }

    return marker;
  };

  const clearMarkers = (preserveUserMarker = true) => {
    markersRef.current.forEach(marker => {
      if (marker !== userMarkerRef.current || !preserveUserMarker) {
        mapInstance.current?.removeLayer(marker);
      }
    });
    markersRef.current = preserveUserMarker && userMarkerRef.current ? [userMarkerRef.current] : [];
  };

  return { addMarker, clearMarkers, userMarkerRef, markersRef };
};