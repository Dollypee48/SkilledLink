// API Configuration for both local and production environments

const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_NODE_ENV === 'development';

// Base API URLs
const BASE_URLS = {
  development: 'http://localhost:5000/api',
  production: 'https://skilledlink-1.onrender.com/api'
};

// Get the appropriate base URL based on environment
export const getBaseUrl = () => {
  // Check for custom API URL from environment variables
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // For production builds, always use production URL
  if (import.meta.env.PROD) {
    return BASE_URLS.production;
  }
  
  // Default to local development if in development mode
  return isDevelopment ? BASE_URLS.development : BASE_URLS.production;
};

// Export the current base URL
export const API_BASE_URL = getBaseUrl();

// Specific API endpoints
export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}/auth`,
  admin: `${API_BASE_URL}/admin`,
  artisans: `${API_BASE_URL}/artisans`,
  bookings: `${API_BASE_URL}/bookings`,
  issues: `${API_BASE_URL}/issues`,
  reports: `${API_BASE_URL}/reports`,
  reviews: `${API_BASE_URL}/reviews`,
  messages: `${API_BASE_URL}/messages`,
  users: `${API_BASE_URL}/users`,
  kyc: `${API_BASE_URL}/kyc`,
  notifications: `${API_BASE_URL}/notifications`,
  subscription: `${API_BASE_URL}/subscription`,
  settings: `${API_BASE_URL}/settings`,
  serviceProfiles: `${API_BASE_URL}/service-profiles`,
  serviceProfileBookings: `${API_BASE_URL}/service-profile-bookings`
};

// Log the current API configuration (only in development)
if (isDevelopment) {
  console.log('🔧 API Configuration:', {
    environment: isDevelopment ? 'development' : 'production',
    baseUrl: API_BASE_URL,
    customUrl: import.meta.env.VITE_API_URL || 'none',
    endpoints: API_ENDPOINTS
  });
}
