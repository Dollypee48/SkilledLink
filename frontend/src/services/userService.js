import api from '../utils/api';

export const userService = {
  updateProfile: async (userId, userData, token, role) => {
    if (!token) {
      throw new Error("Authentication token is required.");
    }
    try {
      const endpoint = role === 'artisan' ? '/artisans/me/profile' : `/users/profile`;
      const response = await api.put(endpoint, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating user profile for ${userId}:`, error);
      throw new Error(error.response?.data?.message || "Failed to update user profile");
    }
  },

  uploadProfilePicture: async (file, token) => {
    if (!token) {
      throw new Error("Authentication token is required.");
    }
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await api.post('/users/profile/picture', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload profile picture');
    }
  },
};
