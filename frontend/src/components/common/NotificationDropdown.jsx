import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, Trash2, MessageSquare, Briefcase, AlertTriangle } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotification();
  
  // Debug logging - only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('NotificationDropdown render:', { 
      notifications: notifications?.length || 0, 
      unreadCount, 
      isOpen,
      hasNotifications: !!notifications?.length,
      firstNotification: notifications?.[0]
    });
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    // Debug logging - only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Notification clicked:', notification);
    }
    
    // Don't mark offline notifications as read
    if (notification.id === 'offline-notification') {
      setIsOpen(false);
      return;
    }
    
    if (!notification.read) {
      // Handle both frontend-generated IDs and backend IDs
      const notificationId = notification._id || notification.id;
      markAsRead(notificationId);
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (notification) => {
    // Special case for offline notification
    if (notification.id === 'offline-notification') {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
    
    switch (notification.category) {
      case 'job_status':
        return <Briefcase className="w-5 h-5 text-blue-500" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'system':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button - Only Icon */}
      <button
        onClick={() => {
          // Debug logging - only in development
          if (process.env.NODE_ENV === 'development') {
            console.log('Bell button clicked, current state:', isOpen);
          }
          setIsOpen(!isOpen);
        }}
        className={`relative flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-full transition-colors focus:outline-none ${
          notifications.some(n => n.id === 'offline-notification') 
            ? 'text-red-500' 
            : 'text-[#151E3D]'
        }`}
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={async () => {
                    // Don't mark offline notifications as read
                    if (notifications.some(n => n.id === 'offline-notification')) {
                      alert('Cannot mark notifications as read while server is offline');
                      return;
                    }
                    
                    // Confirm before marking all as read
                    if (!window.confirm('Mark all notifications as read?')) {
                      return;
                    }
                    
                    setIsLoading(true);
                    try {
                      await markAllAsRead();
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className={`text-sm ${isLoading ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`}
                >
                  {isLoading ? 'Marking...' : 'Mark all read'}
                </button>
              )}
              <button
                onClick={async () => {
                  // Don't clear offline notifications
                  if (notifications.some(n => n.id === 'offline-notification')) {
                    alert('Cannot clear notifications while server is offline');
                    return;
                  }
                  
                  // Confirm before clearing
                  if (!window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
                    return;
                  }
                  
                  setIsLoading(true);
                  try {
                    await clearNotifications();
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className={`text-sm ${isLoading ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800'}`}
              >
                {isLoading ? 'Clearing...' : 'Clear all'}
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
                <p className="text-sm">You'll see important updates here</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={notification._id || notification.id || `notification-${index}`}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      {!notification.read && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span className="text-xs text-blue-600">New</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
