import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MapPin, Search, X } from 'lucide-react';

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface MapSelectorProps {
  onLocationSelect?: (location: Location) => void;
  initialLocation?: Location;
  height?: string;
  className?: string;
}

const MapSelector: React.FC<MapSelectorProps> = ({
  onLocationSelect,
  initialLocation,
  height = '400px',
  className = ''
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialLocation ? [initialLocation.longitude, initialLocation.latitude] : [-74.006, 40.7128], // Default to NYC
      zoom: initialLocation ? 15 : 10,
      attributionControl: false
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add click handler for location selection
    map.current.on('click', handleMapClick);

    // Add initial marker if location provided
    if (initialLocation) {
      addMarker(initialLocation.longitude, initialLocation.latitude);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Handle map click to select location
  const handleMapClick = useCallback(async (e: mapboxgl.MapMouseEvent) => {
    const { lng, lat } = e.lngLat;
    
    // Add marker at clicked location
    addMarker(lng, lat);
    
    // Reverse geocode to get address
    try {
      const address = await reverseGeocode(lng, lat);
      const location: Location = {
        latitude: lat,
        longitude: lng,
        address
      };
      
      setSelectedLocation(location);
      onLocationSelect?.(location);
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      const location: Location = {
        latitude: lat,
        longitude: lng
      };
      
      setSelectedLocation(location);
      onLocationSelect?.(location);
    }
  }, [onLocationSelect]);

  // Add or update marker on map
  const addMarker = (lng: number, lat: number) => {
    if (!map.current) return;

    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
    }

    // Create new marker
    marker.current = new mapboxgl.Marker({
      color: '#3B82F6',
      draggable: true
    })
      .setLngLat([lng, lat])
      .addTo(map.current);

    // Handle marker drag
    marker.current.on('dragend', async () => {
      if (!marker.current) return;
      
      const lngLat = marker.current.getLngLat();
      try {
        const address = await reverseGeocode(lngLat.lng, lngLat.lat);
        const location: Location = {
          latitude: lngLat.lat,
          longitude: lngLat.lng,
          address
        };
        
        setSelectedLocation(location);
        onLocationSelect?.(location);
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        const location: Location = {
          latitude: lngLat.lat,
          longitude: lngLat.lng
        };
        
        setSelectedLocation(location);
        onLocationSelect?.(location);
      }
    });
  };

  // Reverse geocode coordinates to get address
  const reverseGeocode = async (lng: number, lat: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      }
      
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  // Search for locations
  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&limit=5`
      );
      const data = await response.json();
      
      setSearchResults(data.features || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchLocations(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  // Handle search result selection
  const handleResultSelect = (result: any) => {
    const [lng, lat] = result.center;
    
    // Fly to location
    if (map.current) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 1000
      });
    }
    
    // Add marker
    addMarker(lng, lat);
    
    // Update state
    const location: Location = {
      latitude: lat,
      longitude: lng,
      address: result.place_name
    };
    
    setSelectedLocation(location);
    setSearchQuery(result.place_name);
    setShowResults(false);
    onLocationSelect?.(location);
  };

  // Clear selection
  const clearSelection = () => {
    if (marker.current) {
      marker.current.remove();
      marker.current = null;
    }
    
    setSelectedLocation(null);
    setSearchQuery('');
    setShowResults(false);
    onLocationSelect?.(null as any);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-10 bg-white shadow-lg border-gray-200"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setShowResults(false);
                }}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Search Results */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-20">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleResultSelect(result)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50"
                >
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {result.text}
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.place_name}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full rounded-lg overflow-hidden border border-gray-200"
        style={{ height }}
      />

      {/* Selected Location Info */}
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900 text-sm">
                  Selected Location
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {selectedLocation.address || `${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Lat: {selectedLocation.latitude.toFixed(6)}, Lng: {selectedLocation.longitude.toFixed(6)}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!selectedLocation && (
        <div className="absolute bottom-4 left-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-3 z-10">
          <div className="text-sm text-blue-800">
            <strong>How to select a location:</strong>
            <ul className="mt-1 text-xs space-y-1">
              <li>• Click anywhere on the map to select a location</li>
              <li>• Search for an address using the search bar above</li>
              <li>• Drag the marker to fine-tune the position</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapSelector;
export type { Location };