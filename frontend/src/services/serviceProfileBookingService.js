import axios from "axios";

const API_URL = "https://skilledlink-1.onrender.com/api/service-profile-bookings";

export const ServiceProfileBookingService = {
  // Create a new service profile booking
  createServiceProfileBooking: async (bookingData, token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const res = await axios.post(API_URL, bookingData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      console.error("createServiceProfileBooking error:", err.message);
      throw new Error(err.response?.data?.message || "Failed to create service profile booking");
    }
  },

  // Get all service profile bookings for the logged-in customer
  getMyServiceProfileBookings: async (token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const res = await axios.get(`${API_URL}/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      console.error("getMyServiceProfileBookings error:", err.message);
      throw new Error(err.response?.data?.message || "Failed to fetch service profile bookings");
    }
  },

  // Get all service profile bookings for the logged-in artisan
  getArtisanServiceProfileBookings: async (token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const res = await axios.get(`${API_URL}/artisan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      console.error("getArtisanServiceProfileBookings error:", err.message);
      throw new Error(err.response?.data?.message || "Failed to fetch artisan service profile bookings");
    }
  },

  // Get single service profile booking by ID
  getServiceProfileBookingById: async (id, token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const res = await axios.get(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      console.error("getServiceProfileBookingById error:", err.message);
      throw new Error(err.response?.data?.message || "Failed to fetch service profile booking");
    }
  },

  // Update service profile booking status
  updateServiceProfileBookingStatus: async (id, status, token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const res = await axios.put(`${API_URL}/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      console.error("updateServiceProfileBookingStatus error:", err.message);
      throw new Error(err.response?.data?.message || "Failed to update service profile booking");
    }
  },

  // Delete a service profile booking
  deleteServiceProfileBooking: async (id, token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const res = await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      console.error("deleteServiceProfileBooking error:", err.message);
      throw new Error(err.response?.data?.message || "Failed to delete service profile booking");
    }
  },
};
