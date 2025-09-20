import { useState, useCallback } from 'react';
import geolocationService from '../utils/geolocationService';

const useLocationDetection = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);

  const detectLocation = useCallback(async (options = {}) => {
    if (isDetecting) return;

    try {
      setIsDetecting(true);
      setError(null);
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
      const result = await geolocationService.getLocationAndAddress(options);

      if (result.success) {
        console.log('✅ Location detected successfully:', result);
        setLastResult({ success: true, data: result });
        return {
          success: true,
          data: result,
          message: 'Location detected successfully'
        };
      } else {
        throw new Error(result.error || 'Failed to detect location');
      }
    } catch (err) {
      console.error('❌ Location detection failed:', err);
      const errorMessage = err.message || 'Failed to detect location';
      setError(errorMessage);
      setLastResult({ success: false, error: errorMessage });
      
      return {
        success: false,
        error: errorMessage,
        message: errorMessage
      };
    } finally {
      setIsDetecting(false);
    }
  }, [isDetecting]);

  const clearError = useCallback(() => {
    setError(null);
    setLastResult(null);
  }, []);

  const reset = useCallback(() => {
    setIsDetecting(false);
    setLastResult(null);
    setError(null);
  }, []);

  return {
    detectLocation,
    isDetecting,
    lastResult,
    error,
    clearError,
    reset,
    isSupported: geolocationService.isGeolocationSupported()
  };
};

export default useLocationDetection;
