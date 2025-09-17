import React, { createContext, useContext, useState, useCallback } from "react";
import { ReviewService } from "../services/reviewService";
import useAuth from "../hooks/useAuth";

export const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
  const { accessToken } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper for API requests
  const handleRequest = useCallback(async (callback) => {
    setLoading(true);
    setError(null);
    try {
      if (!accessToken) {
        console.error('ReviewContext - No access token available');
        throw new Error("Please log in to perform this action");
      }
      console.log('ReviewContext - Using access token:', accessToken ? 'present' : 'missing');
      const result = await callback(accessToken);
      return result;
    } catch (err) {
      console.error('ReviewContext - Error in handleRequest:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Create a review
  const createReview = useCallback(async (reviewData) => {
    console.log('ReviewContext - Creating review with data:', reviewData);
    try {
      // Creating review
      const newReview = await handleRequest((token) =>
        ReviewService.createReview(reviewData, token)
      );
      console.log('ReviewContext - Review created successfully:', newReview);
      // Review created successfully
      setReviews((prev) => [...prev, newReview]);
      return newReview;
    } catch (error) {
      console.error('ReviewContext - Error creating review:', error);
      throw error;
    }
  }, [handleRequest]);

  // Fetch current user's reviews
  const getMyReviews = useCallback(async () => {
    const data = await handleRequest((token) =>
      ReviewService.getMyReviews(token)
    );
    setReviews(data);
    return data;
  }, [handleRequest]);

  // Fetch reviews for an artisan (for artisan users)
  const getArtisanReviews = useCallback(async () => {
    const data = await handleRequest((token) =>
      ReviewService.getArtisanReviews(token)
    );
    setReviews(data);
    return data;
  }, [handleRequest]);

  // Update a review
  const updateReview = useCallback(async (id, reviewData) => {
    const updated = await handleRequest((token) =>
      ReviewService.updateReview(id, reviewData, token)
    );
    setReviews((prev) => prev.map((r) => (r._id === id ? updated : r)));
    return updated;
  }, [handleRequest]);

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        loading,
        error,
        createReview,
        getMyReviews,
        getArtisanReviews,
        updateReview,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};

// Custom hook for easier usage
export const useReview = () => {
  const context = useContext(ReviewContext);
  if (!context) throw new Error("useReview must be used within a ReviewProvider");
  return context;
};
