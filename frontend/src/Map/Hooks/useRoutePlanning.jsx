import { useState, useRef } from 'react';
import leaflet from 'leaflet';

export const useRoutePlanning = (mapInstance) => {
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const routeLayerRef = useRef(null);

  const calculateRoute = async (start, end) => {
    if (!start || !end || !mapInstance.current) return;

    // Clear previous route
    if (routeLayerRef.current) {
      mapInstance.current.removeLayer(routeLayerRef.current);
    }

    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.routes?.[0]) {
        const route = data.routes[0];
        routeLayerRef.current = leaflet.geoJSON({
          type: "Feature",
          geometry: route.geometry,
          properties: {}
        }, {
          style: {
            color: "#3498db",
            weight: 5,
            opacity: 0.7
          }
        }).addTo(mapInstance.current);

        // Fit bounds to route
        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        mapInstance.current.fitBounds(leaflet.latLngBounds(coordinates));
      }
    } catch (error) {
      console.error("Routing error:", error);
      throw error;
    }
  };

  return {
    startLocation,
    setStartLocation,
    endLocation,
    setEndLocation,
    calculateRoute,
    routeLayerRef
  };
};