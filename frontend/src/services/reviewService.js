import axios from "axios";

const API_URL = "/api/reviews";

export const ReviewService = {
  // Create a new review
  createReview: async (reviewData, token) => {
    const res = await axios.post(API_URL, reviewData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.review;
  },

  // Get logged-in customer reviews
  getMyReviews: async (token) => {
    const res = await axios.get(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
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
