// authService.js
import axios from "axios";

const API_URL = "https://skilledlink-1.onrender.com/api/auth"; // adjust to your backend URL

// Register
export const register = async (data) => {
  const res = await axios.post(`${API_URL}/register`, data);
  return res.data;
};

// Login
export const login = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/login`, data);
    return res.data;
  } catch (error) {
    throw error;
  }
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
  return res.data; // Return the full response including profileCompletion
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

// Verify Email with Code
export const verifyEmailWithCode = async (email, code) => {
  const res = await axios.post(`${API_URL}/verify-code`, { email, code });
  return res.data;
};

// Resend Verification Email
export const resendVerificationEmail = async (email) => {
  const res = await axios.post(`${API_URL}/resend-verification`, { email });
  return res.data;
};
