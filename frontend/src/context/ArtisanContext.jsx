// ArtisanContext.jsx
import React, { createContext, useState } from "react";
import * as artisanService from "../services/artisanService";

export const ArtisanContext = createContext();

export const ArtisanProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [artisans, setArtisans] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const loadProfile = async (token) => {
    const data = await artisanService.getProfile(token);
    setProfile(data);
    return data;
  };

  const changeSubscription = async (token, subscription) => {
    const data = await artisanService.updateSubscription(token, subscription);
    setProfile((prev) => ({ ...prev, artisanProfile: data.artisan }));
    return data;
  };

  const searchArtisans = async (filters = {}) => {
    const data = await artisanService.getArtisans(filters);
    setArtisans(data);
    return data;
  };

  const loadSuggestions = async (token) => {
    const data = await artisanService.suggestByLocation(token);
    setSuggestions(data.suggestions);
    return data;
  };

  return (
    <ArtisanContext.Provider
      value={{ profile, artisans, suggestions, loadProfile, changeSubscription, searchArtisans, loadSuggestions }}
    >
      {children}
    </ArtisanContext.Provider>
  );
};
