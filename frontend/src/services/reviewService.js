import axios from "axios";

const API_URL = "https://skilledlink-1.onrender.com/api/reviews";

export const ReviewService = {
  // Create a new review
  createReview: async (reviewData, token) => {
    console.log('ReviewService - Making API call to create review:', { reviewData, token: token ? 'present' : 'missing' });
    
    try {
      const res = await axios.post(API_URL, reviewData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('ReviewService - Review created successfully:', res.data);
      // Review created successfully
      return res.data.review;
    } catch (error) {
      console.error('ReviewService - Error creating review:', error);
      console.error('ReviewService - Error response:', error.response?.data);
      throw error;
    }
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
