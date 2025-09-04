import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { messageService } from '../services/messageService';

const MessageContext = createContext(undefined); // Initialize with undefined, not null

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};

// --- Global Socket.IO Instance (outside React's lifecycle) ---
let globalSocketInstance = null;

// Function to reset the global socket instance
const resetGlobalSocket = () => {
  if (globalSocketInstance) {
    globalSocketInstance.disconnect();
    globalSocketInstance = null;
  }
};

const initializeSocket = (accessToken) => {
  if (globalSocketInstance) {
    return globalSocketInstance;
  }

  globalSocketInstance = io('http://localhost:5000', {
    auth: { token: accessToken || null },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5, // Limit reconnection attempts
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
    autoConnect: false, // Prevent auto-connection
    forceNew: true, // Force new connection
  });

  return globalSocketInstance;
};

export const MessageProvider = ({ children }) => {
  const authContext = useAuth();
  const { user, accessToken } = authContext || {};
  // const [socket, setSocket] = useState(null); // No longer needed, manage globalSocketInstance directly
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);

  const selectedRecipientRef = useRef(selectedRecipient);

  useEffect(() => {
    selectedRecipientRef.current = selectedRecipient;
  }, [selectedRecipient]);

  // Effect to reset socket when user logs out
  useEffect(() => {
    if (!user) {
      resetGlobalSocket();
      return;
    }
  }, [user]);

  // Effect to manage the global socket instance and its listeners
  useEffect(() => {
    if (!accessToken || !user) {
      return; // Don't initialize socket if no access token or user
    }
    
    const currentSocket = initializeSocket(accessToken);

    const onConnect = () => {
      // setSocket(currentSocket); // No longer needed
    };
    const onDisconnect = (reason) => {
      // setSocket(null); // No longer needed
    };
    const onConnectError = (err) => {
      console.error('Socket.IO Connection Error:', err.message || 'websocket error', err.data || err);
    };
    const onNewMessage = (message) => {
      setConversations(prev => {
        const existingConvIndex = prev.findIndex(c => c.conversationId === message.conversationId);
        if (existingConvIndex > -1) {
          const updatedConvs = [...prev];
          const isForCurrentUser = message.recipient._id === user?._id;
          const isActiveConversation = selectedRecipientRef.current &&
                                   (message.sender._id === selectedRecipientRef.current._id ||
                                    message.recipient._id === selectedRecipientRef.current._id);

          const newUnreadCount = isForCurrentUser && !isActiveConversation
                             ? updatedConvs[existingConvIndex].unreadCount + 1
                             : updatedConvs[existingConvIndex].unreadCount;

          updatedConvs[existingConvIndex] = { ...message, unreadCount: newUnreadCount };
          return updatedConvs;
        } else {
          const newUnreadCount = message.recipient._id === user?._id ? 1 : 0;
          return [{...message, unreadCount: newUnreadCount }, ...prev];
        }
      });

      if (selectedRecipientRef.current && (message.sender._id === selectedRecipientRef.current._id || message.recipient._id === selectedRecipientRef.current._id)) {
        setCurrentConversation(prev => [...prev, message]);
      }
    };

    const onMessageDeleted = (data) => {
      // Remove deleted message from current conversation
      setCurrentConversation(prev => prev.filter(msg => msg._id !== data.messageId));
      
      // Update conversations list if needed
      setConversations(prev => prev.map(conv => {
        if (conv.conversationId === data.conversationId && conv._id === data.messageId) {
          // Find the next message in the conversation to replace the deleted one
          return null; // This will be filtered out
        }
        return conv;
      }).filter(Boolean));
    };

    const onConversationCleared = (data) => {
      // Clear current conversation view only for the current user
      // This doesn't affect the other user's messages
      if (selectedRecipientRef.current && selectedRecipientRef.current._id === data.otherUserId) {
        setCurrentConversation([]);
      }
      
      // Note: We don't remove the conversation from the conversations list
      // as the messages still exist in the database for other users
    };

    currentSocket.on('connect', onConnect);
    currentSocket.on('disconnect', onDisconnect);
    currentSocket.on('connect_error', onConnectError);
    currentSocket.on('newMessage', onNewMessage);
    currentSocket.on('messageDeleted', onMessageDeleted);
    currentSocket.on('conversationCleared', onConversationCleared);

    return () => {
      currentSocket.off('connect', onConnect);
      currentSocket.off('disconnect', onDisconnect);
      currentSocket.off('connect_error', onConnectError);
      currentSocket.off('newMessage', onNewMessage);
      currentSocket.off('messageDeleted', onMessageDeleted);
      currentSocket.off('conversationCleared', onConversationCleared);
      
      // Disconnect the socket if it's connected
      if (currentSocket.connected) {
        currentSocket.disconnect();
      }
    };
  }, [user, accessToken]);

  // Effect to manage connection state and token updates
  useEffect(() => {
    const currentSocket = globalSocketInstance;

    if (!currentSocket) {
      return;
    }

    if (user && accessToken) {
      if (currentSocket.auth && currentSocket.auth.token !== accessToken) {
        currentSocket.auth.token = accessToken;
        if (currentSocket.connected) {
          currentSocket.disconnect();
        }
      }

      if (!currentSocket.connected) {
        currentSocket.connect();
      }
    } else {
      if (currentSocket.connected) {
        currentSocket.disconnect();
      }
    }

    return () => {
    };
  }, [user, accessToken]);

  const fetchConversations = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await messageService.getConversations(accessToken);
      setConversations(data);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  }, [accessToken, user]);

  useEffect(() => {
    if (globalSocketInstance && globalSocketInstance.connected && user && accessToken) { // Use globalSocketInstance to check connection
      fetchConversations();
    }
  }, [user, accessToken, fetchConversations]); // Removed `socket` from dependencies

  const fetchConversation = useCallback(async (otherUserId) => {
    if (!accessToken || !otherUserId) return;
    try {
      const data = await messageService.getConversation(otherUserId, accessToken);
      setCurrentConversation(data);
      const participant = data.find(msg => msg.sender._id === otherUserId || msg.recipient._id === otherUserId);
      if (participant) {
        setSelectedRecipient(participant.sender._id === otherUserId ? participant.sender : participant.recipient);
      }
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
      setCurrentConversation([]);
      setSelectedRecipient(null);
    }
  }, [accessToken]);

  const sendNewMessage = useCallback(async (recipientId, content, fileData = null, fileType = null) => {
    if (!accessToken || !globalSocketInstance || !user) return;
    try {
      await messageService.sendMessage(recipientId, content, fileData, fileType, accessToken);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [accessToken, user]);

  // Helper function to create conversation ID (same as backend)
  const getConversationId = (userId1, userId2) => {
    const sortedIds = [userId1.toString(), userId2.toString()].sort();
    return sortedIds.join('_');
  };

  // Delete a specific message
  const deleteMessage = useCallback(async (messageId) => {
    if (!accessToken) return;
    try {
      await messageService.deleteMessage(messageId, accessToken);
    } catch (error) {
      console.error("Failed to delete message:", error);
      throw error;
    }
  }, [accessToken]);

  // Clear all messages in a conversation (for current user only)
  const clearConversation = useCallback(async (otherUserId) => {
    if (!accessToken) {
      console.error("No access token available for clearConversation");
      throw new Error("No access token available");
    }
    
    if (!otherUserId) {
      console.error("No otherUserId provided for clearConversation");
      throw new Error("No user ID provided");
    }
    
    try {
      // Debug logging - only in development
      if (process.env.NODE_ENV === 'development') {
        // Attempting to clear conversation
      }
      
      const result = await messageService.clearConversation(otherUserId, accessToken);
      
      // Clear the current conversation view immediately
      setCurrentConversation([]);
      
      // Debug logging - only in development
      if (process.env.NODE_ENV === 'development') {
        // Clear conversation successful
      }
      
      // Note: This only clears the current user's view
      // The other user's messages remain unchanged
    } catch (error) {
      console.error("Failed to clear conversation:", error);
      throw error;
    }
  }, [accessToken, user]);

  const value = {
    socket: globalSocketInstance,
    conversations,
    currentConversation,
    selectedRecipient,
    fetchConversations,
    fetchConversation,
    sendNewMessage,
    deleteMessage,
    clearConversation,
    setSelectedRecipient,
  };

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
};
