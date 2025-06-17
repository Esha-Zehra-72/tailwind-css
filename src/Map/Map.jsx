import { useEffect, useRef, useState } from 'react';
import leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useLocalStorage from './Hooks/useLocalStorage';
import useGeolocation from './Hooks/useGeolocation';

const Map = () => {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const userMarkerRef = useRef(null);
    const searchInputRef = useRef(null);
    const routeLayerRef = useRef(null);
    const markersRef = useRef([]);
    const [userPosition, setUserPosition] = useLocalStorage("USER_MARKER", null);
    const [nearMarkers, setNearMarkers] = useLocalStorage("NEAR_MARKER", []);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [startLocation, setStartLocation] = useState(null);
    const [endLocation, setEndLocation] = useState(null);
    const [startSearchQuery, setStartSearchQuery] = useState('');
    const [endSearchQuery, setEndSearchQuery] = useState('');
    const [startSearchResults, setStartSearchResults] = useState([]);
    const [endSearchResults, setEndSearchResults] = useState([]);
    const [activeLayer, setActiveLayer] = useState('standard'); // Track active layer

    const { position: location, error: locationError, isLoading: isLocationLoading } = useGeolocation();

    // Define map layers
    const mapLayers = {
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
    };

    const userIcon = leaflet.divIcon({
        className: 'user-location-marker',
        html: '<div class="user-location-pulse"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    const clearMarkers = () => {
        markersRef.current.forEach(marker => {
            if (marker !== userMarkerRef.current && mapInstanceRef.current) {
                mapInstanceRef.current.removeLayer(marker);
            }
        });
        markersRef.current = userMarkerRef.current ? [userMarkerRef.current] : [];
        setNearMarkers([]);
    };

    const centerOnCurrentLocation = () => {
        if (!mapInstanceRef.current) return;

        if (location) {
            mapInstanceRef.current.flyTo([location.latitude, location.longitude], 15);
            updateUserMarker(location.latitude, location.longitude);
        } else if (userPosition) {
            mapInstanceRef.current.flyTo([userPosition.latitude, userPosition.longitude], 15);
            updateUserMarker(userPosition.latitude, userPosition.longitude);
        } else {
            mapInstanceRef.current.flyTo([31.448877, 74.204068], 15);
            updateUserMarker(31.448877, 74.204068);
        }
    };

    const updateUserMarker = (lat, lng) => {
        if (userMarkerRef.current) {
            mapInstanceRef.current.removeLayer(userMarkerRef.current);
        }
        userMarkerRef.current = leaflet.marker([lat, lng], {
            icon: userIcon,
            zIndexOffset: 1000
        })
            .addTo(mapInstanceRef.current)
            .bindPopup("You are here")
            .openPopup();
    };

    const changeLayer = (layerName) => {
        if (!mapInstanceRef.current) return;

        // Remove all layers
        Object.values(mapLayers).forEach(layer => {
            if (mapInstanceRef.current.hasLayer(layer)) {
                mapInstanceRef.current.removeLayer(layer);
            }
        });

        // Add the selected layer
        mapLayers[layerName].addTo(mapInstanceRef.current);
        setActiveLayer(layerName);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`,
                {
                    headers: {
                        'User-Agent': 'Map/1.0 (eshazehra72@gmail.com)'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setSearchResults(data);

            if (data.length > 0) {
                const firstResult = data[0];
                const lat = parseFloat(firstResult.lat);
                const lon = parseFloat(firstResult.lon);

                mapInstanceRef.current.setView([lat, lon], 13);
                clearMarkers();

                const newMarker = leaflet.marker([lat, lon])
                    .addTo(mapInstanceRef.current)
                    .bindPopup(`<b>${firstResult.display_name}</b><br>Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`)
                    .openPopup();

                markersRef.current.push(newMarker);
            }
        } catch (error) {
            console.error("Search error:", error);
            alert("Search failed. Please try again later or check your connection.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleLocationSearch = async (query, isStart) => {
        if (!query.trim()) return;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
            );
            const data = await response.json();

            if (isStart) {
                setStartSearchResults(data);
            } else {
                setEndSearchResults(data);
            }
        } catch (error) {
            console.error("Search error:", error);
        }
    };

    const calculateRoute = async () => {
        if (!startLocation || !endLocation) return;
        if (routeLayerRef.current) {
            mapInstanceRef.current.removeLayer(routeLayerRef.current);
        }
        clearMarkers();

        try {
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${startLocation.longitude},${startLocation.latitude};${endLocation.longitude},${endLocation.latitude}?overview=full&geometries=geojson`
            );
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                const routeCoordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                routeLayerRef.current = leaflet.geoJSON({
                    type: "Feature",
                    geometry: {
                        type: "LineString",
                        coordinates: route.geometry.coordinates
                    },
                    properties: {}
                }, {
                    style: {
                        color: "#3498db",
                        weight: 5,
                        opacity: 0.7
                    }
                }).addTo(mapInstanceRef.current);

                const startMarker = leaflet.marker([startLocation.latitude, startLocation.longitude])
                    .addTo(mapInstanceRef.current)
                    .bindPopup(`<b>Start:</b> ${startLocation.display_name ? startLocation.display_name : `Lat: ${startLocation.latitude.toFixed(4)}, Lon: ${startLocation.longitude.toFixed(4)}`}`);

                const endMarker = leaflet.marker([endLocation.latitude, endLocation.longitude])
                    .addTo(mapInstanceRef.current)
                    .bindPopup(`<b>End:</b> ${endLocation.display_name ? endLocation.display_name : `Lat: ${endLocation.latitude.toFixed(4)}, Lon: ${endLocation.longitude.toFixed(4)}`}`);

                markersRef.current.push(startMarker, endMarker);

                const bounds = leaflet.latLngBounds(routeCoordinates);
                mapInstanceRef.current.fitBounds(bounds);
            }
        } catch (error) {
            console.error("Routing error:", error);
        }
    };

    useEffect(() => {
        if (mapInstanceRef.current) return;
        mapInstanceRef.current = leaflet.map(mapContainerRef.current).setView(
            [31.448877, 74.204068],
            15
        );

        // Add the default layer
        mapLayers.standard.addTo(mapInstanceRef.current);

        if (Array.isArray(nearMarkers)) {
            nearMarkers.forEach(({ latitude, longitude }) => {
                const marker = leaflet.marker([latitude, longitude])
                    .addTo(mapInstanceRef.current)
                    .bindPopup(`lat:${latitude.toFixed(2)} , long:${longitude.toFixed(2)}`);
                markersRef.current.push(marker);
            });
        }
        mapInstanceRef.current.on('click', (e) => {
            const { lat: latitude, lng: longitude } = e.latlng;

            const marker = leaflet.marker([latitude, longitude])
                .addTo(mapInstanceRef.current)
                .bindPopup(`lat:${latitude.toFixed(2)} , long:${longitude.toFixed(2)}`);

            markersRef.current.push(marker);

            setNearMarkers((prevMarkers) => [
                ...(Array.isArray(prevMarkers) ? prevMarkers : []),
                { latitude, longitude }
            ]);
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.off();
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (location) {
            setUserPosition({
                latitude: location.latitude,
                longitude: location.longitude
            });
            updateUserMarker(location.latitude, location.longitude);
        }
    }, [location]);

    useEffect(() => {
        if (startLocation && endLocation) {
            calculateRoute();
        }
    }, [startLocation, endLocation]);

    return (
        <>
            <div className="text-center p-2 bg-white shadow-md relative">
                <button
                    onClick={() => {
                        if (location) {
                            centerOnCurrentLocation();
                        } else if (locationError) {
                            window.location.reload();
                        } else {
                            centerOnCurrentLocation();
                        }
                    }}
                    className="absolute left-3 top-60 bg-blue-500 text-white p-2 rounded-full z-[1000] shadow-md hover:bg-blue-600 transition-colors"
                    title="Center on my location"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2"></path>
                        <circle cx="12" cy="12" r="4"></circle>
                    </svg>
                </button>

                {/* Layer control buttons */}
                <div className="absolute left-3 top-72 flex flex-col space-y-2 z-[1000]">
                    <button
                        onClick={() => changeLayer('standard')}
                        className={`p-2 rounded-full shadow-md ${activeLayer === 'standard' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'}`}
                        title="Standard Map"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 3H3v18h18V3z"></path>
                            <path d="M9 9h6v6H9z"></path>
                        </svg>
                    </button>
                    <button
                        onClick={() => changeLayer('satellite')}
                        className={`p-2 rounded-full shadow-md ${activeLayer === 'satellite' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'}`}
                        title="Satellite View"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <circle cx="12" cy="12" r="2"></circle>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                    </button>
                    <button
                        onClick={() => changeLayer('terrain')}
                        className={`p-2 rounded-full shadow-md ${activeLayer === 'terrain' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'}`}
                        title="Terrain View"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                    </button>
                    <button
                        onClick={() => changeLayer('dark')}
                        className={`p-2 rounded-full shadow-md ${activeLayer === 'dark' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'}`}
                        title="Dark Mode"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                    </button>
                </div>

                {isLocationLoading && (
                    <div className="bg-blue-100 border-blue-400 text-blue-700 px-4 py-3 rounded mb-2">
                        <p>Detecting your location...</p>
                    </div>
                )}

                {locationError && (
                    <div className="bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded mb-2">
                        <p>Location Error: {locationError}</p>
                        <p>Please enable location services in your browser settings and refresh the page.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 bg-red-500 text-white px-3 py-1 rounded"
                        >
                            Refresh Page
                        </button>
                    </div>
                )}

                {!location && !locationError && !isLocationLoading && (
                    <div className="bg-yellow-100 border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-2">
                        <p>We need your permission to access your location</p>
                        <button
                            onClick={centerOnCurrentLocation}
                            className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded"
                        >
                            Allow Location Access
                        </button>
                    </div>
                )}

                <form onSubmit={handleSearch} className="text-center">
                    <input
                        type="search"
                        ref={searchInputRef}
                        placeholder="Search location..."
                        className="border border-gray-300 py-2 px-4 rounded-full w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <button
                        type="submit"
                        className="bg-blue-500 text-white py-2 px-6 rounded-full hover:bg-blue-600 transition-colors mt-2"
                        disabled={isSearching}
                    >
                        {isSearching ? 'Searching...' : 'Search'}
                    </button>

                    <button
                        type="button"
                        className="bg-red-500 text-white py-2 px-6 rounded-full hover:bg-red-600 transition-colors mt-2 ml-2"
                        onClick={clearMarkers}
                    >
                        Clear Markers
                    </button>

                    <div className="flex flex-col md:flex-row gap-2 text-center w-full mt-4">
                        <div className="relative flex-1">
                            <label htmlFor="start-location" className="block text-sm font-medium text-gray-700 mb-1">Start Location:</label>
                            <input
                                type="search"
                                placeholder="Enter Start Location"
                                className="border border-gray-300 py-2 px-4 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={startSearchQuery}
                                onChange={(e) => {
                                    setStartSearchQuery(e.target.value);
                                    handleLocationSearch(e.target.value, true);
                                }}
                            />
                        </div>
                        <div className="relative flex-1">
                            <label htmlFor="ended-location" className="block text-sm font-medium text-gray-700 mb-1">End Location:</label>
                            <input
                                type="search"
                                placeholder="Enter End Location"
                                className="border border-gray-300 py-2 px-4 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={endSearchQuery}
                                onChange={(e) => {
                                    setEndSearchQuery(e.target.value);
                                    handleLocationSearch(e.target.value, false);
                                }}
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="button"
                                className="bg-green-500 text-white py-2 px-6 rounded-full hover:bg-green-600 transition-colors h-[42px]"
                                onClick={calculateRoute}
                                disabled={!startLocation || !endLocation}
                            >
                                Show Route
                            </button>
                        </div>
                    </div>
                </form>

                {startSearchResults.length > 0 && (
                    <div className="relative z-[999]">
                        <div className="absolute left-0 right-0 mx-auto w-full max-w-md bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {startSearchResults.map((result, index) => (
                                <div
                                    key={`start-${index}`}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                        const lat = parseFloat(result.lat);
                                        const lon = parseFloat(result.lon);
                                        setStartLocation({
                                            latitude: lat,
                                            longitude: lon,
                                            display_name: result.display_name
                                        });
                                        setStartSearchQuery(result.display_name);
                                        setStartSearchResults([]);
                                    }}
                                >
                                    {result.display_name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {endSearchResults.length > 0 && (
                    <div className="relative z-[999]">
                        <div className="absolute left-0 right-0 mx-auto w-full max-w-md bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {endSearchResults.map((result, index) => (
                                <div
                                    key={`end-${index}`}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                        const lat = parseFloat(result.lat);
                                        const lon = parseFloat(result.lon);
                                        setEndLocation({
                                            latitude: lat,
                                            longitude: lon,
                                            display_name: result.display_name
                                        });
                                        setEndSearchQuery(result.display_name);
                                        setEndSearchResults([]);
                                    }}
                                >
                                    {result.display_name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {searchResults.length > 0 && (
                    <div className="relative z-[999]">
                        <div className="absolute left-0 right-0 mx-auto w-full max-w-md bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {searchResults.map((result, index) => (
                                <div
                                    key={index}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                        const lat = parseFloat(result.lat);
                                        const lon = parseFloat(result.lon);
                                        mapInstanceRef.current.setView([lat, lon], 15);

                                        clearMarkers();

                                        const marker = leaflet.marker([lat, lon])
                                            .addTo(mapInstanceRef.current)
                                            .bindPopup(`<b>${result.display_name}</b>`)
                                            .openPopup();

                                        markersRef.current.push(marker);
                                        setSearchResults([]);
                                        setSearchQuery(result.display_name);
                                    }}
                                >
                                    {result.display_name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div
                ref={mapContainerRef}
                className="h-[calc(100vh-56px)] w-[100%]"
            ></div>

            <style>
                {`
                .user-location-marker {
                    background: transparent;
                    border: none;
                }
                .user-location-pulse {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #4285F4;
                    box-shadow: 0 0 0 0 rgba(66, 133, 244, 1);
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0% {
                        transform: scale(0.95);
                        box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.7);
                    }
                    70% {
                        transform: scale(1.1);
                        box-shadow: 0 0 0 10px rgba(66, 133, 244, 0);
                    }
                    100% {
                        transform: scale(0.95);
                        box-shadow: 0 0 0 0 rgba(66, 133, 244, 0);
                    }
                }
                `}
            </style>
        </>
    );
};

export default Map;