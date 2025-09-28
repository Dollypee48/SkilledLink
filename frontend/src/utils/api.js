
import axios from "axios";
import * as authService from "../services/authService";

const api = axios.create({
  baseURL: "https://skilledlink-1.onrender.com/api", 
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const data = await authService.refreshToken(refreshToken);
          
          // Update tokens in localStorage
          localStorage.setItem("accessToken", data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem("refreshToken", data.refreshToken);
          }

          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
