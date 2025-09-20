import React, { useState } from 'react';
import { MapPin, Loader2, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import geolocationService from '../utils/geolocationService';

const LocationDetector = ({ 
  onLocationDetected, 
  onError, 
  disabled = false,
  className = "",
  showButton = true,
  buttonText = "Detect My Location",
  buttonSize = "md"
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const handleDetectLocation = async () => {
    if (disabled || isDetecting) return;

    try {
      setIsDetecting(true);
      setLastResult(null);

      console.log('🌍 Starting location detection...');

      // Check if geolocation is supported
      if (!geolocationService.isGeolocationSupported()) {
        throw new Error('Geolocation is not supported by this browser');
      }

      // Check permissions first
      const permissions = await geolocationService.checkPermissions();
      if (!permissions.granted) {
        if (permissions.reason === 'denied') {
          throw new Error('Location access denied. Please enable location permissions in your browser settings and try again.');
        } else if (permissions.reason === 'unavailable') {
          throw new Error('Location service is unavailable. Please check your internet connection and try again.');
        }
      }

      // Get location and address
      const result = await geolocationService.getLocationAndAddress();

      if (result.success) {
        console.log('✅ Location detected successfully:', result);
        setLastResult({ success: true, data: result });
        
        // Call the callback with the detected location data
        if (onLocationDetected) {
          onLocationDetected({
            address: result.address.formattedAddress,
            city: result.address.city,
            state: result.address.state,
            country: result.address.country,
            coordinates: {
              latitude: result.position.latitude,
              longitude: result.position.longitude
            },
            accuracy: result.position.accuracy
          });
        }
      } else {
        throw new Error(result.error || 'Failed to detect location');
      }
    } catch (error) {
      console.error('❌ Location detection failed:', error);
      setLastResult({ success: false, error: error.message });
      
      if (onError) {
        onError(error.message);
      }
    } finally {
      setIsDetecting(false);
    }
  };

  const getButtonSizeClasses = () => {
    switch (buttonSize) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const getIconSize = () => {
    switch (buttonSize) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-5 h-5';
      default:
        return 'w-4 h-4';
    }
  };

  if (!showButton) {
    return null;
  }

  return (
    <div className={`location-detector ${className}`}>
      <button
        onClick={handleDetectLocation}
        disabled={disabled || isDetecting}
        className={`
          flex items-center gap-2 
          ${getButtonSizeClasses()}
          bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] 
          hover:from-[#1E2A4A] hover:to-[#151E3D]
          text-white rounded-lg font-medium
          transition-all duration-200 
          shadow-md hover:shadow-lg
          disabled:opacity-50 disabled:cursor-not-allowed
          transform hover:scale-105 disabled:scale-100
        `}
        title={isDetecting ? 'Detecting location...' : 'Click to automatically detect your location'}
      >
        {isDetecting ? (
          <>
            <Loader2 className={`${getIconSize()} animate-spin`} />
            <span>Detecting...</span>
          </>
        ) : (
          <>
            <MapPin className={getIconSize()} />
            <span>{buttonText}</span>
          </>
        )}
      </button>

      {/* Result indicator */}
      {lastResult && (
        <div className={`mt-2 flex items-center gap-2 text-sm ${
          lastResult.success ? 'text-green-600' : 'text-red-600'
        }`}>
          {lastResult.success ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Location detected successfully!</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4" />
              <span>{lastResult.error}</span>
            </>
          )}
        </div>
      )}

      {/* Help text */}
      <div className="mt-2 text-xs text-gray-500">
        <p>This will use your browser's location service to automatically fill in your address.</p>
        <p>Your location data is not stored and is only used to help you fill the form.</p>
      </div>
    </div>
  );
};

export default LocationDetector;
