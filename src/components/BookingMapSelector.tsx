import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MapPin, Search, X, Navigation, Target, ArrowUpDown } from 'lucide-react';

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface BookingMapSelectorProps {
  pickupLocation?: string;
  destination?: string;
  onPickupChange?: (location: string) => void;
  onDestinationChange?: (location: string) => void;
  height?: string;
  className?: string;
}

const BookingMapSelector: React.FC<BookingMapSelectorProps> = ({
  pickupLocation = '',
  destination = '',
  onPickupChange,
  onDestinationChange,
  height = '400px',
  className = ''
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const pickupMarker = useRef<mapboxgl.Marker | null>(null);
  const destinationMarker = useRef<mapboxgl.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [activeField, setActiveField] = useState<'pickup' | 'destination' | null>(null);
  const [localPickup, setLocalPickup] = useState(pickupLocation);
  const [localDestination, setLocalDestination] = useState(destination);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-17.4441, 14.6928], // Default to Dakar, Senegal
      zoom: 10,
      attributionControl: false
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add click handler for location selection
    map.current.on('click', handleMapClick);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (pickupLocation && pickupLocation !== localPickup) {
      setLocalPickup(pickupLocation);
      updatePickupMarker(pickupLocation);
    }
  }, [pickupLocation]);

  useEffect(() => {
    if (destination && destination !== localDestination) {
      setLocalDestination(destination);
      updateDestinationMarker(destination);
    }
  }, [destination]);

  // Handle map click to select location
  const handleMapClick = useCallback(async (e: mapboxgl.MapMouseEvent) => {
    const { lng, lat } = e.lngLat;
    
    // If no active field, default to pickup
    const field = activeField || 'pickup';
    
    try {
      const address = await reverseGeocode(lng, lat);
      const locationString = address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      
      if (field === 'pickup') {
        setLocalPickup(locationString);
        onPickupChange?.(locationString);
        addPickupMarker(lng, lat);
      } else {
        setLocalDestination(locationString);
        onDestinationChange?.(locationString);
        addDestinationMarker(lng, lat);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      const locationString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      
      if (field === 'pickup') {
        setLocalPickup(locationString);
        onPickupChange?.(locationString);
        addPickupMarker(lng, lat);
      } else {
        setLocalDestination(locationString);
        onDestinationChange?.(locationString);
        addDestinationMarker(lng, lat);
      }
    }
  }, [activeField, onPickupChange, onDestinationChange]);

  // Add or update pickup marker
  const addPickupMarker = (lng: number, lat: number) => {
    if (!map.current) return;

    // Remove existing pickup marker
    if (pickupMarker.current) {
      pickupMarker.current.remove();
    }

    // Create new pickup marker (green)
    pickupMarker.current = new mapboxgl.Marker({
      color: '#10B981',
      draggable: true
    })
      .setLngLat([lng, lat])
      .addTo(map.current);

    // Handle marker drag
    pickupMarker.current.on('dragend', async () => {
      if (!pickupMarker.current) return;
      
      const lngLat = pickupMarker.current.getLngLat();
      try {
        const address = await reverseGeocode(lngLat.lng, lngLat.lat);
        const locationString = address || `${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)}`;
        setLocalPickup(locationString);
        onPickupChange?.(locationString);
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        const locationString = `${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)}`;
        setLocalPickup(locationString);
        onPickupChange?.(locationString);
      }
    });
  };

  // Add or update destination marker
  const addDestinationMarker = (lng: number, lat: number) => {
    if (!map.current) return;

    // Remove existing destination marker
    if (destinationMarker.current) {
      destinationMarker.current.remove();
    }

    // Create new destination marker (red)
    destinationMarker.current = new mapboxgl.Marker({
      color: '#EF4444',
      draggable: true
    })
      .setLngLat([lng, lat])
      .addTo(map.current);

    // Handle marker drag
    destinationMarker.current.on('dragend', async () => {
      if (!destinationMarker.current) return;
      
      const lngLat = destinationMarker.current.getLngLat();
      try {
        const address = await reverseGeocode(lngLat.lng, lngLat.lat);
        const locationString = address || `${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)}`;
        setLocalDestination(locationString);
        onDestinationChange?.(locationString);
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        const locationString = `${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)}`;
        setLocalDestination(locationString);
        onDestinationChange?.(locationString);
      }
    });
  };

  // Update pickup marker from address
  const updatePickupMarker = async (address: string) => {
    if (!address) return;
    
    // Try to parse coordinates first
    const coordMatch = address.match(/^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      addPickupMarker(lng, lat);
      return;
    }
    
    // Otherwise geocode the address
    try {
      const coords = await geocodeAddress(address);
      if (coords) {
        addPickupMarker(coords.lng, coords.lat);
      }
    } catch (error) {
      console.error('Error geocoding pickup address:', error);
    }
  };

  // Update destination marker from address
  const updateDestinationMarker = async (address: string) => {
    if (!address) return;
    
    // Try to parse coordinates first
    const coordMatch = address.match(/^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      addDestinationMarker(lng, lat);
      return;
    }
    
    // Otherwise geocode the address
    try {
      const coords = await geocodeAddress(address);
      if (coords) {
        addDestinationMarker(coords.lng, coords.lat);
      }
    } catch (error) {
      console.error('Error geocoding destination address:', error);
    }
  };

  // Geocode address to coordinates
  const geocodeAddress = async (address: string): Promise<{lng: number, lat: number} | null> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        return { lng, lat };
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
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

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&limit=5&country=SN`
      );
      const data = await response.json();
      
      setSearchResults(data.features || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
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
    const address = result.place_name;
    
    // Fly to location
    if (map.current) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 1000
      });
    }
    
    // Add marker based on active field
    if (activeField === 'destination') {
      setLocalDestination(address);
      onDestinationChange?.(address);
      addDestinationMarker(lng, lat);
    } else {
      setLocalPickup(address);
      onPickupChange?.(address);
      addPickupMarker(lng, lat);
    }
    
    setSearchQuery('');
    setShowResults(false);
    setActiveField(null);
  };

  // Get current location
  const getCurrentLocation = (field: 'pickup' | 'destination') => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const address = await reverseGeocode(longitude, latitude);
            const locationString = address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            
            if (field === 'pickup') {
              setLocalPickup(locationString);
              onPickupChange?.(locationString);
              addPickupMarker(longitude, latitude);
            } else {
              setLocalDestination(locationString);
              onDestinationChange?.(locationString);
              addDestinationMarker(longitude, latitude);
            }
            
            // Center map on location
            if (map.current) {
              map.current.flyTo({
                center: [longitude, latitude],
                zoom: 15,
                duration: 1000
              });
            }
          } catch (error) {
            console.error('Error getting current location:', error);
          }
        },
        () => {
          alert("Impossible d'obtenir votre position. Veuillez vérifier vos paramètres de géolocalisation.");
        }
      );
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  };

  // Swap pickup and destination
  const swapLocations = () => {
    const tempPickup = localPickup;
    const tempDestination = localDestination;
    
    setLocalPickup(tempDestination);
    setLocalDestination(tempPickup);
    onPickupChange?.(tempDestination);
    onDestinationChange?.(tempPickup);
    
    // Update markers
    if (tempDestination) updatePickupMarker(tempDestination);
    if (tempPickup) updateDestinationMarker(tempPickup);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder={`Rechercher ${activeField === 'destination' ? 'une destination' : 'un point de départ'}...`}
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-10 bg-white shadow-sm border-gray-200"
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

      {/* Location Inputs */}
      <div className="grid grid-cols-1 gap-3">
        {/* Pickup Location */}
        <div className="space-y-2">
          <Label htmlFor="pickup">Point de départ</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-green-600" />
              <Input
                id="pickup"
                placeholder="Cliquez sur la carte ou recherchez..."
                value={localPickup}
                onChange={(e) => {
                  setLocalPickup(e.target.value);
                  onPickupChange?.(e.target.value);
                }}
                onFocus={() => setActiveField('pickup')}
                className="pl-10 pr-4 border-green-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => getCurrentLocation('pickup')}
              className="shrink-0 border-green-200 text-green-600 hover:bg-green-50"
              title="Utiliser ma position actuelle"
            >
              <Navigation className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                setActiveField('pickup');
                setSearchQuery('');
              }}
              className="shrink-0 border-green-200 text-green-600 hover:bg-green-50"
              title="Rechercher sur la carte"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={swapLocations}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            disabled={!localPickup && !localDestination}
            title="Échanger départ et destination"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Échanger
          </Button>
        </div>

        {/* Destination */}
        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Target className="absolute left-3 top-3 h-4 w-4 text-red-600" />
              <Input
                id="destination"
                placeholder="Cliquez sur la carte ou recherchez..."
                value={localDestination}
                onChange={(e) => {
                  setLocalDestination(e.target.value);
                  onDestinationChange?.(e.target.value);
                }}
                onFocus={() => setActiveField('destination')}
                className="pl-10 pr-4 border-red-200 focus:border-red-500 focus:ring-red-500"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => getCurrentLocation('destination')}
              className="shrink-0 border-red-200 text-red-600 hover:bg-red-50"
              title="Utiliser ma position actuelle"
            >
              <Navigation className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                setActiveField('destination');
                setSearchQuery('');
              }}
              className="shrink-0 border-red-200 text-red-600 hover:bg-red-50"
              title="Rechercher sur la carte"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full rounded-lg overflow-hidden border border-gray-200"
        style={{ height }}
      />

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="text-sm text-blue-800">
          <strong>Instructions:</strong>
          <ul className="mt-1 text-xs space-y-1">
            <li>• <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>Vert = Point de départ</li>
            <li>• <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>Rouge = Destination</li>
            <li>• Cliquez sur la carte pour placer un marqueur</li>
            <li>• Faites glisser les marqueurs pour ajuster la position</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookingMapSelector;