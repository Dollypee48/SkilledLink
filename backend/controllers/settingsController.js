const User = require('../models/User');

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notificationPreferences privacySettings');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      notificationPreferences: user.notificationPreferences,
      privacySettings: user.privacySettings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error fetching settings', error: error.message });
  }
};

// @desc    Update notification preferences
// @route   PUT /api/settings/notifications
// @access  Private
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const { notificationPreferences } = req.body;
    
    // Validate notification preferences
    const validKeys = ['email', 'sms', 'push', 'jobUpdates', 'messages', 'reviews', 'earnings', 'jobRequests'];
    const updates = {};
    
    for (const key of validKeys) {
      if (notificationPreferences.hasOwnProperty(key)) {
        if (typeof notificationPreferences[key] !== 'boolean') {
          return res.status(400).json({ message: `Invalid value for ${key}. Must be boolean.` });
        }
        updates[`notificationPreferences.${key}`] = notificationPreferences[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, select: 'notificationPreferences' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Notification preferences updated successfully',
      notificationPreferences: user.notificationPreferences
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ message: 'Server error updating notification preferences', error: error.message });
  }
};

// @desc    Update privacy settings
// @route   PUT /api/settings/privacy
// @access  Private
exports.updatePrivacySettings = async (req, res) => {
  try {
    const { privacySettings } = req.body;
    
    // Validate privacy settings
    const validKeys = ['profileVisibility', 'showPhone', 'showEmail', 'showLocation', 'allowMessages', 'showOnlineStatus'];
    const updates = {};
    
    for (const key of validKeys) {
      if (privacySettings.hasOwnProperty(key)) {
        if (key === 'profileVisibility') {
          if (!['public', 'private', 'contacts'].includes(privacySettings[key])) {
            return res.status(400).json({ message: 'Invalid profile visibility value' });
          }
        } else if (typeof privacySettings[key] !== 'boolean') {
          return res.status(400).json({ message: `Invalid value for ${key}. Must be boolean.` });
        }
        updates[`privacySettings.${key}`] = privacySettings[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, select: 'privacySettings' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Privacy settings updated successfully',
      privacySettings: user.privacySettings
    });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    res.status(500).json({ message: 'Server error updating privacy settings', error: error.message });
  }
};

// @desc    Deactivate account
// @route   PUT /api/settings/deactivate
// @access  Private
exports.deactivateAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        isSuspended: true,
        suspensionReason: 'User requested deactivation',
        suspensionDate: new Date()
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating account:', error);
    res.status(500).json({ message: 'Server error deactivating account', error: error.message });
  }
};

// @desc    Logout all devices
// @route   POST /api/settings/logout-all
// @access  Private
exports.logoutAllDevices = async (req, res) => {
  try {
    // Clear refresh token to invalidate all sessions
    await User.findByIdAndUpdate(
      req.user.id,
      { refreshToken: null }
    );

    res.json({ message: 'Logged out from all devices successfully' });
  } catch (error) {
    console.error('Error logging out all devices:', error);
    res.status(500).json({ message: 'Server error logging out all devices', error: error.message });
  }
};
