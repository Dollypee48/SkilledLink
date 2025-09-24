// Geolocation service for automatic location detection
class GeolocationService {
  constructor() {
    this.isSupported = 'geolocation' in navigator;
    this.watchId = null;
    this.addressCache = new Map(); // Cache for address lookups
    this.defaultOptions = {
      enableHighAccuracy: true,
      timeout: 15000, // Increased timeout for better accuracy
      maximumAge: 0 // Always get fresh location data
    };
  }

  // Check if geolocation is supported
  isGeolocationSupported() {
    return this.isSupported;
  }

  // Check network connectivity with multiple fallbacks
  async checkNetworkConnectivity() {
    try {
      // Try multiple connectivity checks with shorter timeouts
      const connectivityChecks = [
        // Check 1: Simple HEAD request to Google
        fetch('https://www.google.com/favicon.ico', { 
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache',
          signal: AbortSignal.timeout(3000) // 3 second timeout
        }),
        // Check 2: Try a different endpoint
        fetch('https://httpbin.org/get', { 
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache',
          signal: AbortSignal.timeout(3000)
        })
      ];

      // Try the first check, if it fails try the second
      try {
        await connectivityChecks[0];
        console.log('✅ Network connectivity confirmed');
        return true;
      } catch (firstError) {
        console.warn('First connectivity check failed, trying second...');
        try {
          await connectivityChecks[1];
          console.log('✅ Network connectivity confirmed via fallback');
          return true;
        } catch (secondError) {
          console.warn('All connectivity checks failed:', secondError);
          return false;
        }
      }
    } catch (error) {
      console.warn('Network connectivity check failed:', error);
      return false;
    }
  }

