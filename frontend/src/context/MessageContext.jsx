import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { messageService } from '../services/messageService';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const MessageContext = createContext();

// Global socket instance
let globalSocketInstance = null;

// Initialize socket connection
const initializeSocket = (token) => {
  if (globalSocketInstance) {
    return globalSocketInstance;
  }

  // Get the base URL without /api suffix for socket connection
  const baseUrl = (import.meta.env.VITE_API_URL || 'https://skilledlink-1.onrender.com').replace('/api', '');
  globalSocketInstance = io(baseUrl, {
    auth: {
      token: token
    },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000
  });

  return globalSocketInstance;
};

export const MessageProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Refs to prevent infinite loops
  const selectedRecipientRef = useRef(null);
  const isFetchingConversationRef = useRef(false);

  // Update ref when selectedRecipient changes
  useEffect(() => {
    selectedRecipientRef.current = selectedRecipient;
  }, [selectedRecipient]);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const newSocket = initializeSocket(token);
      setSocket(newSocket);
    }
  }, []);

  // Reinitialize socket when user changes (login/logout)
  useEffect(() => {
    if (user && user._id) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        // Disconnect existing socket if any
        if (globalSocketInstance) {
          globalSocketInstance.disconnect();
          globalSocketInstance = null;
        }
        
        // Create new socket with current token
        const newSocket = initializeSocket(token);
        setSocket(newSocket);
        console.log('Socket reinitialized for user:', user._id);
      }
    } else {
      // User logged out - disconnect socket
      if (globalSocketInstance) {
        globalSocketInstance.disconnect();
        globalSocketInstance = null;
        setSocket(null);
        setIsConnected(false);
        console.log('Socket disconnected - user logged out');
      }
    }
  }, [user]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log('Socket connected');
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    };

    const handleNewMessage = (message) => {
      console.log('New message received:', message);
      
      // Update conversations list
      setConversations(prev => {
        const existingIndex = prev.findIndex(conv => conv.conversationId === message.conversationId);
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = { ...message, unreadCount: (updated[existingIndex].unreadCount || 0) + 1 };
          return updated;
        } else {
          return [{ ...message, unreadCount: 1 }, ...prev];
        }
      });

      // Update current conversation if it's the active one
      if (selectedRecipientRef.current && 
          (message.sender._id === selectedRecipientRef.current._id || 
           message.recipient._id === selectedRecipientRef.current._id)) {
        setCurrentConversation(prev => {
          const exists = prev.some(msg => msg._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
      
      // Also check if this message belongs to the current conversation by conversationId
      if (selectedRecipientRef.current && user) {
        const currentConversationId = [user._id, selectedRecipientRef.current._id].sort().join('_');
        if (message.conversationId === currentConversationId) {
          setCurrentConversation(prev => {
            const exists = prev.some(msg => msg._id === message._id);
            if (exists) return prev;
            return [...prev, message];
          });
        }
      }
    };

    const handleMessageDeleted = (data) => {
      setCurrentConversation(prev => prev.filter(msg => msg._id !== data.messageId));
    };

    const handleConversationCleared = (data) => {
      if (selectedRecipientRef.current && selectedRecipientRef.current._id === data.otherUserId) {
        setCurrentConversation([]);
      }
    };

    const handleNewNotification = (notification) => {
      window.dispatchEvent(new CustomEvent('newNotification', { detail: notification }));
    };

    const handleBookingStatusUpdated = (data) => {
      console.log('Booking status updated:', data);
      window.dispatchEvent(new CustomEvent('bookingStatusUpdated', { detail: data }));
    };

    const handleServiceProfileBookingStatusUpdated = (data) => {
      console.log('Service profile booking status updated:', data);
      window.dispatchEvent(new CustomEvent('serviceProfileBookingStatusUpdated', { detail: data }));
    };

    const handleNewReview = (data) => {
      console.log('New review received:', data);
      window.dispatchEvent(new CustomEvent('newReview', { detail: data }));
    };

    const handleArtisanProfileUpdated = (data) => {
      console.log('Artisan profile updated:', data);
      window.dispatchEvent(new CustomEvent('artisanProfileUpdated', { detail: data }));
    };

    const handleUserOnline = (data) => {
      console.log('User came online:', data);
      window.dispatchEvent(new CustomEvent('userOnline', { detail: data }));
    };

    const handleUserOffline = (data) => {
      console.log('User went offline:', data);
      window.dispatchEvent(new CustomEvent('userOffline', { detail: data }));
    };

    const handleUserStatusChanged = (data) => {
      console.log('User status changed:', data);
      window.dispatchEvent(new CustomEvent('userStatusChanged', { detail: data }));
    };

    // Add event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('newMessage', handleNewMessage);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('conversationCleared', handleConversationCleared);
    socket.on('newNotification', handleNewNotification);
    socket.on('bookingStatusUpdated', handleBookingStatusUpdated);
    socket.on('serviceProfileBookingStatusUpdated', handleServiceProfileBookingStatusUpdated);
    socket.on('newReview', handleNewReview);
    socket.on('artisanProfileUpdated', handleArtisanProfileUpdated);
    socket.on('userOnline', handleUserOnline);
    socket.on('userOffline', handleUserOffline);
    socket.on('userStatusChanged', handleUserStatusChanged);

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('newMessage', handleNewMessage);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('conversationCleared', handleConversationCleared);
      socket.off('newNotification', handleNewNotification);
      socket.off('bookingStatusUpdated', handleBookingStatusUpdated);
      socket.off('serviceProfileBookingStatusUpdated', handleServiceProfileBookingStatusUpdated);
      socket.off('newReview', handleNewReview);
      socket.off('artisanProfileUpdated', handleArtisanProfileUpdated);
      socket.off('userOnline', handleUserOnline);
      socket.off('userOffline', handleUserOffline);
      socket.off('userStatusChanged', handleUserStatusChanged);
    };
  }, [socket]);

  // Fetch conversations list
  const fetchConversations = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('🔐 User not authenticated, skipping conversation fetch');
      return;
    }

    console.log('Fetching conversations with token:', token.substring(0, 20) + '...');
    setLoading(true);
    try {
      const data = await messageService.getConversations(token);
      console.log('Conversations fetched:', data);
      setConversations(data || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch specific conversation
  const fetchConversation = useCallback(async (otherUserId) => {
    const token = localStorage.getItem('accessToken');
    if (!token || !otherUserId || isFetchingConversationRef.current) {
      console.log('Skipping conversation fetch - token:', !!token, 'otherUserId:', otherUserId, 'isFetching:', isFetchingConversationRef.current);
      return;
    }

    console.log('Fetching conversation for user:', otherUserId);
    isFetchingConversationRef.current = true;
    setLoading(true);
    
    try {
      const data = await messageService.getConversation(otherUserId, token);
      console.log('Conversation messages fetched:', data);
      setCurrentConversation(data || []);
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      setError('Failed to load conversation');
      setCurrentConversation([]);
    } finally {
      setLoading(false);
      isFetchingConversationRef.current = false;
    }
  }, []);

  // Send new message
  const sendNewMessage = useCallback(async (recipientId, content, fileData = null, fileType = null) => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('No authentication token');

    try {
      const response = await messageService.sendMessage(recipientId, content, fileData, fileType, token);
      return response;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, []);

  // Delete message
  const deleteMessage = useCallback(async (messageId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('No authentication token');

    try {
      await messageService.deleteMessage(messageId, token);
      setCurrentConversation(prev => prev.filter(msg => msg._id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  }, []);

  // Clear conversation
  const clearConversation = useCallback(async (otherUserId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('No authentication token');

    try {
      await messageService.clearConversation(otherUserId, token);
      setCurrentConversation([]);
    } catch (error) {
      console.error('Failed to clear conversation:', error);
      throw error;
    }
  }, []);

  // Set selected recipient
  const selectRecipient = useCallback((recipient) => {
    console.log('MessageContext - selectRecipient called with:', recipient);
    
    // Leave previous conversation room if exists
    if (socket && user && selectedRecipientRef.current) {
      const prevConversationId = [user._id, selectedRecipientRef.current._id].sort().join('_');
      console.log('Leaving previous conversation room:', prevConversationId);
      socket.emit('leaveConversation', prevConversationId);
    }
    
    setSelectedRecipient(recipient);
    if (recipient && recipient._id) {
      console.log('MessageContext - fetching conversation for:', recipient._id);
      fetchConversation(recipient._id);
      
      // Join conversation room for real-time updates
      if (socket && user) {
        const conversationId = [user._id, recipient._id].sort().join('_');
        console.log('Joining conversation room:', conversationId);
        socket.emit('joinConversation', conversationId);
      }
    }
  }, [fetchConversation, socket, user]);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
    
    // Check for stored recipient data from other pages
    const storedRecipient = sessionStorage.getItem('selectedRecipient');
    if (storedRecipient) {
      try {
        const recipientData = JSON.parse(storedRecipient);
        console.log('MessageContext - Found stored recipient:', recipientData);
        setSelectedRecipient(recipientData);
        fetchConversation(recipientData._id);
        // Clear the stored data after using it
        sessionStorage.removeItem('selectedRecipient');
      } catch (error) {
        console.error('Error parsing stored recipient data:', error);
        sessionStorage.removeItem('selectedRecipient');
      }
    }
  }, [fetchConversations, fetchConversation]);

  // Fetch conversations when user changes (login/logout)
  useEffect(() => {
    if (user && user._id) {
      fetchConversations();
    } else if (!user) {
      // Clear conversations when user logs out
      setConversations([]);
      setCurrentConversation([]);
      setSelectedRecipient(null);
    }
  }, [user, fetchConversations]);

  const value = {
    // State
    conversations,
    currentConversation,
    selectedRecipient,
    loading,
    error,
    socket,
    isConnected,
    
    // Actions
    fetchConversations,
    fetchConversation,
    sendNewMessage,
    deleteMessage,
    clearConversation,
    selectRecipient,
    setError
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    // Return a default context with no-op functions when used outside provider
    return {
      conversations: [],
      currentConversation: [],
      selectedRecipient: null,
      newMessage: '',
      isLoadingConversations: false,
      isLoadingConversation: false,
      isSendingMessage: false,
      fetchConversations: () => {},
      fetchConversation: () => {},
      sendMessage: () => {},
      selectRecipient: () => {},
      setNewMessage: () => {},
      clearConversation: () => {},
      deleteMessage: () => {},
      clearAllMessages: () => {}
    };
  }
  return context;
};