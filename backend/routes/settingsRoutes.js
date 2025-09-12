const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getSettings,
  updateNotificationPreferences,
  updatePrivacySettings,
  deactivateAccount,
  logoutAllDevices
} = require('../controllers/settingsController');

// @route   GET /api/settings
// @desc    Get user settings
// @access  Private
router.get('/', auth, getSettings);

// @route   PUT /api/settings/notifications
// @desc    Update notification preferences
// @access  Private
router.put('/notifications', auth, updateNotificationPreferences);

// @route   PUT /api/settings/privacy
// @desc    Update privacy settings
// @access  Private
router.put('/privacy', auth, updatePrivacySettings);

// @route   PUT /api/settings/deactivate
// @desc    Deactivate account
// @access  Private
router.put('/deactivate', auth, deactivateAccount);

// @route   POST /api/settings/logout-all
// @desc    Logout all devices
// @access  Private
router.post('/logout-all', auth, logoutAllDevices);

module.exports = router;
