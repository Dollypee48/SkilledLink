// frontend/src/services/issueService.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/issues";

export const issueService = {
  // Submit a new issue
  submitIssue: async (issueData, token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      // Axios automatically sets Content-Type to multipart/form-data for FormData
      const res = await axios.post(API_URL, issueData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      // console.error("submitIssue error:", err.message);
      throw new Error(err.response?.data?.message || "Failed to submit issue");
    }
  },

  // Get issues reported by the authenticated user
  getMyIssues: async (token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const res = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      // console.error("getMyIssues error:", err.message);
      throw new Error(err.response?.data?.message || "Failed to fetch issues");
    }
  },
};
