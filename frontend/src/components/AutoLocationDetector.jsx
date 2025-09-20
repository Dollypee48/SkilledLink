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
  delay = 1000 // Delay before auto-detection starts
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
        if (onError) {
          onError(result.error);
        }
      }
    } catch (err) {
      console.error('❌ Auto-detection error:', err);
      if (onError) {
        onError(err.message);
      }
    } finally {
      setIsAutoDetecting(false);
    }
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
      return {
        type: 'error',
        icon: XCircle,
        message: error || lastResult?.error || 'Location detection failed',
        color: 'text-red-600'
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
      </div>
    </div>
  );
};

export default AutoLocationDetector;
