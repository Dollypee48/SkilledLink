import api from '../utils/api';

export const messageService = {
  sendMessage: async (recipientId, content, fileData, fileType, token) => {
    try {
      const response = await api.post(
        '/messages',
        { recipientId, content, fileData, fileType }, // Include fileData and fileType
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw new Error(error.response?.data?.message || "Failed to send message");
    }
  },

  getConversation: async (otherUserId, token) => {
    try {
      const response = await api.get(`/messages/${otherUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching conversation:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch conversation");
    }
  },

  getConversations: async (token) => {
    try {
      const response = await api.get('/messages/conversations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching conversations list:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch conversations list");
    }
  },

  // Delete a specific message
  deleteMessage: async (messageId, token) => {
    try {
      const response = await api.delete(`/messages/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting message:", error);
      throw new Error(error.response?.data?.message || "Failed to delete message");
    }
  },

  // Clear all messages in a conversation
  clearConversation: async (otherUserId, token) => {
    try {
      // Debug logging - only in development
      if (process.env.NODE_ENV === 'development') {
        // Clearing conversation for user
      }
      
      const response = await api.delete(`/messages/conversation/${otherUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Debug logging - only in development
      if (process.env.NODE_ENV === 'development') {
        // Clear conversation successful
      }
      return response.data;
    } catch (error) {
      console.error("Error clearing conversation:", error);
      throw new Error(error.response?.data?.message || "Failed to clear conversation");
    }
  },
};
