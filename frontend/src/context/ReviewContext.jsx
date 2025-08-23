import React, { createContext, useContext, useState } from "react";
import { ReviewService } from "../services/reviewService";
import useAuth from "../hooks/useAuth";

export const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
  const { accessToken } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper for API requests
  const handleRequest = async (callback) => {
    setLoading(true);
    setError(null);
    try {
      if (!accessToken) throw new Error("Please log in to perform this action");
      const result = await callback(accessToken);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a review
  const createReview = async (reviewData) => {
    const newReview = await handleRequest((token) =>
      ReviewService.createReview(reviewData, token)
    );
    setReviews((prev) => [...prev, newReview]);
    return newReview;
  };

  // Fetch current user's reviews
  const getMyReviews = async () => {
    const data = await handleRequest((token) =>
      ReviewService.getMyReviews(token)
    );
    setReviews(data);
    return data;
  };

  // Update a review
  const updateReview = async (id, reviewData) => {
    const updated = await handleRequest((token) =>
      ReviewService.updateReview(id, reviewData, token)
    );
    setReviews((prev) => prev.map((r) => (r._id === id ? updated : r)));
    return updated;
  };

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        loading,
        error,
        createReview,
        getMyReviews,
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
