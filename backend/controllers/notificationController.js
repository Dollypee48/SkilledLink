const NotificationService = require('../services/notificationService');

// Get user's notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, skip = 0 } = req.query;

    const notifications = await NotificationService.getUserNotifications(
      userId, 
      parseInt(limit), 
      parseInt(skip)
    );

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({ message: 'Server error while fetching notifications' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const notification = await NotificationService.markAsRead(notificationId, userId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error while marking notification as read' });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await NotificationService.markAllAsRead(userId);

    res.json({ 
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error while marking all notifications as read' });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await NotificationService.getUnreadCount(userId);

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Server error while getting unread count' });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const notification = await NotificationService.deleteNotification(notificationId, userId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error while deleting notification' });
  }
};

// Clear all notifications for a user
exports.clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Clearing all notifications for user:', userId);

    const result = await NotificationService.clearAllNotifications(userId);
    console.log('Clear all notifications result:', result);

    res.json({ 
      message: 'All notifications cleared successfully',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error clearing all notifications:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    res.status(500).json({ 
      message: 'Server error while clearing all notifications',
      error: error.message 
    });
  }
};
