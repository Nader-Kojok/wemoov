import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from './ui/button';
import { Input } from './ui/input';

import { MapPin, Navigation, Target, Plane } from 'lucide-react';

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface BookingMapSelectorProps {
  pickupLocation?: string;
  destination?: string;
  onPickupChange?: (location: string) => void;
  onDestinationChange?: (location: string) => void;
  height?: string;
  className?: string;
  showDestination?: boolean;
  showAirportButtons?: boolean;
}

const BookingMapSelector: React.FC<BookingMapSelectorProps> = ({
  pickupLocation = '',
  destination = '',
  onPickupChange,
  onDestinationChange,
  height = '500px',
  className = '',
  showDestination = true,
  showAirportButtons = false
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const pickupMarker = useRef<mapboxgl.Marker | null>(null);
  const destinationMarker = useRef<mapboxgl.Marker | null>(null);
  const [pickupSearchQuery, setPickupSearchQuery] = useState('');
  const [destinationSearchQuery, setDestinationSearchQuery] = useState('');
  const [pickupSearchResults, setPickupSearchResults] = useState<any[]>([]);
  const [destinationSearchResults, setDestinationSearchResults] = useState<any[]>([]);
  const [showPickupResults, setShowPickupResults] = useState(false);
  const [showDestinationResults, setShowDestinationResults] = useState(false);
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

    // Ensure map resizes to fill container
    map.current.on('load', () => {
      if (map.current) {
        map.current.resize();
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Resize map when height changes
  useEffect(() => {
    if (map.current) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        if (map.current) {
          map.current.resize();
        }
      }, 100);
    }
  }, [height]);

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
    
    // Default to pickup if no specific field is being edited
    const field = 'pickup';
    
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
  }, [onPickupChange, onDestinationChange]);

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

  // Handle pickup search input change
  const handlePickupSearchChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setPickupSearchQuery(query);
    setLocalPickup(query);
    onPickupChange?.(query);

    if (query.length < 2) {
      setPickupSearchResults([]);
      setShowPickupResults(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&country=SN&limit=5`
      );
      const data = await response.json();
      setPickupSearchResults(data.features || []);
      setShowPickupResults(true);
    } catch (error) {
      console.error('Error searching pickup locations:', error);
      setPickupSearchResults([]);
      setShowPickupResults(false);
    }
  }, [onPickupChange]);

  // Handle destination search input change
  const handleDestinationSearchChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setDestinationSearchQuery(query);
    setLocalDestination(query);
    onDestinationChange?.(query);

    if (query.length < 2) {
      setDestinationSearchResults([]);
      setShowDestinationResults(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&country=SN&limit=5`
      );
      const data = await response.json();
      setDestinationSearchResults(data.features || []);
      setShowDestinationResults(true);
    } catch (error) {
      console.error('Error searching destination locations:', error);
      setDestinationSearchResults([]);
      setShowDestinationResults(false);
    }
  }, [onDestinationChange]);

  // Handle pickup search result selection
  const handlePickupResultSelect = (result: any) => {
    const [longitude, latitude] = result.center;
    const locationString = result.place_name;

    setLocalPickup(locationString);
    setPickupSearchQuery(locationString);
    onPickupChange?.(locationString);
    addPickupMarker(longitude, latitude);
    setShowPickupResults(false);

    // Center map on selected location
    if (map.current) {
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: 15,
        duration: 1000
      });
    }
  };

  // Handle destination search result selection
  const handleDestinationResultSelect = (result: any) => {
    const [longitude, latitude] = result.center;
    const locationString = result.place_name;

    setLocalDestination(locationString);
    setDestinationSearchQuery(locationString);
    onDestinationChange?.(locationString);
    addDestinationMarker(longitude, latitude);
    setShowDestinationResults(false);

    // Center map on selected location
    if (map.current) {
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: 15,
        duration: 1000
      });
    }
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



  return (
    <div className={`space-y-3 ${className}`}>

      {/* Location Inputs */}
      <div className="grid grid-cols-1 gap-2">
        {/* Pickup Location */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-green-600" />
              <Input
                id="pickup"
                placeholder="Point de départ"
                value={pickupSearchQuery || localPickup}
                onChange={handlePickupSearchChange}
                onFocus={() => {
                  setPickupSearchQuery(localPickup);
                  if (localPickup.length >= 2) {
                    setShowPickupResults(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowPickupResults(false), 200);
                }}
                className="pl-10 pr-4 border-green-200 focus:border-green-500 focus:ring-green-500"
              />
              {/* Pickup Search Results */}
              {showPickupResults && pickupSearchResults.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-20">
                  {pickupSearchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handlePickupResultSelect(result)}
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
            {showAirportButtons && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  const airportAddress = 'Aéroport International Blaise Diagne (AIBD)';
                  setLocalPickup(airportAddress);
                  onPickupChange?.(airportAddress);
                }}
                className="shrink-0 border-blue-200 text-blue-600 hover:bg-blue-50"
                title="Aéroport AIBD"
              >
                <Plane className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Destination - Only show if showDestination is true */}
        {showDestination && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Target className="absolute left-3 top-3 h-4 w-4 text-red-600" />
                <Input
                  id="destination"
                  placeholder="Destination"
                  value={destinationSearchQuery || localDestination}
                  onChange={handleDestinationSearchChange}
                  onFocus={() => {
                    setDestinationSearchQuery(localDestination);
                    if (localDestination.length >= 2) {
                      setShowDestinationResults(true);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowDestinationResults(false), 200);
                  }}
                  className="pl-10 pr-4 border-red-200 focus:border-red-500 focus:ring-red-500"
                />
                {/* Destination Search Results */}
                {showDestinationResults && destinationSearchResults.length > 0 && (
                  <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-20">
                    {destinationSearchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => handleDestinationResultSelect(result)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50"
                      >
                        <div className="flex items-start space-x-3">
                          <Target className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
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
              {showAirportButtons && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const airportAddress = 'Aéroport International Blaise Diagne (AIBD)';
                    setLocalDestination(airportAddress);
                    onDestinationChange?.(airportAddress);
                  }}
                  className="shrink-0 border-blue-200 text-blue-600 hover:bg-blue-50"
                  title="Aéroport AIBD"
                >
                  <Plane className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full rounded-lg overflow-hidden border border-gray-200 flex-1"
        style={{ height, minHeight: height }}
      />


    </div>
  );
};

export default BookingMapSelector;