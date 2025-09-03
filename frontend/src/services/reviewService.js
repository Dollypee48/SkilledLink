import axios from "axios";

const API_URL = "http://localhost:5000/api/reviews";

export const ReviewService = {
  // Create a new review
  createReview: async (reviewData, token) => {
    // Making API call to create review
    
    const res = await axios.post(API_URL, reviewData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    // Review created successfully
    return res.data.review;
  },

  // Get logged-in customer reviews
  getMyReviews: async (token) => {
    const res = await axios.get(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Get reviews for an artisan (for artisan users)
  getArtisanReviews: async (token) => {
    const res = await axios.get(`${API_URL}/artisan`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Get public reviews for an artisan (no authentication required)
  getPublicArtisanReviews: async (artisanId) => {
    const res = await axios.get(`${API_URL}/public/artisan/${artisanId}`);
    return res.data;
  },

  // Update a review
  updateReview: async (id, reviewData, token) => {
    const res = await axios.put(`${API_URL}/${id}`, reviewData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.review;
  },
};
