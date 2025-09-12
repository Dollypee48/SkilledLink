import api from '../utils/api';

// Get user settings
export const getSettings = async () => {
  try {
    const response = await api.get('/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (notificationPreferences) => {
  try {
    const response = await api.put('/settings/notifications', {
      notificationPreferences
    });
    return response.data;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};

// Update privacy settings
export const updatePrivacySettings = async (privacySettings) => {
  try {
    const response = await api.put('/settings/privacy', {
      privacySettings
    });
    return response.data;
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    throw error;
  }
};

// Deactivate account
export const deactivateAccount = async () => {
  try {
    const response = await api.put('/settings/deactivate');
    return response.data;
  } catch (error) {
    console.error('Error deactivating account:', error);
    throw error;
  }
};

// Logout all devices
export const logoutAllDevices = async () => {
  try {
    const response = await api.post('/settings/logout-all');
    return response.data;
  } catch (error) {
    console.error('Error logging out all devices:', error);
    throw error;
  }
};
