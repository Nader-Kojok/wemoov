import React, { useState, useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Navigation, RotateCcw, Search } from 'lucide-react'
import 'mapbox-gl/dist/mapbox-gl.css'

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

interface MapSelectorProps {
  pickupLocation: string
  destination: string
  onPickupChange: (location: string) => void
  onDestinationChange: (location: string) => void
}

interface LocationResult {
  display_name: string
  lat: string
  lon: string
  place_type?: string
}

const MapSelector: React.FC<MapSelectorProps> = ({
  pickupLocation,
  destination,
  onPickupChange,
  onDestinationChange
}) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const pickupMarker = useRef<mapboxgl.Marker | null>(null)
  const destinationMarker = useRef<mapboxgl.Marker | null>(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<LocationResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeInput, setActiveInput] = useState<'pickup' | 'destination' | null>(null)
  const [showResults, setShowResults] = useState(false)



  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-17.4467, 14.6928], // Dakar coordinates
        zoom: 12
      })

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

      // Handle map click for location selection
      map.current.on('click', (e) => {
        if (activeInput) {
          const { lng, lat } = e.lngLat
          const coordString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          
          if (activeInput === 'pickup') {
            onPickupChange(coordString)
          } else {
            onDestinationChange(coordString)
          }
          
          setActiveInput(null)
          setSearchQuery('')
          setSearchResults([])
          setShowResults(false)
          map.current!.getCanvas().style.cursor = ''
        }
      })

      // Handle map errors
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e.error)
        if (mapContainer.current) {
          mapContainer.current.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f3f4f6; color: #6b7280; text-align: center; padding: 20px;">
              <div>
                <div style="font-size: 48px; margin-bottom: 16px;">🗺️</div>
                <div style="font-weight: 600; margin-bottom: 8px; color: #ef4444;">
                  Erreur de chargement de la carte
                </div>
                <div style="font-size: 14px;">
                  Utilisez la recherche d'adresses ci-dessus
                </div>
              </div>
            </div>
          `
        }
      })

    } catch (error) {
      console.error('Failed to initialize map:', error)
    }

    return () => {
      map.current?.remove()
    }
  }, [])

  // Update cursor when activeInput changes
  useEffect(() => {
    if (map.current) {
      map.current.getCanvas().style.cursor = activeInput ? 'crosshair' : ''
    }
  }, [activeInput])

  // Parse coordinates from string
  const parseCoordinates = (coordString: string): [number, number] | null => {
    if (!coordString) return null
    const coords = coordString.split(',').map(s => parseFloat(s.trim()))
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      return [coords[0], coords[1]] // [lat, lng]
    }
    return null
  }

  // Update pickup marker
  useEffect(() => {
    const coords = parseCoordinates(pickupLocation)
    
    if (pickupMarker.current) {
      pickupMarker.current.remove()
      pickupMarker.current = null
    }
    
    if (coords && map.current) {
      pickupMarker.current = new mapboxgl.Marker({ color: '#22c55e' })
        .setLngLat([coords[1], coords[0]]) // [lng, lat]
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div style="text-align: center;">
              <div style="font-weight: bold; color: #22c55e; margin-bottom: 4px;">Point de départ</div>
              <div style="font-size: 12px; color: #666;">${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}</div>
            </div>
          `)
        )
        .addTo(map.current)
    }
  }, [pickupLocation])

  // Update destination marker
  useEffect(() => {
    const coords = parseCoordinates(destination)
    
    if (destinationMarker.current) {
      destinationMarker.current.remove()
      destinationMarker.current = null
    }
    
    if (coords && map.current) {
      destinationMarker.current = new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat([coords[1], coords[0]]) // [lng, lat]
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div style="text-align: center;">
              <div style="font-weight: bold; color: #ef4444; margin-bottom: 4px;">Destination</div>
              <div style="font-size: 12px; color: #666;">${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}</div>
            </div>
          `)
        )
        .addTo(map.current)
        
      // Fit map to show both markers if both exist
      const pickupCoords = parseCoordinates(pickupLocation)
      if (pickupCoords) {
        const bounds = new mapboxgl.LngLatBounds()
        bounds.extend([pickupCoords[1], pickupCoords[0]])
        bounds.extend([coords[1], coords[0]])
        map.current.fitBounds(bounds, { padding: 50 })
      }
    }
  }, [destination, pickupLocation])

  // Search for locations
  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    
    try {
      // Try Mapbox Geocoding API first
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `country=sn&` +
        `proximity=-17.4467,14.6928&` +
        `bbox=-17.6,-12.0,-11.0,16.8&` +
        `limit=5&` +
        `access_token=${mapboxgl.accessToken}`
      )
      
      if (response.ok) {
        const data = await response.json()
        const results = data.features?.map((feature: any) => ({
          display_name: feature.place_name,
          lat: feature.center[1].toString(),
          lon: feature.center[0].toString(),
          place_type: feature.place_type?.[0] || 'place'
        })) || []
        setSearchResults(results)
      } else {
         // No results from API
         setSearchResults([])
       }
    } catch (error) {
       console.error('Search error:', error)
       // No fallback results
       setSearchResults([])
     } finally {
      setIsSearching(false)
    }
  }

  // Handle search input change with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery && activeInput) {
        searchLocations(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, activeInput])

  // Select a location
  const selectLocation = (result: LocationResult) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    const coordString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    
    if (activeInput === 'pickup') {
      onPickupChange(coordString)
    } else if (activeInput === 'destination') {
      onDestinationChange(coordString)
    }
    
    setSearchQuery('')
    setSearchResults([])
    setActiveInput(null)
    setShowResults(false)
    
    // Center map on selected location
    if (map.current) {
      map.current.flyTo({ center: [lng, lat], zoom: 14 })
    }
  }

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const coordString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          onPickupChange(coordString)
          
          if (map.current) {
            map.current.flyTo({ center: [longitude, latitude], zoom: 14 })
          }
        },
        (error) => {
          console.error('Geolocation error:', error)
          alert('Impossible d\'obtenir votre position. Veuillez vérifier vos paramètres de géolocalisation.')
        }
      )
    } else {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.')
    }
  }

  // Reset all selections
  const resetSelections = () => {
    onPickupChange('')
    onDestinationChange('')
    setActiveInput(null)
    setSearchQuery('')
    setSearchResults([])
    setShowResults(false)
    
    if (pickupMarker.current) {
      pickupMarker.current.remove()
      pickupMarker.current = null
    }
    if (destinationMarker.current) {
      destinationMarker.current.remove()
      destinationMarker.current = null
    }
    
    if (map.current) {
      map.current.flyTo({ center: [-17.4467, 14.6928], zoom: 12 })
    }
  }

  return (
    <div className="space-y-4">
      {/* Location Selection */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Pickup Location */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-600" />
              Point de départ
            </Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  placeholder={activeInput === 'pickup' ? "Tapez une adresse ou cliquez sur la carte" : (pickupLocation ? `Lat: ${parseCoordinates(pickupLocation)?.[0].toFixed(4)}, Lng: ${parseCoordinates(pickupLocation)?.[1].toFixed(4)}` : "Cliquez ici puis sur la carte")}
                  value={activeInput === 'pickup' ? searchQuery : ''}
                  onChange={(e) => {
                    if (activeInput === 'pickup') {
                      setSearchQuery(e.target.value)
                      setShowResults(true)
                    }
                  }}
                  onFocus={() => {
                    setActiveInput('pickup')
                    setSearchQuery('')
                    setShowResults(false)
                  }}
                  className={`${activeInput === 'pickup' ? 'ring-2 ring-green-500 border-green-500' : ''} ${pickupLocation ? 'bg-green-50 text-green-800' : ''}`}
                />
                {activeInput === 'pickup' && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                className="shrink-0 hover:bg-green-50 hover:border-green-300"
                title="Utiliser ma position actuelle"
              >
                <Navigation className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-600" />
              Destination
            </Label>
            <div className="relative">
              <Input
                placeholder={activeInput === 'destination' ? "Tapez une adresse ou cliquez sur la carte" : (destination ? `Lat: ${parseCoordinates(destination)?.[0].toFixed(4)}, Lng: ${parseCoordinates(destination)?.[1].toFixed(4)}` : "Cliquez ici puis sur la carte")}
                value={activeInput === 'destination' ? searchQuery : ''}
                onChange={(e) => {
                  if (activeInput === 'destination') {
                    setSearchQuery(e.target.value)
                    setShowResults(true)
                  }
                }}
                onFocus={() => {
                  setActiveInput('destination')
                  setSearchQuery('')
                  setShowResults(false)
                }}
                className={`${activeInput === 'destination' ? 'ring-2 ring-red-500 border-red-500' : ''} ${destination ? 'bg-red-50 text-red-800' : ''}`}
              />
              {activeInput === 'destination' && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetSelections}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Réinitialiser
            </Button>
            {activeInput && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveInput(null)
                  setSearchQuery('')
                  setSearchResults([])
                  setShowResults(false)
                  if (map.current) {
                    map.current.getCanvas().style.cursor = ''
                  }
                }}
              >
                Annuler sélection
              </Button>
            )}
          </div>

          {/* Instructions */}
          {activeInput && (
            <div className={`text-sm p-3 rounded-lg border-2 border-dashed ${activeInput === 'pickup' ? 'text-green-700 bg-green-50 border-green-300' : 'text-red-700 bg-red-50 border-red-300'}`}>
              <div className="flex items-center gap-2 font-medium mb-1">
                {activeInput === 'pickup' ? '🟢' : '🔴'}
                Mode sélection {activeInput === 'pickup' ? 'DÉPART' : 'DESTINATION'} activé
              </div>
              <div className="text-xs">
                Cliquez n'importe où sur la carte pour placer votre point
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results - Only show when searching */}
       {(showResults && activeInput && searchQuery && searchResults.length > 0) && (
         <Card className="border-l-4 border-l-blue-500">
           <CardContent className="p-4">
             <div className="space-y-2 max-h-48 overflow-y-auto">
               <Label className="text-sm font-medium flex items-center gap-2 text-blue-700">
                 <Search className="h-4 w-4" />
                 Résultats de recherche
                 {isSearching && <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />}
               </Label>
               
               {searchResults.map((result, index) => {
                 const getIcon = (type?: string) => {
                   switch(type) {
                     case 'airport': return '✈️'
                     case 'district': return '🏙️'
                     case 'city': return '🏘️'
                     case 'transport': return '🚌'
                     default: return '📍'
                   }
                 }
                 
                 return (
                   <button
                     key={index}
                     onClick={() => selectLocation(result)}
                     className="w-full text-left p-2 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200 transition-colors flex items-center gap-2"
                   >
                     <span className="text-sm">{getIcon(result.place_type)}</span>
                     <div className="flex-1 min-w-0">
                       <div className="font-medium text-sm text-gray-900 truncate">
                         {result.display_name}
                       </div>
                       <div className="text-xs text-gray-500">
                         {parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}
                       </div>
                     </div>
                   </button>
                 )
               })}
             </div>
           </CardContent>
         </Card>
       )}

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div 
            ref={mapContainer} 
            className="h-96 w-full rounded-lg overflow-hidden"
            style={{ minHeight: '400px' }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default MapSelector