  // Get current position with error handling and improved accuracy
  async getCurrentPosition(options = {}) {
    if (!this.isSupported) {
      throw new Error('Geolocation is not supported by this browser');
    }

    const mergedOptions = { ...this.defaultOptions, ...options };

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const result = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          
          // Log accuracy for debugging
          console.log('📍 Location accuracy:', result.accuracy, 'meters');
          
          // If accuracy is too low, warn but still proceed
          if (result.accuracy > 100) {
            console.warn('⚠️ Low location accuracy detected:', result.accuracy, 'meters');
          }
          
          resolve(result);
        },
        (error) => {
          const errorMessage = this.getErrorMessage(error.code);
          reject(new Error(errorMessage));
        },
        mergedOptions
      );
    });
  }

  // Clear address cache
  clearCache() {
    this.addressCache.clear();
    console.log('🗑️ Address cache cleared');
  }

  // Get cache size for debugging
  getCacheSize() {
    return this.addressCache.size;
  }

  // Get error message based on error code
  getErrorMessage(errorCode) {
    switch (errorCode) {
      case 1:
        return 'Location access denied. Please enable location permissions and try again.';
      case 2:
        return 'Location unavailable. Please check your internet connection and try again.';
      case 3:
        return 'Location request timed out. Please try again.';
      default:
        return 'Unable to get your location. Please try again.';
    }
  }

  // Reverse geocoding to get address from coordinates
  async getAddressFromCoordinates(latitude, longitude) {
    try {
      // Create cache key with rounded coordinates for better caching
      const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
      
      // Check cache first
      if (this.addressCache.has(cacheKey)) {
        console.log('📍 Using cached address for coordinates:', cacheKey);
        return this.addressCache.get(cacheKey);
      }

      console.log('🌍 Fetching address for coordinates:', latitude, longitude);
      
      // Using a free reverse geocoding service with better parameters
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en&key=`
      );
      
      if (!response.ok) {
        console.warn('BigDataCloud API failed, trying fallback...');
        // Try fallback with OpenStreetMap Nominatim
        return await this.getAddressFromCoordinatesFallback(latitude, longitude);
      }

      const data = await response.json();
      
      if (data.status === 'ZERO_RESULTS') {
        console.warn('BigDataCloud returned zero results, trying fallback...');
        // Try fallback with OpenStreetMap Nominatim
        return await this.getAddressFromCoordinatesFallback(latitude, longitude);
      }

      // More robust address parsing
      const addressData = {
        address: this.extractAddress(data),
        city: this.extractCity(data),
        state: this.extractState(data),
        country: data.countryName || 'Nigeria',
        countryCode: data.countryCode || 'NG',
        formattedAddress: this.formatAddress(data),
        coordinates: { latitude, longitude },
        raw: data
      };

      // Cache the result
      this.addressCache.set(cacheKey, addressData);
      console.log('✅ Address cached for coordinates:', cacheKey);

      return addressData;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      
      // Check if it's a network connectivity issue
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_TUNNEL_CONNECTION_FAILED')) {
        throw new Error('Network connectivity issue. Please check your internet connection and try again.');
      }
      
      // Try fallback method before giving up
      try {
        console.log('🔄 Trying fallback geocoding service...');
        return await this.getAddressFromCoordinatesFallback(latitude, longitude);
      } catch (fallbackError) {
        console.error('Fallback geocoding also failed:', fallbackError);
        
        // Check if fallback also failed due to network issues
        if (fallbackError.message.includes('Network connectivity issue')) {
          throw fallbackError;
        }
        
        throw new Error('Unable to get address information. Please enter your address manually.');
      }
    }
  }

  // Fallback method using OpenStreetMap Nominatim
  async getAddressFromCoordinatesFallback(latitude, longitude) {
    try {
      console.log('🌍 Using fallback geocoding service (Nominatim)...');
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`
      );
      
      if (!response.ok) {
        throw new Error('Fallback geocoding service unavailable');
      }

      const data = await response.json();
      
      if (!data || !data.address) {
        throw new Error('No address data from fallback service');
      }

      // Parse Nominatim address format
      const addressData = {
        address: data.address.road || data.address.house_number || data.address.suburb || 'Unknown',
        city: data.address.city || data.address.town || data.address.village || data.address.county || 'Unknown',
        state: data.address.state || data.address.region || 'Unknown',
        country: data.address.country || 'Nigeria',
        countryCode: data.address.country_code?.toUpperCase() || 'NG',
        formattedAddress: data.display_name || `${data.address.city || 'Unknown'}, ${data.address.state || 'Unknown'}, Nigeria`,
        coordinates: { latitude, longitude },
        raw: data
      };

      // Cache the result
      const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
      this.addressCache.set(cacheKey, addressData);
      console.log('✅ Fallback address cached for coordinates:', cacheKey);

      return addressData;
    } catch (error) {
      console.error('Fallback geocoding error:', error);
      
      // Check if it's a network connectivity issue
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_TUNNEL_CONNECTION_FAILED')) {
        throw new Error('Network connectivity issue. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  }

  // Extract address with better fallback logic
  extractAddress(data) {
    // Try multiple sources for address
    return data.localityInfo?.administrative?.[0]?.name || 
           data.locality || 
           data.city || 
           data.principalSubdivision || 
           'Unknown';
  }

  // Extract city with better fallback logic
  extractCity(data) {
    return data.city || 
           data.locality || 
           data.localityInfo?.administrative?.[1]?.name ||
           'Unknown';
  }

  // Extract state with better fallback logic
  extractState(data) {
    return data.principalSubdivision || 
           data.administrativeArea || 
           data.localityInfo?.administrative?.[2]?.name ||
           'Unknown';
  }

  // Format address from geocoding data with consistent structure
  formatAddress(data) {
    const parts = [];
    
    // Use the extracted methods for consistency
    const city = this.extractCity(data);
    const state = this.extractState(data);
    const country = data.countryName || 'Nigeria';
    
    // Build address in consistent order: City, State, Country
    if (city && city !== 'Unknown') parts.push(city);
    if (state && state !== 'Unknown' && state !== city) parts.push(state);
    if (country && country !== 'Unknown') parts.push(country);
    
    return parts.join(', ');
  }

  // Get user's location and address
  async getLocationAndAddress(options = {}) {
    try {
      console.log('🌍 Getting user location...');
      
      // Check network connectivity (but don't fail if it's uncertain)
      const isOnline = await this.checkNetworkConnectivity();
      if (!isOnline) {
        console.warn('⚠️ Network connectivity uncertain, proceeding anyway...');
        // Don't throw error, just warn and continue
      }
      
      // Get current position
      const position = await this.getCurrentPosition(options);
      console.log('📍 Position obtained:', position);

      // Get address from coordinates
      const addressData = await this.getAddressFromCoordinates(
        position.latitude, 
        position.longitude
      );
      console.log('🏠 Address obtained:', addressData);

      return {
        success: true,
        position,
        address: addressData,
        message: 'Location detected successfully'
      };
    } catch (error) {
      console.error('❌ Location detection failed:', error);
      
      // Check if it's a network-related error
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_TUNNEL_CONNECTION_FAILED')) {
        return {
          success: false,
          error: 'Network connectivity issue. Please check your internet connection and try again.',
          message: 'Network connectivity issue. Please check your internet connection and try again.'
        };
      }
      
      return {
        success: false,
        error: error.message,
        message: error.message
      };
    }
  }

  // Watch position changes (for continuous tracking)
  watchPosition(callback, errorCallback, options = {}) {
    if (!this.isSupported) {
      errorCallback(new Error('Geolocation is not supported by this browser'));
      return null;
    }

    const mergedOptions = { ...this.defaultOptions, ...options };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        const errorMessage = this.getErrorMessage(error.code);
        errorCallback(new Error(errorMessage));
      },
      mergedOptions
    );

    return this.watchId;
  }

  // Stop watching position
  clearWatch() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Check if location permissions are granted
  async checkPermissions() {
    if (!this.isSupported) {
      return { granted: false, reason: 'not_supported' };
    }

    try {
      // Try to get position with very short timeout to check permissions
      await this.getCurrentPosition({ timeout: 1000 });
      return { granted: true };
    } catch (error) {
      if (error.message.includes('denied')) {
        return { granted: false, reason: 'denied' };
      } else if (error.message.includes('unavailable')) {
        return { granted: false, reason: 'unavailable' };
      } else {
        return { granted: false, reason: 'unknown' };
      }
    }
  }

  // Request location permissions (shows browser prompt)
  async requestPermissions() {
    try {
      await this.getCurrentPosition({ timeout: 5000 });
      return { granted: true };
    } catch (error) {
      return { 
        granted: false, 
        reason: error.message.includes('denied') ? 'denied' : 'error',
        message: error.message
      };
    }
  }
}

// Create and export a singleton instance
const geolocationService = new GeolocationService();
export default geolocationService;
