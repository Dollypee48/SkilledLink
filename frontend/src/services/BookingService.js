import axios from "axios";

const API_URL = "http://localhost:5000/api/bookings";

export const BookingService = {
  // Create a new booking
  createBooking: async (bookingData, token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const res = await axios.post(API_URL, bookingData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      console.error("createBooking error:", err.message);
      throw new Error(err.response?.data?.message || "Failed to create booking");
    }
  },

  // Get all bookings for the logged-in customer
  getMyBookings: async (token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const res = await axios.get(`${API_URL}/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      console.error("getMyBookings error:", err.message);
      throw new Error(err.response?.data?.message || "Failed to fetch bookings");
    }
  },

  // Get single booking by ID
  getBookingById: async (id, token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const res = await axios.get(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      console.error("getBookingById error:", err.message);
      throw new Error(err.response?.data?.message || "Failed to fetch booking");
    }
  },

  // Update booking status
  updateBookingStatus: async (id, status, token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const res = await axios.put(`${API_URL}/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      console.error("updateBookingStatus error:", err.message);
      throw new Error(err.response?.data?.message || "Failed to update booking");
    }
  },

  // Delete a booking
  deleteBooking: async (id, token) => {
    if (!token) throw new Error("Authentication token is required");
    try {
      const res = await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      console.error("deleteBooking error:", err.message);
      throw new Error(err.response?.data?.message || "Failed to delete booking");
    }
  },
};
