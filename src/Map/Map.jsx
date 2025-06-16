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
    const [locationError, setLocationError] = useState(null);

    const location = useGeolocation();

    const clearMarkers = () => {
        markersRef.current.forEach(marker => {
            if (marker !== userMarkerRef.current && mapInstanceRef.current) {
                mapInstanceRef.current.removeLayer(marker);
            }
        });
        markersRef.current = userMarkerRef.current ? [userMarkerRef.current] : [];
        setNearMarkers([]);
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
        
        // Initialize map with a reasonable default view
        mapInstanceRef.current = leaflet.map(mapContainerRef.current).setView(
            [20, 0],  // Default to a more central location
            2         // Low zoom level to show more of the world
        );

        leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(mapInstanceRef.current);

        // Add existing markers from localStorage
        if (Array.isArray(nearMarkers)) {
            nearMarkers.forEach(({ latitude, longitude }) => {
                const marker = leaflet.marker([latitude, longitude])
                    .addTo(mapInstanceRef.current)
                    .bindPopup(`lat:${latitude.toFixed(2)} , long:${longitude.toFixed(2)}`);
                markersRef.current.push(marker);
            });
        }

        // Click handler for adding new markers
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
        if (!mapInstanceRef.current || !location) return;

        setUserPosition({
            latitude: location.latitude,
            longitude: location.longitude
        });

        // Remove existing user marker if it exists
        if (userMarkerRef.current) {
            mapInstanceRef.current.removeLayer(userMarkerRef.current);
        }

        // Create new user marker
        userMarkerRef.current = leaflet.marker([location.latitude, location.longitude])
            .addTo(mapInstanceRef.current)
            .bindPopup("You are here");

        // Style the user marker differently
        const el = userMarkerRef.current.getElement();
        if (el) {
            el.style.filter = "hue-rotate(120deg)";
        }

        // Update markers array
        markersRef.current = [
            userMarkerRef.current,
            ...markersRef.current.filter(marker => marker !== userMarkerRef.current)
        ];

        // Center map on user's location
        mapInstanceRef.current.setView([location.latitude, location.longitude], 13);
    }, [location]);

    useEffect(() => {
        if (startLocation && endLocation) {
            calculateRoute();
        }
    }, [startLocation, endLocation]);

    return (
        <>
            <div className="text-center p-2 bg-white shadow-md">
                {!location && (
                    <div className="bg-yellow-100 border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-2">
                        <p>Waiting for location access... Please enable geolocation in your browser settings.</p>
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
        </>
    );
};

export default Map;