// artisanService.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/artisans"; // adjust to your backend URL

// Get current artisan profile
export const getProfile = async (token) => {
  const res = await axios.get(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Update subscription
export const updateSubscription = async (token, subscription) => {
  const res = await axios.put(
    `${API_URL}/subscription`,
    { subscription },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// Get all artisans with search/filter
export const getArtisans = async (params = {}) => {
  const res = await axios.get(API_URL, { params });
  return res.data;
};

// Suggest artisans by location
export const suggestByLocation = async (token) => {
  const res = await axios.get(`${API_URL}/suggest-by-location`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Get bookings for the current artisan
export const getArtisanBookings = async (token) => {
  const res = await axios.get(`${API_URL}/me/bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
