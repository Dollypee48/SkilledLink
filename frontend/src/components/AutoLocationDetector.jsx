import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, CheckCircle, XCircle, Globe, Shield, AlertTriangle } from 'lucide-react';
import useLocationDetection from '../hooks/useLocationDetection';

const AutoLocationDetector = ({ 
  onLocationDetected, 
  onError, 
  onLocationUpdated,
  disabled = false,
  className = "",
  showStatus = true,
  autoDetect = true,
  autoSave = true,
  delay = 1000, // Delay before auto-detection starts
  allowOfflineMode = true // Allow proceeding without network
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

  const [hasDetected, setHasDetected] = useState(false);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const [permissionsChecked, setPermissionsChecked] = useState(false);
  const [permissionsStatus, setPermissionsStatus] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [offlineMode, setOfflineMode] = useState(false);

  // Auto-detect location on mount
  useEffect(() => {
    if (autoDetect && isSupported && !disabled && !hasDetected) {
      const timer = setTimeout(() => {
        handleAutoDetect();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [autoDetect, isSupported, disabled, hasDetected, delay]);

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

  const handleAutoDetect = async () => {
    if (disabled || isDetecting || hasDetected) return;

    try {
      setIsAutoDetecting(true);
      clearError();

      console.log('🌍 Auto-detecting location...');

      const result = await detectLocation();

      if (result.success) {
        console.log('✅ Location auto-detected successfully:', result);
        setHasDetected(true);
        setRetryCount(0); // Reset retry count on success
        
        const locationData = {
          address: result.data.address.formattedAddress,
          city: result.data.address.city,
          state: result.data.address.state,
          country: result.data.address.country,
          coordinates: {
            latitude: result.data.position.latitude,
            longitude: result.data.position.longitude
          },
          accuracy: result.data.position.accuracy
        };

        // Call the callback with the detected location data
        if (onLocationDetected) {
          onLocationDetected(locationData);
        }

        // Auto-save if enabled
        if (autoSave && onLocationUpdated) {
          onLocationUpdated(locationData);
        }
      } else {
        console.log('❌ Auto-detection failed:', result.error);
        setRetryCount(prev => prev + 1);
        if (onError) {
          onError(result.error);
        }
      }
    } catch (err) {
      console.error('❌ Auto-detection error:', err);
      setRetryCount(prev => prev + 1);
      if (onError) {
        onError(err.message);
      }
    } finally {
      setIsAutoDetecting(false);
    }
  };

  const handleRetry = () => {
    setHasDetected(false);
    clearError();
    handleAutoDetect();
  };

  const handleSkipLocationDetection = () => {
    setOfflineMode(true);
    setHasDetected(true); // Mark as detected to hide the component
    clearError();
  };

  const getStatusMessage = () => {
    if (!isSupported) {
      return {
        type: 'error',
        icon: Globe,
        message: 'Location detection is not supported by this browser',
        color: 'text-red-600'
      };
    }

    if (isAutoDetecting || isDetecting) {
      return {
        type: 'loading',
        icon: Loader2,
        message: 'Detecting your location...',
        color: 'text-blue-600'
      };
    }

    if (hasDetected && lastResult?.success) {
      return null; // Don't show any success message
    }

    if (error || lastResult?.error) {
      const errorMsg = error || lastResult?.error || 'Location detection failed';
      let message = errorMsg;
      
      if (errorMsg.includes('No internet connection') || errorMsg.includes('Network connectivity issue')) {
        message = allowOfflineMode 
          ? 'No internet connection detected. You can still enter your address manually.'
          : 'No internet connection. Please check your network and try again.';
      } else if (errorMsg.includes('Unable to get address information')) {
        message = 'Location detected but address lookup failed. Please enter your address manually.';
      }
      
      return {
        type: 'error',
        icon: XCircle,
        message: retryCount < 2 ? `${message} (Retry ${retryCount}/2)` : message,
        color: 'text-red-600',
        showRetry: retryCount < 2
      };
    }

    if (permissionsStatus?.reason === 'denied') {
      return {
        type: 'warning',
        icon: Shield,
        message: 'Location access denied. Please enable location permissions to auto-fill your address.',
        color: 'text-yellow-600'
      };
    }

    if (permissionsStatus?.reason === 'unavailable') {
      return {
        type: 'warning',
        icon: AlertTriangle,
        message: 'Location service unavailable. Please check your internet connection.',
        color: 'text-yellow-600'
      };
    }

    return null;
  };

  const status = getStatusMessage();

  if (!showStatus || !status) {
    return null;
  }

  // Don't show anything for successful detection
  if (hasDetected && lastResult?.success) {
    return null;
  }

  const StatusIcon = status.icon;

  return (
    <div className={`auto-location-detector ${className}`}>
      <div className={`flex items-center gap-2 text-xs p-2 rounded-md ${
        status.type === 'success' ? 'bg-green-50 border border-green-100' :
        status.type === 'error' ? 'bg-red-50 border border-red-200' :
        status.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
        'bg-blue-50 border border-blue-200'
      }`}>
        <StatusIcon className={`w-3 h-3 ${status.color} ${
          status.type === 'loading' ? 'animate-spin' : ''
        }`} />
        <span className={status.color}>
          {status.message}
        </span>
        {status.showRetry && (
          <button
            onClick={handleRetry}
            disabled={isAutoDetecting || isDetecting}
            className="ml-2 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Retry
          </button>
        )}
        {status.message.includes('No internet connection') && allowOfflineMode && (
          <button
            onClick={handleSkipLocationDetection}
            className="ml-2 px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Skip
          </button>
        )}
        {status.message.includes('No internet connection') && (
          <div className="mt-1 text-xs text-gray-500">
            💡 Tip: Check your WiFi/mobile data connection or enter address manually
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoLocationDetector;
