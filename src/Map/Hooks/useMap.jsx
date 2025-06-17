import { useEffect, useRef } from 'react';
import leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';

export const useMap = (containerRef, initialPosition) => {
  const mapRef = useRef(null);
  const layersRef = useRef({
    standard: leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }),
    satellite: leaflet.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }),
    terrain: leaflet.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    }),
    dark: leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    })
  });

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    mapRef.current = leaflet.map(containerRef.current).setView(
      [initialPosition.latitude, initialPosition.longitude],
      15
    );
    layersRef.current.standard.addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [containerRef, initialPosition]);

  const changeLayer = (layerName) => {
    if (!mapRef.current) return;
    
    Object.values(layersRef.current).forEach(layer => {
      if (mapRef.current.hasLayer(layer)) {
        mapRef.current.removeLayer(layer);
      }
    });
    
    layersRef.current[layerName].addTo(mapRef.current);
  };

  return { mapInstance: mapRef, changeLayer };
};