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
