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
