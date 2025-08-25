import React, { useState } from 'react';
import MapSelector, { type Location } from '../components/MapSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

const MapDemo: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showMap, setShowMap] = useState(true);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    console.log('Selected location:', location);
  };

  const resetMap = () => {
    setSelectedLocation(null);
    setShowMap(false);
    setTimeout(() => setShowMap(true), 100); // Force re-render
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            MapSelector Component Demo
          </h1>
          <p className="text-gray-600">
            Interactive Mapbox location picker with search and click-to-select functionality
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Location Picker</span>
                </CardTitle>
                <CardDescription>
                  Click on the map, search for an address, or drag the marker to select a location
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showMap && (
                  <MapSelector
                    onLocationSelect={handleLocationSelect}
                    height="500px"
                    className="w-full"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            {/* Selected Location Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Navigation className="h-5 w-5" />
                  <span>Selected Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedLocation ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Address:</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedLocation.address || 'No address available'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Coordinates:</label>
                      <p className="text-sm text-gray-900 mt-1">
                        Lat: {selectedLocation.latitude.toFixed(6)}
                      </p>
                      <p className="text-sm text-gray-900">
                        Lng: {selectedLocation.longitude.toFixed(6)}
                      </p>
                    </div>
                    <div className="pt-2">
                      <Button onClick={resetMap} variant="outline" size="sm">
                        Reset Map
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No location selected yet. Click on the map or search for a location.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Click anywhere on the map to select a location</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Search for addresses and places</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Drag markers to fine-tune position</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Automatic reverse geocoding</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Smooth map animations</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Mobile-friendly interface</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Usage Example */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Example</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-3 rounded-md overflow-x-auto">
{`<MapSelector
  onLocationSelect={(location) => {
    console.log(location);
  }}
  height="400px"
  initialLocation={{
    latitude: 40.7128,
    longitude: -74.0060
  }}
/>`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapDemo;