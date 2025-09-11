import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';

const NotificationContext = createContext(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, accessToken } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Debug logging removed for production

  // Show toast notification
  const showNotification = useCallback((type, message, options = {}) => {
    const toastOptions = {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    };

    switch (type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
      case 'warning':
        toast.warning(message, toastOptions);
        break;
      case 'info':
        toast.info(message, toastOptions);
        break;
      default:
        toast(message, toastOptions);
    }
  }, []);

  // Add notification to list
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      _id: notification._id || `frontend_${Date.now()}`,
      timestamp: new Date(),
      read: false,
      ...notification
    };
    
    // Check if notification with same content already exists (prevent duplicates)
    setNotifications(prev => {
      const isDuplicate = prev.some(existing => 
        existing.title === newNotification.title && 
        existing.message === newNotification.message &&
        Math.abs(new Date(existing.timestamp) - new Date(newNotification.timestamp)) < 5000 // Within 5 seconds
      );
      
      if (isDuplicate) {
        // Debug logging - only in development
        if (process.env.NODE_ENV === 'development') {
          // Duplicate notification prevented
        }
        return prev;
      }
      
      return [newNotification, ...prev];
    });
    
    // Only increment unread count if not duplicate
    setUnreadCount(prev => {
      const isDuplicate = notifications.some(existing => 
        existing.title === newNotification.title && 
        existing.message === newNotification.message &&
        Math.abs(new Date(existing.timestamp) - new Date(newNotification.timestamp)) < 5000
      );
      
      return isDuplicate ? prev : prev + 1;
    });
    
    // Show toast for important notifications
    if (notification.important) {
      showNotification(notification.type || 'info', notification.message);
    }
  }, [showNotification]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      if (!accessToken) {
        throw new Error("Please log in to perform this action");
      }
      
      await notificationService.markAsRead(notificationId, accessToken);
      
      setNotifications(prev => 
        prev.map(notif => 
          (notif._id === notificationId || notif.id === notificationId)
            ? { ...notif, read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showNotification('error', error.message || 'Failed to mark notification as read');
    }
  }, [accessToken, showNotification]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      if (!accessToken) {
        throw new Error("Please log in to perform this action");
      }
      
      await notificationService.markAllAsRead(accessToken);
      
      // Update frontend state
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
      
      // Show success message
      showNotification('success', 'All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showNotification('error', error.message || 'Failed to mark notifications as read');
    }
  }, [accessToken, showNotification]);

  // Clear all notifications
  const clearNotifications = useCallback(async () => {
    try {
      if (!accessToken) {
        throw new Error("Please log in to perform this action");
      }
      
      await notificationService.clearAllNotifications(accessToken);
      
      // Clear frontend state after successful backend call
      setNotifications([]);
      setUnreadCount(0);
      
      // Show success message
      showNotification('success', 'All notifications cleared successfully');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      showNotification('error', error.message || 'Failed to clear notifications');
    }
  }, [accessToken, showNotification]);

  // Job status change notifications
  const notifyJobStatusChange = useCallback((jobData, newStatus, userRole) => {
    if (userRole === 'artisan') {
      // Notify artisan about job status changes
      switch (newStatus) {
        case 'Accepted':
          addNotification({
            type: 'success',
            title: 'Job Accepted!',
            message: `You've accepted the ${jobData.service} job. Status changed to "In Progress".`,
            category: 'job_status',
            important: true
          });
          break;
        case 'Completed':
          addNotification({
            type: 'success',
            title: 'Job Completed!',
            message: `Great work! The ${jobData.service} job has been marked as completed.`,
            category: 'job_status',
            important: true
          });
          break;
        case 'Pending Confirmation':
          addNotification({
            type: 'info',
            title: 'Waiting for Customer Confirmation',
            message: `Confirmation message sent to customer for ${jobData.service} job. Waiting for their response.`,
            category: 'job_status',
            important: true
          });
          break;
      }
    } else if (userRole === 'customer') {
      // Notify customer about job status changes
      switch (newStatus) {
        case 'Accepted':
          addNotification({
            type: 'success',
            title: 'Job Started!',
            message: `Your ${jobData.service} job has been accepted and is now in progress.`,
            category: 'job_status',
            important: true
          });
          break;
        case 'Pending Confirmation':
          addNotification({
            type: 'warning',
            title: 'Job Completion Request',
            message: `The artisan has completed your ${jobData.service} job and is waiting for your confirmation. Please check your messages.`,
            category: 'job_status',
            important: true
          });
          break;
        case 'Completed':
          addNotification({
            type: 'success',
            title: 'Job Completed!',
            message: `Your ${jobData.service} job has been completed successfully.`,
            category: 'job_status',
            important: true
          });
          break;
        case 'Declined':
          addNotification({
            type: 'error',
            title: 'Job Declined',
            message: `Unfortunately, your ${jobData.service} job has been declined by the artisan.`,
            category: 'job_status',
            important: true
          });
          break;
      }
    }
  }, [addNotification]);

  // Message notifications - will be handled by MessageContext to avoid circular dependencies

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!accessToken) {
      // Debug logging - only in development
      if (process.env.NODE_ENV === 'development') {
        // No access token available for notifications
      }
      return;
    }
    
    // Fetching notifications from API
    
    try {
      const data = await notificationService.getUserNotifications(accessToken);
      
      // Transform backend notifications to match frontend structure
      const transformedNotifications = data.map(notification => ({
        ...notification,
        id: notification._id, // Ensure frontend ID exists
        timestamp: new Date(notification.createdAt || notification.timestamp)
      }));
      
      // Successfully fetched notifications from API
      
      // Check for duplicates before setting
      setNotifications(prev => {
        const newNotifications = [...transformedNotifications];
        const existingTitles = prev.map(n => n.title);
        
        // Filter out duplicates based on title
        const uniqueNotifications = newNotifications.filter(notification => 
          !existingTitles.includes(notification.title)
        );
        
        if (uniqueNotifications.length !== newNotifications.length) {
                  // Filtered out duplicate notifications from API
        }
        
        return [...uniqueNotifications, ...prev];
      });
      
      // Get unread count
      const unreadData = await notificationService.getUnreadCount(accessToken);
      // Unread count fetched from API
      setUnreadCount(unreadData.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Check if it's a connection error
      if (error.message.includes('Network Error') || error.message.includes('Unable to connect to server')) {
        // Backend server is down - show offline message
        setNotifications([{
          id: 'offline-notification',
          _id: 'offline-notification',
          title: 'Server Offline',
          message: 'Unable to connect to notification server. Please check your connection.',
          type: 'warning',
          category: 'system',
          important: false,
          read: false,
          timestamp: new Date()
        }]);
        setUnreadCount(1);
      } else {
        // Other error - set empty notifications
        setNotifications([]);
        setUnreadCount(0);
      }
    }
  }, [accessToken]);

  // Note: Socket.IO message and notification handling will be moved to MessageContext
  // to avoid circular dependencies

  // Fetch notifications when component mounts or token changes
  useEffect(() => {
    if (accessToken) {
      fetchNotifications();
    }
  }, [accessToken, fetchNotifications]);

  // Auto-clear old notifications (older than 7 days)
  useEffect(() => {
    const interval = setInterval(() => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      setNotifications(prev => 
        prev.filter(notif => notif.timestamp > sevenDaysAgo)
      );
    }, 24 * 60 * 60 * 1000); // Check every 24 hours

    return () => clearInterval(interval);
  }, []);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    notifyJobStatusChange,
    showNotification,
    fetchNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
