// ArtisanContext.jsx
import React, { createContext, useState, useEffect } from "react";
import * as artisanService from "../services/artisanService";
import useAuth from "../hooks/useAuth";

export const ArtisanContext = createContext();

export const ArtisanProvider = ({ children }) => {
  const { user, accessToken: token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [artisans, setArtisans] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProfile = async () => {
    try {
      setError(null);
      const data = await artisanService.getProfile(token);
      setProfile(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile");
      throw err; // Re-throw to be caught by the useEffect's catch
    }
  };

  const fetchBookings = async () => {
    try {
      setError(null);
      const data = await artisanService.getArtisanBookings(token);
      setBookings(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bookings");
      throw err; // Re-throw to be caught by the useEffect's catch
    }
  };

  const changeSubscription = async (subscription) => {
    try {
      setLoading(true); // Keep loading for individual actions
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
  };

  const searchArtisans = async (filters = {}) => {
    try {
      setLoading(true); // Keep loading for individual actions
      setError(null);
      const data = await artisanService.getArtisans(filters);
      setArtisans(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to search artisans");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      setLoading(true); // Keep loading for individual actions
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
  };

  useEffect(() => {
    const initializeArtisanData = async () => {
      if (user && token) {
        setLoading(true); // Start loading for all initial fetches
        setError(null);
        try {
          await Promise.all([
            loadProfile(),
            fetchBookings()
          ]);
        } catch (err) {
          // Errors are already set by individual functions, but this catches any unhandled
          console.error("Error initializing artisan data:", err);
        } finally {
          setLoading(false); // Stop loading after all fetches complete
        }
      }
    };
    initializeArtisanData();
  }, [user, token]); // Reload profile and bookings when user or token changes

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
      }}
    >
      {children}
    </ArtisanContext.Provider>
  );
};
