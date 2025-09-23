import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import * as artisanService from "../services/artisanService";
import useAuth from "../hooks/useAuth"; // Reverted import path

export const ArtisanContext = createContext();

export const ArtisanProvider = ({ children }) => {
  const { user, accessToken: token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [artisans, setArtisans] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(true); // New: Manage artisan's online status

  const loadProfile = useCallback(async () => { // Removed 'token' parameter here
    try {
      setLoading(true);
      setError(null);
      // Use the token from useAuth directly
      const data = await artisanService.getProfile(token);
      setProfile(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]); // Dependency on token

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await artisanService.getArtisanBookings(token);
      setBookings(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bookings");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const changeSubscription = useCallback(async (subscription) => {
    try {
      setLoading(true);
      setError(null);
      const data = await artisanService.updateSubscription(token, subscription);
      setProfile((prev) => ({ ...prev, artisanProfile: data.artisan }));
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update subscription");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const searchArtisans = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await artisanService.getArtisans(filters);
      // Handle new response format with artisans array and pagination
      const artisansArray = data.artisans || data;
      setArtisans(artisansArray);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to search artisans");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []); // No token dependency here as getArtisans might be public

  const loadSuggestions = useCallback(async () => { // Removed 'token' parameter here
    try {
      setLoading(true);
      setError(null);
      const data = await artisanService.suggestByLocation(token);
      setSuggestions(data.suggestions);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load suggestions");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const initializeArtisanData = async () => {
      if (user?.role === 'artisan' && token) { // Only fetch if user is artisan and token exists
        setLoading(true);
        setError(null);
        try {
          await Promise.all([
            loadProfile(),
            fetchBookings()
          ]);
        } catch (err) {
          console.error("Error initializing artisan data:", err);
          // Error state is already set by individual loadProfile/fetchBookings
        } finally {
          setLoading(false);
        }
      } else if (user && !token) {
        // Handle case where user is logged in but no token (e.g., expired and not refreshed)
        setError("Authentication required.");
        setLoading(false);
      }
    };
    
    // Only initialize if we have a user and haven't loaded data yet
    if (user && !profile && !loading) {
      initializeArtisanData();
    }
  }, [user, token]); // Reduced dependencies to prevent excessive re-renders

  return (
    <ArtisanContext.Provider
      value={{
        profile,
        artisans,
        suggestions,
        bookings,
        loading,
        error,
        loadProfile,
        changeSubscription,
        searchArtisans,
        loadSuggestions,
        fetchBookings,
        isOnline, // Expose online status
        toggleOnlineStatus: () => setIsOnline((prev) => !prev), // Expose toggle function
      }}
    >
      {children}
    </ArtisanContext.Provider>
  );
};

// Custom hook
export const useArtisan = () => {
  const context = useContext(ArtisanContext);
  if (!context) throw new Error("useArtisan must be used within an ArtisanProvider");
  return context;
};