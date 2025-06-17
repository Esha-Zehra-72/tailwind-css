import { useState } from 'react';

export const useLocationSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const searchLocation = async (query) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
        {
          headers: {
            'User-Agent': 'Map/1.0 (eshazehra72@gmail.com)'
          }
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
      throw error;
    } finally {
      setIsSearching(false);
    }
  };

  return { searchLocation, searchResults, isSearching, setSearchResults };
};