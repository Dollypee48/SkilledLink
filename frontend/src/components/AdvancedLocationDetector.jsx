import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, AlertTriangle, CheckCircle, XCircle, RefreshCw, Globe, Shield } from 'lucide-react';
import useLocationDetection from '../hooks/useLocationDetection';

const AdvancedLocationDetector = ({ 
  onLocationDetected, 
  onError, 
  disabled = false,
  className = "",
  showButton = true,
  buttonText = "Detect My Location",
  buttonSize = "md",
  showHelpText = true,
  showPermissionsInfo = true,
  autoDetect = false
}) => {
  const { 
    detectLocation, 
    isDetecting, 
    lastResult, 
    error, 
    clearError, 
    reset, 
    isSupported 
  } = useLocationDetection();

  const [permissionsChecked, setPermissionsChecked] = useState(false);
  const [permissionsStatus, setPermissionsStatus] = useState(null);

  // Auto-detect on mount if enabled
  useEffect(() => {
    if (autoDetect && isSupported && !disabled) {
      handleDetectLocation();
    }
  }, [autoDetect, isSupported, disabled]);

  // Check permissions on mount
  useEffect(() => {
    if (isSupported) {
      checkPermissions();
    }
  }, [isSupported]);

  const checkPermissions = async () => {
    try {
      const geolocationService = (await import('../utils/geolocationService')).default;
      const permissions = await geolocationService.checkPermissions();
      setPermissionsStatus(permissions);
      setPermissionsChecked(true);
    } catch (err) {
      console.error('Error checking permissions:', err);
      setPermissionsStatus({ granted: false, reason: 'error' });
      setPermissionsChecked(true);
    }
  };

  const handleDetectLocation = async () => {
    if (disabled || isDetecting) return;

    try {
      clearError();
      const result = await detectLocation();

      if (result.success) {
        console.log('✅ Location detected successfully:', result);
        
        // Call the callback with the detected location data
        if (onLocationDetected) {
          onLocationDetected({
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
        }
      } else {
        if (onError) {
          onError(result.error);
        }
      }
    } catch (err) {
      console.error('❌ Location detection error:', err);
      if (onError) {
        onError(err.message);
      }
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

  const getPermissionsMessage = () => {
    if (!permissionsChecked) return null;
    
    switch (permissionsStatus?.reason) {
      case 'denied':
        return (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <p className="font-medium">Location access denied</p>
                <p>Please enable location permissions in your browser settings to use this feature.</p>
              </div>
            </div>
          </div>
        );
      case 'unavailable':
        return (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium">Location service unavailable</p>
                <p>Please check your internet connection and try again.</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isSupported) {
    return (
      <div className={`location-detector ${className}`}>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Globe className="w-4 h-4" />
            <span>Location detection is not supported by this browser.</span>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Error display */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700">
              <p className="font-medium">Location detection failed</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Permissions info */}
      {showPermissionsInfo && getPermissionsMessage()}

      {/* Help text */}
      {showHelpText && (
        <div className="mt-2 text-xs text-gray-500 space-y-1">
          <p>This will use your browser's location service to automatically fill in your address.</p>
          <p>Your location data is not stored and is only used to help you fill the form.</p>
        </div>
      )}
    </div>
  );
};

export default AdvancedLocationDetector;
