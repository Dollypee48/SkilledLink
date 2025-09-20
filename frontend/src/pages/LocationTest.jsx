import React, { useState } from 'react';
import { MapPin, RefreshCw, CheckCircle, XCircle, Globe, Shield, AlertTriangle } from 'lucide-react';
import LocationDetector from '../components/LocationDetector';
import AdvancedLocationDetector from '../components/AdvancedLocationDetector';
import useLocationDetection from '../hooks/useLocationDetection';

const LocationTest = () => {
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [error, setError] = useState(null);
  const { detectLocation, isDetecting, lastResult, isSupported } = useLocationDetection();

  const handleLocationDetected = (locationData) => {
    console.log('📍 Location detected:', locationData);
    setDetectedLocation(locationData);
    setError(null);
  };

  const handleLocationError = (errorMessage) => {
    console.error('❌ Location detection error:', errorMessage);
    setError(errorMessage);
    setDetectedLocation(null);
  };

  const handleHookTest = async () => {
    const result = await detectLocation();
    if (result.success) {
      handleLocationDetected({
        address: result.data.address.formattedAddress,
        city: result.data.address.city,
        state: result.data.address.state,
        country: result.data.address.country,
        coordinates: {
          latitude: result.data.position.latitude,
          longitude: result.data.position.longitude
        },
        accuracy: result.data.position.accuracy
      });
    } else {
      handleLocationError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Location Detection Test
          </h1>

          {/* Browser Support Check */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">Browser Support</h3>
            </div>
            <p className={`text-sm ${isSupported ? 'text-green-700' : 'text-red-700'}`}>
              {isSupported ? '✅ Geolocation is supported by this browser' : '❌ Geolocation is not supported by this browser'}
            </p>
          </div>

          {/* Basic Location Detector */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Location Detector</h3>
            <div className="p-4 border border-gray-200 rounded-lg">
              <LocationDetector
                onLocationDetected={handleLocationDetected}
                onError={handleLocationError}
                buttonText="Detect My Location"
                buttonSize="md"
              />
            </div>
          </div>

          {/* Advanced Location Detector */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Location Detector</h3>
            <div className="p-4 border border-gray-200 rounded-lg">
              <AdvancedLocationDetector
                onLocationDetected={handleLocationDetected}
                onError={handleLocationError}
                buttonText="Advanced Detection"
                buttonSize="md"
                showHelpText={true}
                showPermissionsInfo={true}
              />
            </div>
          </div>

          {/* Hook Test */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Hook Test</h3>
            <div className="p-4 border border-gray-200 rounded-lg">
              <button
                onClick={handleHookTest}
                disabled={isDetecting}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDetecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Detecting...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" />
                    <span>Test Hook</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Display */}
          <div className="space-y-6">
            {/* Success Result */}
            {detectedLocation && (
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900">Location Detected Successfully!</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Address:</p>
                    <p className="text-gray-900">{detectedLocation.address}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">City:</p>
                    <p className="text-gray-900">{detectedLocation.city}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">State:</p>
                    <p className="text-gray-900">{detectedLocation.state}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Country:</p>
                    <p className="text-gray-900">{detectedLocation.country}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Coordinates:</p>
                    <p className="text-gray-900">
                      {detectedLocation.coordinates.latitude.toFixed(6)}, {detectedLocation.coordinates.longitude.toFixed(6)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Accuracy:</p>
                    <p className="text-gray-900">{detectedLocation.accuracy} meters</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Result */}
            {error && (
              <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-900">Location Detection Failed</h3>
                </div>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Hook Result */}
            {lastResult && (
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">Hook Result</h3>
                </div>
                <pre className="text-sm text-blue-700 bg-white p-3 rounded border overflow-auto">
                  {JSON.stringify(lastResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>1. Click any of the "Detect" buttons to test location detection</p>
              <p>2. Allow location access when prompted by your browser</p>
              <p>3. The detected location will be displayed below</p>
              <p>4. If you get an error, check your browser's location permissions</p>
              <p>5. Make sure you have a stable internet connection</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationTest;
