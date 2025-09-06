import api from '../utils/api';

export const subscriptionService = {
  // Get subscription plans
  getPlans: async () => {
    try {
      const response = await api.get('/subscription/plans');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch subscription plans');
    }
  },

  // Get current subscription
  getCurrentSubscription: async (token) => {
    if (!token) {
      throw new Error("Authentication token is required.");
    }
    try {
      const response = await api.get('/subscription/current', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching current subscription:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch current subscription');
    }
  },

  // Initialize subscription payment
  initializeSubscription: async (plan, token) => {
    if (!token) {
      throw new Error("Authentication token is required.");
    }
    try {
      console.log('🔍 Frontend: Initializing subscription for plan:', plan);
      console.log('🔍 Frontend: Using token:', token ? 'Present' : 'Missing');
      
      const response = await api.post('/subscription/initialize', { plan }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('🔍 Frontend: Subscription initialization response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Frontend: Error initializing subscription:', error);
      console.error('❌ Frontend: Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to initialize subscription');
    }
  },

  // Verify subscription payment
  verifyPayment: async (reference, token) => {
    if (!token) {
      throw new Error("Authentication token is required.");
    }
    try {
      const response = await api.post('/subscription/verify', { reference }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new Error(error.response?.data?.message || 'Failed to verify payment');
    }
  },

  // Cancel subscription
  cancelSubscription: async (token) => {
    if (!token) {
      throw new Error("Authentication token is required.");
    }
    try {
      const response = await api.post('/subscription/cancel', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel subscription');
    }
  }
};
