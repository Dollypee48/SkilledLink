import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { adminService } from "../services/adminService";
import useAuth from "../hooks/useAuth";

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const { user, accessToken } = useAuth();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    if (!accessToken || !user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (user.role === 'admin') {
        const stats = await adminService.getDashboardStats(accessToken);
        setDashboardStats(stats);
      }
      // Add other role-specific dashboard stats here
      
    } catch (err) {
      setError(err.message || "Failed to fetch dashboard stats");
      console.error('Dashboard stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [accessToken, user]);

  // Listen for real-time updates that affect dashboard stats
  useEffect(() => {
    const handleBookingStatusUpdated = (event) => {
      console.log('DashboardContext received booking status update:', event.detail);
      // Refresh dashboard stats when booking status changes
      if (user?.role === 'admin') {
        fetchDashboardStats();
      }
    };

    const handleNewReview = (event) => {
      console.log('DashboardContext received new review:', event.detail);
      // Refresh dashboard stats when new review is added
      if (user?.role === 'admin') {
        fetchDashboardStats();
      }
    };

    const handleArtisanProfileUpdated = (event) => {
      console.log('DashboardContext received artisan profile update:', event.detail);
      // Refresh dashboard stats when artisan profile changes
      if (user?.role === 'admin') {
        fetchDashboardStats();
      }
    };

    window.addEventListener('bookingStatusUpdated', handleBookingStatusUpdated);
    window.addEventListener('serviceProfileBookingStatusUpdated', handleBookingStatusUpdated);
    window.addEventListener('newReview', handleNewReview);
    window.addEventListener('artisanProfileUpdated', handleArtisanProfileUpdated);

    return () => {
      window.removeEventListener('bookingStatusUpdated', handleBookingStatusUpdated);
      window.removeEventListener('serviceProfileBookingStatusUpdated', handleBookingStatusUpdated);
      window.removeEventListener('newReview', handleNewReview);
      window.removeEventListener('artisanProfileUpdated', handleArtisanProfileUpdated);
    };
  }, [user, fetchDashboardStats]);

  // Fetch stats when component mounts or user changes
  useEffect(() => {
    if (user && accessToken) {
      fetchDashboardStats();
    }
  }, [user, accessToken, fetchDashboardStats]);

  return (
    <DashboardContext.Provider
      value={{
        dashboardStats,
        loading,
        error,
        fetchDashboardStats,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

// Custom hook
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used within a DashboardProvider");
  return context;
};
