const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  clearAllNotifications
} = require('../controllers/notificationController');

// All routes require authentication
router.use(auth);

// Test endpoint to verify routing is working
router.get('/test', (req, res) => {
  res.json({ message: 'Notification routes are working', user: req.user?.id });
});

// Test endpoint to create a notification
router.post('/test', async (req, res) => {
  try {
    const NotificationService = require('../services/notificationService');
    const notification = await NotificationService.createNotification({
      recipient: req.user.id,
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working.',
      type: 'info',
      category: 'system',
      important: true
    });
    res.json({ message: 'Test notification created', notification });
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json({ message: 'Error creating test notification', error: error.message });
  }
});

// Get user's notifications
router.get('/', getUserNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark all notifications as read
router.put('/mark-all-read', markAllAsRead);

// Clear all notifications for a user
router.delete('/clear-all', (req, res, next) => {
  console.log('Route: /clear-all hit');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('User:', req.user);
  next();
}, clearAllNotifications);

// Mark notification as read
router.put('/:notificationId/read', markAsRead);

// Delete notification
router.delete('/:notificationId', deleteNotification);

module.exports = router;
