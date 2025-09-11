import api from '../utils/api';

export const kycService = {
  getKYCTypes: async () => {
    try {
      const response = await api.get('/kyc/types');
      return response.data;
    } catch (error) {
      console.error("Error fetching KYC types:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch KYC types");
    }
  },

  submitKYC: async (kycData, token) => {
    if (!token) {
      throw new Error("Authentication token is required.");
    }
    try {
      const response = await api.post('/kyc/submit', kycData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error submitting KYC documents:", error);
      throw new Error(error.response?.data?.message || "Failed to submit KYC documents");
    }
  },

  getPendingKYC: async (token) => {
    if (!token) {
      throw new Error("Authentication token is required.");
    }
    try {
      const response = await api.get('/kyc/pending', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching pending KYC requests:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch pending KYC requests");
    }
  },

  verifyKYC: async (userId, status, token) => {
    if (!token) {
      throw new Error("Authentication token is required.");
    }
    try {
      const response = await api.put(`/kyc/verify/${userId}`, { status }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error verifying KYC for user ${userId}:`, error);
      throw new Error(error.response?.data?.message || "Failed to verify KYC request");
    }
  },
};
