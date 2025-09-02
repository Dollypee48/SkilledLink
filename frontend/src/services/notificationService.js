import api from '../utils/api';

export const notificationService = {
  // Get user's notifications
  getUserNotifications: async (token, limit = 50, skip = 0) => {
    try {
      console.log('Making API call to fetch notifications...');
      console.log('Token:', token ? token.substring(0, 20) + '...' : 'No token');
      console.log('API endpoint:', `/notifications?limit=${limit}&skip=${skip}`);
      console.log('Full API URL:', `http://localhost:5000/api/notifications?limit=${limit}&skip=${skip}`);
      
      const response = await api.get(`/notifications?limit=${limit}&skip=${skip}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('API response received:', response.data);
      console.log('Response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      console.error('Error response:', error.response);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Check if it's a connection error
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        throw new Error('Network Error: Unable to connect to server');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId, token) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (token) => {
    try {
      const response = await api.put('/notifications/mark-all-read', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  },

  // Get unread count
  getUnreadCount: async (token) => {
    try {
      const response = await api.get('/notifications/unread-count', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw new Error(error.response?.data?.message || 'Failed to get unread count');
    }
  },

  // Delete notification
  deleteNotification: async (notificationId, token) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete notification');
    }
  },

  // Clear all notifications for a user
  clearAllNotifications: async (token) => {
    try {
      const response = await api.delete('/notifications/clear-all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      throw new Error(error.response?.data?.message || 'Failed to clear all notifications');
    }
  },
};
