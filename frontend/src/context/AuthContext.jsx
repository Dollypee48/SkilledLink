// AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import * as authService from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [accessToken, setAccessToken] = useState(() => {
    const savedToken = localStorage.getItem("accessToken");
    return savedToken || null;
  });

  const isAuthenticated = !!user && !!accessToken;
  const role = user ? user.role : null;

  const updateUser = useCallback((newUserData) => {
    setUser(newUserData);
    localStorage.setItem("user", JSON.stringify(newUserData));
  }, []);

  // Save user + token in localStorage
  const handleLogin = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    setAccessToken(data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user)); // Save user with role and artisanProfile
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    return data;
  }, []);

  const handleRegister = useCallback(async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    setAccessToken(data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user)); // Save user with role and artisanProfile
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    return data;
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("user"); // ✅ Clear user
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }, []);

  // Try to refresh token when app loads
  useEffect(() => {
    const refresh = async () => {
      const token = localStorage.getItem("refreshToken");
      if (token) {
        try {
          const data = await authService.refreshToken(token);
          setAccessToken(data.accessToken);
          localStorage.setItem("accessToken", data.accessToken);

          // Store new refresh token if provided
          if (data.refreshToken) {
            localStorage.setItem("refreshToken", data.refreshToken);
          }

          // ✅ If backend returns updated user with role, save again
          if (data.user) {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        } catch {
          handleLogout();
        }
      }
    };
    refresh();
  }, [handleLogout]);

  return (
    <AuthContext.Provider value={{ user, accessToken, isAuthenticated, role, handleLogin, handleRegister, handleLogout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
