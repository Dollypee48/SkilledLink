import api from '../utils/api';

export const userService = {
  updateProfile: async (userId, userData, token) => {
    if (!token) {
      throw new Error("Authentication token is required.");
    }
    try {
      const response = await api.put(`/users/profile`, userData, {
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
};
