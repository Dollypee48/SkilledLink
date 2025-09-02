import axios from "axios";

const API_URL = "http://localhost:5000/api/reviews";

export const ReviewService = {
  // Create a new review
  createReview: async (reviewData, token) => {
    console.log('ReviewService: Making API call to:', API_URL);
    console.log('ReviewService: With data:', reviewData);
    console.log('ReviewService: With token:', token ? token.substring(0, 20) + '...' : 'No token');
    
    const res = await axios.post(API_URL, reviewData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    console.log('ReviewService: Response received:', res.data);
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
