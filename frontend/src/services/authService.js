// authService.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; // adjust to your backend URL

// Register
export const register = async (data) => {
  const res = await axios.post(`${API_URL}/register`, data);
  return res.data;
};

// Login
export const login = async (data) => {
  const res = await axios.post(`${API_URL}/login`, data);
  return res.data;
};

// Refresh token
export const refreshToken = async (refreshToken) => {
  const res = await axios.post(`${API_URL}/refresh`, { refreshToken });
  return res.data;
};

// Update Profile
export const updateProfile = async (profileData, token, userRole) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  const res = await axios.put(`${API_URL}/profile`, { ...profileData, role: userRole }, config);
  return res.data;
};

// Change Password
export const changePassword = async (passwordData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  const res = await axios.put(`${API_URL}/change-password`, passwordData, config);
  return res.data;
};
