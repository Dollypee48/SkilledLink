const API_URL = import.meta.env.VITE_API_URL || 'https://skilledlink-1.onrender.com/api';

class ServiceProfileService {
  // Get all service profiles for the current artisan
  async getArtisanServiceProfiles(token) {
    try {
      const response = await fetch(`${API_URL}/artisans/me/service-profiles`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch service profiles');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching artisan service profiles:', error);
      throw error;
    }
  }

  // Get a single service profile by ID
  async getServiceProfile(id) {
    try {
      const response = await fetch(`${API_URL}/service-profiles/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch service profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching service profile:', error);
      throw error;
    }
  }

  // Create a new service profile
  async createServiceProfile(profileData, token) {
    try {
      const response = await fetch(`${API_URL}/artisans/me/service-profiles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create service profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating service profile:', error);
      throw error;
    }
  }

  // Update a service profile
  async updateServiceProfile(id, profileData, token) {
    try {
      const response = await fetch(`${API_URL}/artisans/me/service-profiles/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update service profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating service profile:', error);
      throw error;
    }
  }

  // Delete a service profile
  async deleteServiceProfile(id, token) {
    try {
      const response = await fetch(`${API_URL}/artisans/me/service-profiles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete service profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting service profile:', error);
      throw error;
    }
  }

  // Toggle service profile active status
  async toggleServiceProfileStatus(id, token) {
    try {
      const response = await fetch(`${API_URL}/artisans/me/service-profiles/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle service profile status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error toggling service profile status:', error);
      throw error;
    }
  }

  // Get service profile statistics
  async getServiceProfileStats(token) {
    try {
      const response = await fetch(`${API_URL}/artisans/me/service-profiles/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch service profile stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching service profile stats:', error);
      throw error;
    }
  }

  // Get all service profiles (for customers to browse)
  async getAllServiceProfiles(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await fetch(`${API_URL}/service-profiles?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch service profiles');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching all service profiles:', error);
      throw error;
    }
  }

  // Upload image for service profile
  async uploadServiceImage(imageData, token) {
    try {
      const response = await fetch(`${API_URL}/upload/service-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading service image:', error);
      throw error;
    }
  }
}

export default new ServiceProfileService();
