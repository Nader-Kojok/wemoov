import React, { useState, useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Navigation, RotateCcw, Search } from 'lucide-react'
import 'mapbox-gl/dist/mapbox-gl.css'

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoidGVzdCIsImEiOiJjazl2bWZ6ZWowMDFvM29xbzBkdXNxZGZoIn0.example'

interface MapSelectorProps {
  pickupLocation: string
  destination: string
  onPickupChange: (location: string) => void
  onDestinationChange: (location: string) => void
}

// Mapbox marker colors
const PICKUP_COLOR = '#22c55e' // Green
const DESTINATION_COLOR = '#ef4444' // Red

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
  
  const [mode, setMode] = useState<'pickup' | 'destination' | null>(null)
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null)
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(true)

  // Predefined locations for Senegal
  const senegalLocations = [
    { name: "Aéroport International Blaise Diagne (AIBD)", coords: [14.6700, -17.0732], type: "airport" },
    { name: "Plateau - Centre-ville de Dakar", coords: [14.6928, -17.4467], type: "district" },
    { name: "Almadies", coords: [14.7392, -17.5297], type: "district" },
    { name: "Medina - Dakar", coords: [14.6892, -17.4581], type: "district" },
    { name: "Point E - Dakar", coords: [14.7167, -17.4500], type: "district" },
    { name: "Parcelles Assainies", coords: [14.7833, -17.4167], type: "district" },
    { name: "Guédiawaye", coords: [14.7667, -17.4167], type: "city" },
    { name: "Pikine", coords: [14.7500, -17.4000], type: "city" },
    { name: "Rufisque", coords: [14.7167, -17.2667], type: "city" },
    { name: "Thiès", coords: [14.7889, -16.9261], type: "city" },
    { name: "Saint-Louis", coords: [16.0333, -16.5000], type: "city" },
    { name: "Kaolack", coords: [14.1500, -16.0667], type: "city" },
    { name: "Ziguinchor", coords: [12.5833, -16.2667], type: "city" },
    { name: "Touba", coords: [14.8500, -15.8833], type: "city" },
    { name: "Mbour", coords: [14.4167, -16.9667], type: "city" },
    { name: "Gare routière Pompiers - Dakar", coords: [14.6928, -17.4467], type: "transport" },
    { name: "Port de Dakar", coords: [14.6667, -17.4333], type: "transport" },
    { name: "Université Cheikh Anta Diop (UCAD)", coords: [14.6928, -17.4467], type: "education" },
    { name: "Hôpital Principal de Dakar", coords: [14.6928, -17.4467], type: "health" },
    { name: "Monument de la Renaissance", coords: [14.7167, -17.4833], type: "monument" }
  ]



  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return

    // Debug token
    console.log('Mapbox token:', import.meta.env.VITE_MAPBOX_TOKEN ? 'Token loaded' : 'No token found')
    console.log('Token starts with:', import.meta.env.VITE_MAPBOX_TOKEN?.substring(0, 10))

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-17.4467, 14.6928], // Dakar coordinates [lng, lat]
        zoom: 12
      })

      // Handle map load errors
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e.error)
        console.error('Error details:', e)
        
        // Type the error object properly for Mapbox errors
        const mapboxError = e.error as any
        
        // Check if it's a token/authentication error (403, 401, or token-related)
        const isTokenError = mapboxError?.status === 403 || 
                            mapboxError?.status === 401 || 
                            mapboxError?.message?.includes('token') || 
                            mapboxError?.message?.includes('Unauthorized') ||
                            mapboxError?.message?.includes('Forbidden')
        
        // Check if it's specifically a URL restriction error (403 on tile requests)
        const isUrlRestrictionError = mapboxError?.status === 403 && 
                                     mapboxError?.url?.includes('api.mapbox.com')
        
        // Fallback: show a detailed error message
        if (mapContainer.current) {
          const errorTitle = isUrlRestrictionError ? 
            'Erreur d\'autorisation Mapbox' : 
            (isTokenError ? 'Erreur d\'authentification Mapbox' : 'Carte temporairement indisponible')
          
          const errorMessage = isUrlRestrictionError ?
            'Le domaine actuel n\'est pas autorisé pour ce token Mapbox' :
            (isTokenError ? 'Le token Mapbox a des restrictions d\'URL' : 'Utilisez la recherche d\'adresses ci-dessus')
          
          const errorHelp = isUrlRestrictionError ?
            'Ajoutez votre domaine Vercel dans console.mapbox.com → Token → URL restrictions' :
            (isTokenError ? 'Configurez les URL autorisées sur console.mapbox.com' : '')
        
          mapContainer.current.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f3f4f6; color: #6b7280; text-align: center; padding: 20px;">
              <div>
                <div style="font-size: 48px; margin-bottom: 16px;">🗺️</div>
                <div style="font-weight: 600; margin-bottom: 8px; color: #ef4444;">
                  ${errorTitle}
                </div>
                <div style="font-size: 14px; margin-bottom: 8px;">
                  ${errorMessage}
                </div>
                <div style="font-size: 12px; color: #9ca3af; line-height: 1.4;">
                  ${errorHelp}
                </div>
                ${isUrlRestrictionError ? `
                <div style="margin-top: 12px; padding: 8px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; font-size: 11px; color: #92400e;">
                  <strong>Solution:</strong> Ajoutez <code style="background: #fff; padding: 2px 4px; border-radius: 3px;">${window.location.origin}</code> aux URL autorisées
                </div>
                ` : ''}
              </div>
            </div>
          `
        }
      })

      // Add load success handler
      map.current.on('load', () => {
        console.log('Mapbox map loaded successfully!')
      })
      
    } catch (error) {
      console.error('Failed to initialize Mapbox:', error)
      // Fallback UI
      if (mapContainer.current) {
        mapContainer.current.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f3f4f6; color: #6b7280; text-align: center; padding: 20px;">
            <div>
              <div style="font-size: 48px; margin-bottom: 16px;">🗺️</div>
              <div style="font-weight: 600; margin-bottom: 8px;">Erreur d'initialisation</div>
              <div style="font-size: 14px;">Utilisez la recherche d'adresses ci-dessus</div>
            </div>
          </div>
        `
      }
      return
    }

    // Add click handler
    if (map.current) {
      map.current.on('click', (e) => {
        if (mode && e.lngLat) {
          const { lng, lat } = e.lngLat
          handleLocationSelect(lat, lng)
        }
      })
    }

    // Change cursor when in selection mode
    if (map.current) {
      map.current.on('mouseenter', () => {
        if (mode && map.current && map.current.getCanvas()) {
          try {
            map.current.getCanvas().style.cursor = 'crosshair'
          } catch (error) {
            console.warn('Could not update cursor on mouseenter:', error)
          }
        }
      })

      map.current.on('mouseleave', () => {
        if (map.current && map.current.getCanvas()) {
          try {
            map.current.getCanvas().style.cursor = ''
          } catch (error) {
            console.warn('Could not update cursor on mouseleave:', error)
          }
        }
      })
    }

    return () => {
      map.current?.remove()
    }
  }, [])

  // Update cursor based on mode
  useEffect(() => {
    if (map.current && map.current.getCanvas()) {
      try {
        map.current.getCanvas().style.cursor = mode ? 'crosshair' : ''
      } catch (error) {
        console.warn('Could not update cursor style:', error)
      }
    }
  }, [mode])

  // Parse coordinates from string
  const parseCoordinates = (coordString: string): [number, number] | null => {
    if (!coordString) return null
    const coords = coordString.split(',').map(s => parseFloat(s.trim()))
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      return [coords[0], coords[1]]
    }
    return null
  }

  // Update coordinates when props change
  useEffect(() => {
    const coords = parseCoordinates(pickupLocation)
    setPickupCoords(coords)
    
    if (coords && map.current) {
      // Remove existing pickup marker
      if (pickupMarker.current) {
        pickupMarker.current.remove()
      }
      
      // Add new pickup marker
      pickupMarker.current = new mapboxgl.Marker({ color: PICKUP_COLOR })
        .setLngLat([coords[1], coords[0]]) // [lng, lat]
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div style="text-align: center;">
            <div style="font-weight: bold; color: ${PICKUP_COLOR}; margin-bottom: 4px;">Point de départ</div>
            <div style="font-size: 12px; color: #666;">${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}</div>
          </div>
        `))
        .addTo(map.current)
    }
  }, [pickupLocation])

  useEffect(() => {
    const coords = parseCoordinates(destination)
    setDestinationCoords(coords)
    
    if (coords && map.current) {
      // Remove existing destination marker
      if (destinationMarker.current) {
        destinationMarker.current.remove()
      }
      
      // Add new destination marker
      destinationMarker.current = new mapboxgl.Marker({ color: DESTINATION_COLOR })
        .setLngLat([coords[1], coords[0]]) // [lng, lat]
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div style="text-align: center;">
            <div style="font-weight: bold; color: ${DESTINATION_COLOR}; margin-bottom: 4px;">Destination</div>
            <div style="font-size: 12px; color: #666;">${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}</div>
          </div>
        `))
        .addTo(map.current)
    }
  }, [destination])

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation([latitude, longitude])
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Impossible d\'obtenir votre position. Veuillez vérifier vos paramètres de géolocalisation.')
        }
      )
    } else {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.')
    }
  }

  // Enhanced search using Mapbox Geocoding API
  const searchAddress = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowSuggestions(true)
      return
    }

    setIsSearching(true)
    setShowSuggestions(false)
    
    try {
      // Search with Mapbox Geocoding API (more accurate for Senegal)
      let apiResults = []
      try {
        // Using Mapbox Geocoding API with focus on Senegal
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
          `country=sn&` +
          `proximity=-17.4467,14.6928&` + // Dakar coordinates for proximity bias
          `bbox=-17.6,-12.0,-11.0,16.8&` + // Senegal bounding box
          `limit=5&` +
          `access_token=${import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoidGVzdCIsImEiOiJjazl2bWZ6ZWowMDFvM29xbzBkdXNxZGZoIn0.example'}` // Add your Mapbox token to .env file
        )
        
        if (response.ok) {
          const data = await response.json()
          apiResults = data.features?.map((feature: any) => ({
            display_name: feature.place_name,
            lat: feature.center[1].toString(),
            lon: feature.center[0].toString(),
            place_type: feature.place_type?.[0] || 'place',
            isMapbox: true
          })) || []
        }
      } catch (apiError) {
        console.warn('API Mapbox non disponible, recherche locale uniquement')
      }

      // If no API results or API failed, use local search as fallback
      if (apiResults.length === 0) {
        const localResults = senegalLocations
          .filter(location => 
            location.name.toLowerCase().includes(query.toLowerCase()) ||
            location.type.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5)
          .map(location => ({
            display_name: location.name,
            lat: location.coords[0].toString(),
            lon: location.coords[1].toString(),
            type: location.type,
            isLocal: true
          }))
        setSearchResults(localResults)
      } else {
        setSearchResults(apiResults)
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      // Complete fallback to local results
      const localResults = senegalLocations
        .filter(location => location.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
        .map(location => ({
          display_name: location.name,
          lat: location.coords[0].toString(),
          lon: location.coords[1].toString(),
          type: location.type,
          isLocal: true
        }))
      setSearchResults(localResults)
    } finally {
      setIsSearching(false)
    }
  }

  // Handle search input change with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchAddress(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Select search result
  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    const coordString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    
    if (mode === 'pickup') {
      onPickupChange(coordString)
      setPickupCoords([lat, lng])
    } else if (mode === 'destination') {
      onDestinationChange(coordString)
      setDestinationCoords([lat, lng])
    }
    
    setSearchQuery('')
    setSearchResults([])
    setMode(null)
  }

  // Handle location selection from map click
  const handleLocationSelect = (lat: number, lng: number) => {
    const coordString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    if (mode === 'pickup') {
      onPickupChange(coordString)
      setPickupCoords([lat, lng])
    } else if (mode === 'destination') {
      onDestinationChange(coordString)
      setDestinationCoords([lat, lng])
    }
    setMode(null)
  }

  // Use user location for pickup
  const useCurrentLocationForPickup = () => {
    if (userLocation) {
      const [lat, lng] = userLocation
      const coordString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      onPickupChange(coordString)
      setPickupCoords([lat, lng])
    } else {
      getCurrentLocation()
    }
  }

  // Reset selections
  const resetSelections = () => {
    onPickupChange('')
    onDestinationChange('')
    setPickupCoords(null)
    setDestinationCoords(null)
    setMode(null)
    
    // Remove markers
    if (pickupMarker.current) {
      pickupMarker.current.remove()
      pickupMarker.current = null
    }
    if (destinationMarker.current) {
      destinationMarker.current.remove()
      destinationMarker.current = null
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Bar - Always visible */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-blue-600" />
              <Label className="text-sm font-medium text-blue-900">
                Rechercher une adresse ou un lieu
              </Label>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Ex: Plateau, Almadies, Aéroport AIBD..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {isSearching && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                </div>
              )}
            </div>
            
            {/* Popular Suggestions - Show when no search */}
            {showSuggestions && !searchQuery && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                <p className="text-xs text-blue-700 mb-2">Destinations populaires :</p>
                {senegalLocations.slice(0, 6).map((location, index) => {
                  const getIcon = (type: string) => {
                    switch(type) {
                      case 'airport': return '✈️'
                      case 'district': return '🏙️'
                      case 'city': return '🏘️'
                      case 'transport': return '🚌'
                      case 'education': return '🎓'
                      case 'health': return '🏥'
                      case 'monument': return '🏛️'
                      default: return '📍'
                    }
                  }
                  
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        const result = {
                          display_name: location.name,
                          lat: location.coords[0].toString(),
                          lon: location.coords[1].toString(),
                          isLocal: true
                        }
                        if (!pickupCoords) {
                          setMode('pickup')
                          selectSearchResult(result)
                        } else if (!destinationCoords) {
                          setMode('destination')
                          selectSearchResult(result)
                        } else {
                          setMode('destination')
                          selectSearchResult(result)
                        }
                      }}
                      className="w-full text-left p-2 hover:bg-blue-100 rounded border border-transparent hover:border-blue-300 transition-colors flex items-center space-x-2"
                    >
                      <span className="text-lg">{getIcon(location.type)}</span>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-blue-800">
                          {location.name}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
            
            {/* Search Results */}
            {searchResults.length > 0 && !showSuggestions && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                <p className="text-xs text-blue-700 mb-2">Résultats de recherche :</p>
                {searchResults.map((result, index) => {
                  const getIcon = (result: any) => {
                    if (result.isLocal) {
                      switch(result.type) {
                        case 'airport': return '✈️'
                        case 'district': return '🏙️'
                        case 'city': return '🏘️'
                        case 'transport': return '🚌'
                        case 'education': return '🎓'
                        case 'health': return '🏥'
                        case 'monument': return '🏛️'
                        default: return '📍'
                      }
                    }
                    if (result.isMapbox) {
                      switch(result.place_type) {
                        case 'country': return '🇸🇳'
                        case 'region': return '🗺️'
                        case 'place': return '🏘️'
                        case 'district': return '🏙️'
                        case 'locality': return '🏘️'
                        case 'neighborhood': return '🏠'
                        case 'address': return '📍'
                        case 'poi': return '📌'
                        default: return '🔍'
                      }
                    }
                    return '🔍'
                  }
                  
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (!pickupCoords) {
                          setMode('pickup')
                          selectSearchResult(result)
                        } else if (!destinationCoords) {
                          setMode('destination')
                          selectSearchResult(result)
                        } else {
                          setMode('destination')
                          selectSearchResult(result)
                        }
                      }}
                      className="w-full text-left p-2 hover:bg-blue-100 rounded border border-transparent hover:border-blue-300 transition-colors flex items-center space-x-2"
                    >
                      <span className="text-lg">{getIcon(result)}</span>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-blue-800">
                          {result.display_name.split(',')[0]}
                        </div>
                        <div className="text-xs text-blue-600 truncate">
                          {result.display_name}
                        </div>
                        {result.isLocal && (
                          <span className="inline-block bg-green-100 text-green-700 text-xs px-1 rounded mt-1">
                            Suggestion locale
                          </span>
                        )}
                        {result.isMapbox && (
                          <span className="inline-block bg-blue-100 text-blue-700 text-xs px-1 rounded mt-1">
                            Mapbox
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
            
            {searchQuery && !isSearching && searchResults.length === 0 && !showSuggestions && (
              <p className="text-sm text-gray-500 italic">
                Aucun résultat trouvé. Essayez avec un autre terme.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Simplified Control buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if (!pickupCoords) {
              setMode('pickup')
            } else {
              setMode('destination')
            }
          }}
          className="bg-white hover:bg-blue-50 border-blue-200"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Cliquer sur la carte
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if (!pickupCoords) {
              getCurrentLocation()
              setTimeout(() => {
                if (userLocation) {
                  const [lat, lng] = userLocation
                  const coordString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
                  onPickupChange(coordString)
                  setPickupCoords([lat, lng])
                }
              }, 1000)
            } else {
              useCurrentLocationForPickup()
            }
          }}
          className="bg-white hover:bg-green-50 border-green-200"
        >
          <Navigation className="h-4 w-4 mr-2" />
          Ma position
        </Button>
        
        {(pickupCoords || destinationCoords) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetSelections}
            className="bg-white hover:bg-red-50 border-red-200"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Recommencer
          </Button>
        )}
      </div>

      {/* Dynamic Instructions */}
      {!pickupCoords && !destinationCoords && (
        <div className="text-center py-2">
          <p className="text-sm text-gray-600">
            💡 <strong>Commencez par rechercher une adresse</strong> ou cliquez sur "Ma position"
          </p>
        </div>
      )}
      
      {pickupCoords && !destinationCoords && (
        <div className="text-center py-2 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-700">
            ✅ Point de départ sélectionné • <strong>Maintenant, choisissez votre destination</strong>
          </p>
        </div>
      )}
      
      {pickupCoords && destinationCoords && (
        <div className="text-center py-2 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            🎉 <strong>Parfait !</strong> Votre itinéraire est défini. Vous pouvez continuer.
          </p>
        </div>
      )}

      {/* Mapbox Map */}
      <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-200">
        <div ref={mapContainer} className="w-full h-full" />
      </div>

      {/* Selected coordinates display */}
      {(pickupCoords || destinationCoords) && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Coordonnées sélectionnées :</h4>
            <div className="space-y-1 text-sm">
              {pickupCoords && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Départ :</span>
                  <span className="text-gray-600">{pickupLocation}</span>
                </div>
              )}
              {destinationCoords && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium">Destination :</span>
                  <span className="text-gray-600">{destination}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MapSelector