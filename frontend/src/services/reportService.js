import axios from "axios";

const API_URL = "https://skilledlink-1.onrender.com/api/reports"; // adjust base URL

export const ReportService = {
  // Create a new report
  createReport: async (reportData, token) => {
    const formData = new FormData();
    formData.append("category", reportData.category);
    formData.append("description", reportData.description);
    if (reportData.file) formData.append("file", reportData.file);

    const response = await axios.post(`${API_URL}/issues`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`, 
        "Content-Type": "multipart/form-data"
      },
    });
    return response.data.report;
  },

  // Fetch all reports for the logged-in user
  getReports: async (token) => {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Delete a report by ID
  deleteReport: async (id, token) => {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
