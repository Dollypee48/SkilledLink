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
        console.log("=== MESSAGE SERVICE DEBUG ===");
        console.log("messageService: Clearing conversation for user:", otherUserId);
        console.log("messageService: Using token:", token ? token.substring(0, 20) + '...' : 'No token');
        console.log("messageService: API endpoint:", `/messages/conversation/${otherUserId}`);
      }
      
      const response = await api.delete(`/messages/conversation/${otherUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Debug logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.log("messageService: Clear conversation response:", response.data);
        console.log("messageService: Response status:", response.status);
        console.log("=== MESSAGE SERVICE SUCCESS ===");
      }
      return response.data;
    } catch (error) {
      console.error("=== MESSAGE SERVICE ERROR ===");
      console.error("messageService: Error clearing conversation:", error);
      console.error("messageService: Error response:", error.response?.data);
      console.error("messageService: Error status:", error.response?.status);
      console.error("messageService: Error message:", error.message);
      throw new Error(error.response?.data?.message || "Failed to clear conversation");
    }
  },
};
