import axios from "axios";

const API_URL = "http://localhost:5000/api/admin"; // Adjust to your backend URL

export const adminService = {
  getDashboardStats: async (token) => {
    if (!token) {
      throw new Error("Authentication token is required");
    }
    try {
      const response = await axios.get(`${API_URL}/dashboard-stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      // console.error("Error fetching admin dashboard stats:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch dashboard stats");
    }
  },

  // New functions for AdminContext
  getAllArtisans: async (token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const response = await axios.get(`${API_URL}/artisans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      // console.error("Error fetching all artisans:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch artisans");
    }
  },

  getAllBookings: async (token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const response = await axios.get(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      // console.error("Error fetching all bookings:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch bookings");
    }
  },

  getAllReports: async (token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const response = await axios.get(`${API_URL}/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      // console.error("Error fetching all reports:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch reports");
    }
  },

  getAllReviews: async (token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const response = await axios.get(`${API_URL}/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      // console.error("Error fetching all reviews:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch reviews");
    }
  },

  // User Management
  getAllUsers: async (token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      // console.error("Error fetching all users:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch users");
    }
  },

  getUserById: async (userId, token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      // console.error("Error fetching user by ID:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch user");
    }
  },

  updateUserRole: async (userId, role, token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const response = await axios.put(`${API_URL}/users/${userId}/role`, { role }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      // console.error("Error updating user role:", error);
      throw new Error(error.response?.data?.message || "Failed to update user role");
    }
  },

  // Assuming suspendUser already exists in backend/controllers/adminController.js
  // This corresponds to router.put('/suspend/:id', auth, role(['admin']), suspendUser);
  suspendUser: async (userId, isSuspended, token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const response = await axios.put(`${API_URL}/suspend/${userId}`, { isSuspended }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      // console.error("Error suspending user:", error);
      throw new Error(error.response?.data?.message || "Failed to suspend user");
    }
  },

  deleteUser: async (userId, token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const response = await axios.delete(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      // console.error("Error deleting user:", error);
      throw new Error(error.response?.data?.message || "Failed to delete user");
    }
  },

  // Issue Management
  getAllIssues: async (token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const response = await axios.get(`${API_URL}/issues`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      // console.error("Error fetching all issues:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch issues");
    }
  },

  getIssueById: async (issueId, token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const response = await axios.get(`${API_URL}/issues/${issueId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      // console.error("Error fetching issue by ID:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch issue");
    }
  },

  updateIssueStatus: async (issueId, status, assignedTo, token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const response = await axios.put(`${API_URL}/issues/${issueId}/status`, 
        { status, assignedTo }, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      // console.error("Error updating issue status:", error);
      throw new Error(error.response?.data?.message || "Failed to update issue status");
    }
  },

  // KYC Management functions
  approveKyc: async (userId, token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const response = await axios.put(`${API_URL}/users/${userId}/kyc/approve`, 
        {}, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to approve KYC");
    }
  },

  rejectKyc: async (userId, token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const response = await axios.put(`${API_URL}/users/${userId}/kyc/reject`, 
        {}, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to reject KYC");
    }
  },
};
