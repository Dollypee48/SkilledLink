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
        throw new Error('Failed to fetch address information');
      }

      const data = await response.json();
      
      if (data.status === 'ZERO_RESULTS') {
        throw new Error('No address found for this location');
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
      throw new Error('Unable to get address information. Please enter your address manually.');
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
