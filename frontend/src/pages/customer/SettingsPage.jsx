import React, { useState, useEffect } from 'react';
import CustomerLayout from '../../components/common/Layouts/CustomerLayout';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { User, Lock, Eye, EyeOff, Camera, Bell, Shield, Trash2, LogOut, Settings, Mail, Smartphone, Globe, AlertTriangle } from 'lucide-react';

const SettingsPage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
    nationality: '',
    state: '',
    occupation: '',
    email: '', // Add email field for display/verification
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    sms: true,
    push: true,
    jobUpdates: true,
    messages: true,
    reviews: true,
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showPhone: true,
    showEmail: false,
    showLocation: true,
  });

  // KYC documents state
  const [kycDocuments, setKycDocuments] = useState({
    idProof: null,
    addressProof: null,
    faceImage: null,
  });
  
  // UI state
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [privacyLoading, setPrivacyLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        nationality: user.nationality || '',
        state: user.state || '',
        occupation: user.occupation || '',
        email: user.email || '',
      });
      setProfileImagePreview(user.profileImageUrl || '');
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProfileImage(null);
      setProfileImagePreview(user?.profileImageUrl || '');
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Basic validation
    if (!profileForm.name.trim()) {
      toast.error('Name is required');
      setLoading(false);
      return;
    }
    
    if (profileForm.phone && !/^\+?\d{10,15}$/.test(profileForm.phone)) {
      toast.error('Please enter a valid phone number');
      setLoading(false);
      return;
    }
    
    try {
      let imageData = null;
      if (profileImage) {
        // Validate image size (max 5MB)
        if (profileImage.size > 5 * 1024 * 1024) {
          toast.error('Image size must be less than 5MB');
          setLoading(false);
          return;
        }
        
        const imageBase64 = await fileToBase64(profileImage);
        imageData = {
          data: imageBase64,
          type: profileImage.type // Send the actual file type
        };
      } else if (user?.profileImageUrl && !profileImagePreview) {
        imageData = 'REMOVE_IMAGE';
      }

      const dataToUpdate = { ...profileForm };
      if (imageData) {
        dataToUpdate.profileImage = imageData;
      }

      const updatedUser = await updateProfile(dataToUpdate, user.role);
      toast.success('Profile updated successfully!');
      
      // Update the profile image preview with the new URL
      if (updatedUser && updatedUser.profileImageUrl) {
        setProfileImagePreview(updatedUser.profileImageUrl);
      }
      
      // Reset form state
      setProfileImage(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    
    setPasswordLoading(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      toast.success('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleNotificationChange = (key) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrivacyChange = (key, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNotificationSave = async () => {
    setNotificationLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notification preferences updated successfully!');
    } catch (error) {
      toast.error('Failed to update notification preferences');
    } finally {
      setNotificationLoading(false);
    }
  };

  const handlePrivacySave = async () => {
    setPrivacyLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Privacy settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update privacy settings');
    } finally {
      setPrivacyLoading(false);
    }
  };

  const handleDeactivateAccount = () => {
    if (window.confirm('Are you sure you want to deactivate your account? This action can be reversed by contacting support.')) {
      toast.info('Account deactivation feature coming soon');
    }
  };

  const handleLogoutAllDevices = () => {
    if (window.confirm('This will log you out of all devices. Are you sure?')) {
      toast.info('Logout all devices feature coming soon');
    }
  };

  if (!user) {
    return (
      <CustomerLayout>
        <div className="p-8 min-h-screen bg-gray-100">
          <p className="text-center text-gray-600 text-lg py-12">Please log in to manage your settings.</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Modern Header with Glass Effect */}
        <div className="relative bg-white/90 backdrop-blur-sm shadow-xl border-b border-white/20">
          <div className="absolute inset-0 bg-gradient-to-r from-[#151E3D]/5 via-blue-50/50 to-[#F59E0B]/5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#151E3D] via-blue-600 to-[#1E2A4A] bg-clip-text text-transparent">
                  Account Settings
                </h1>
                <p className="text-gray-600 text-lg">Manage your profile, security, and preferences</p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Account Active</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#151E3D] to-[#1E2A4A] rounded-2xl flex items-center justify-center shadow-lg">
                  <Settings className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Modern Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Settings Menu</h3>
                <nav className="space-y-3">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-300 group ${
                      activeTab === 'profile'
                        ? 'bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                      activeTab === 'profile' ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-blue-100'
                    }`}>
                      <User className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Profile Information</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('password')}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-300 group ${
                      activeTab === 'password'
                        ? 'bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                      activeTab === 'password' ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-blue-100'
                    }`}>
                      <Lock className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Security & Password</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-300 group ${
                      activeTab === 'notifications'
                        ? 'bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                      activeTab === 'notifications' ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-blue-100'
                    }`}>
                      <Bell className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Notifications</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('privacy')}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-300 group ${
                      activeTab === 'privacy'
                        ? 'bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                      activeTab === 'privacy' ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-blue-100'
                    }`}>
                      <Shield className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Privacy & Security</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('account')}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-300 group ${
                      activeTab === 'account'
                        ? 'bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                      activeTab === 'account' ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-blue-100'
                    }`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Account Actions</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">

                {/* Profile Settings Tab */}
                {activeTab === 'profile' && (
                  <div className="p-8">
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] rounded-lg flex items-center justify-center mr-4">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                        <p className="text-gray-600">Update your personal details and profile picture</p>
                      </div>
                    </div>
                    
                    <form onSubmit={handleProfileSubmit}>
                      {/* Profile Image Section */}
                      <div className="flex flex-col items-center mb-8 p-6 bg-gray-50 rounded-xl">
                        <div className="relative w-32 h-32 mb-4">
                          {profileImagePreview ? (
                            <img 
                              src={profileImagePreview} 
                              alt="Profile" 
                              className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg" 
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-4 border-white shadow-lg">
                              <User className="w-16 h-16 text-gray-500" />
                            </div>
                          )}
                          <label htmlFor="profile-image-upload" className="absolute bottom-0 right-0 bg-[#151E3D] hover:bg-[#1E2A4A] text-white rounded-full p-3 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl">
                            <Camera className="h-5 w-5" />
                            <input 
                              id="profile-image-upload" 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleImageChange} 
                            />
                          </label>
                        </div>
                        {profileImagePreview && (
                          <button
                            type="button"
                            onClick={() => { setProfileImage(null); setProfileImagePreview(''); }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 text-sm mt-2 px-4 py-2 rounded-lg transition-all duration-300 border border-red-200"
                          >
                            Remove Image
                          </button>
                        )}
                        <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">
                          Click the camera icon to upload a new profile picture. Recommended size: 400x400px
                        </p>
                      </div>

                      {/* Profile Form Fields */}
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={profileForm.name}
                              onChange={handleProfileChange}
                              required
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D] transition-all duration-200 bg-white"
                              placeholder="Enter your full name"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                              Email Address
                            </label>
                            <div className="relative">
                              <input
                                type="email"
                                name="email"
                                id="email"
                                value={profileForm.email}
                                disabled
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed"
                                placeholder="Email address"
                              />
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="flex items-center space-x-1 text-green-600">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-xs font-medium">Verified</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">Email cannot be changed. Contact support if needed.</p>
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              id="phone"
                              value={profileForm.phone}
                              onChange={handleProfileChange}
                              required
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D] transition-all duration-200 bg-white"
                              placeholder="Enter your phone number"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="address" className="block text-sm font-semibold text-gray-700">
                              Address *
                            </label>
                            <input
                              type="text"
                              name="address"
                              id="address"
                              value={profileForm.address}
                              onChange={handleProfileChange}
                              required
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D] transition-all duration-200 bg-white"
                              placeholder="Enter your address"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="nationality" className="block text-sm font-semibold text-gray-700">
                              Nationality *
                            </label>
                            <input
                              type="text"
                              name="nationality"
                              id="nationality"
                              value={profileForm.nationality}
                              onChange={handleProfileChange}
                              required
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D] transition-all duration-200 bg-white"
                              placeholder="Enter your nationality"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="state" className="block text-sm font-semibold text-gray-700">
                              State/Province
                            </label>
                            <input
                              type="text"
                              name="state"
                              id="state"
                              value={profileForm.state}
                              onChange={handleProfileChange}
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D] transition-all duration-200 bg-white"
                              placeholder="Enter your state or province"
                            />
                          </div>
                          
                          <div className="space-y-2 md:col-span-2">
                            <label htmlFor="occupation" className="block text-sm font-semibold text-gray-700">
                              Occupation
                            </label>
                            <input
                              type="text"
                              name="occupation"
                              id="occupation"
                              value={profileForm.occupation}
                              onChange={handleProfileChange}
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D] transition-all duration-200 bg-white"
                              placeholder="Enter your occupation (optional)"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-gray-200">
                          <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] hover:from-[#1E2A4A] hover:to-[#151E3D] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#151E3D] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                          >
                            {loading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving Changes...
                              </>
                            ) : (
                              'Save Profile Changes'
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* Password Change Tab */}
                {activeTab === 'password' && (
                  <div className="p-8">
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] rounded-lg flex items-center justify-center mr-4">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Security & Password</h2>
                        <p className="text-gray-600">Update your password to keep your account secure</p>
                      </div>
                    </div>
                    
                    <form onSubmit={handlePasswordSubmit} className="max-w-2xl">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700">
                            Current Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.current ? 'text' : 'password'}
                              name="currentPassword"
                              id="currentPassword"
                              value={passwordForm.currentPassword}
                              onChange={handlePasswordChange}
                              required
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D] transition-all duration-200 bg-white"
                              placeholder="Enter your current password"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('current')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.current ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700">
                            New Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              name="newPassword"
                              id="newPassword"
                              value={passwordForm.newPassword}
                              onChange={handlePasswordChange}
                              required
                              minLength={6}
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D] transition-all duration-200 bg-white"
                              placeholder="Enter your new password"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('new')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.new ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          <p className="text-sm text-gray-500">Must be at least 6 characters long</p>
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                            Confirm New Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              name="confirmPassword"
                              id="confirmPassword"
                              value={passwordForm.confirmPassword}
                              onChange={handlePasswordChange}
                              required
                              minLength={6}
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D] transition-all duration-200 bg-white"
                              placeholder="Confirm your new password"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('confirm')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.confirm ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
                        <button
                          type="submit"
                          disabled={passwordLoading}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] hover:from-[#1E2A4A] hover:to-[#151E3D] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#151E3D] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                          {passwordLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Changing Password...
                            </>
                          ) : (
                            'Change Password'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="p-8">
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] rounded-lg flex items-center justify-center mr-4">
                        <Bell className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Notification Preferences</h2>
                        <p className="text-gray-600">Choose how you want to be notified about updates</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Mail className="w-5 h-5 mr-2 text-[#151E3D]" />
                          Communication Channels
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Email Notifications</p>
                              <p className="text-sm text-gray-500">Receive updates via email</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notificationPrefs.email}
                                onChange={() => handleNotificationChange('email')}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#151E3D]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#151E3D]"></div>
                            </label>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">SMS Notifications</p>
                              <p className="text-sm text-gray-500">Receive updates via text message</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notificationPrefs.sms}
                                onChange={() => handleNotificationChange('sms')}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#151E3D]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#151E3D]"></div>
                            </label>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Push Notifications</p>
                              <p className="text-sm text-gray-500">Receive browser push notifications</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notificationPrefs.push}
                                onChange={() => handleNotificationChange('push')}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#151E3D]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#151E3D]"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Types</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Job Updates</p>
                              <p className="text-sm text-gray-500">Updates about your bookings and services</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notificationPrefs.jobUpdates}
                                onChange={() => handleNotificationChange('jobUpdates')}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#151E3D]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#151E3D]"></div>
                            </label>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Messages</p>
                              <p className="text-sm text-gray-500">New messages from artisans</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notificationPrefs.messages}
                                onChange={() => handleNotificationChange('messages')}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#151E3D]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#151E3D]"></div>
                            </label>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Reviews & Ratings</p>
                              <p className="text-sm text-gray-500">When you receive new reviews</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notificationPrefs.reviews}
                                onChange={() => handleNotificationChange('reviews')}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#151E3D]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#151E3D]"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-6 border-t border-gray-200">
                        <button
                          onClick={handleNotificationSave}
                          disabled={notificationLoading}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] hover:from-[#1E2A4A] hover:to-[#151E3D] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#151E3D] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                          {notificationLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            'Save Notification Preferences'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div className="p-8">
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] rounded-lg flex items-center justify-center mr-4">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Privacy & Security</h2>
                        <p className="text-gray-600">Control your privacy settings and data visibility</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Globe className="w-5 h-5 mr-2 text-[#151E3D]" />
                          Profile Visibility
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                            <select
                              value={privacySettings.profileVisibility}
                              onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D] transition-all duration-200 bg-white"
                            >
                              <option value="public">Public - Visible to all users</option>
                              <option value="artisans">Artisans Only - Visible to artisans</option>
                              <option value="private">Private - Only visible to you</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Show Phone Number</p>
                              <p className="text-sm text-gray-500">Allow artisans to see your phone number</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={privacySettings.showPhone}
                                onChange={() => handlePrivacyChange('showPhone', !privacySettings.showPhone)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#151E3D]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#151E3D]"></div>
                            </label>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Show Email Address</p>
                              <p className="text-sm text-gray-500">Allow artisans to see your email address</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={privacySettings.showEmail}
                                onChange={() => handlePrivacyChange('showEmail', !privacySettings.showEmail)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#151E3D]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#151E3D]"></div>
                            </label>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Show Location</p>
                              <p className="text-sm text-gray-500">Allow artisans to see your general location</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={privacySettings.showLocation}
                                onChange={() => handlePrivacyChange('showLocation', !privacySettings.showLocation)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#151E3D]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#151E3D]"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-6 border-t border-gray-200">
                        <button
                          onClick={handlePrivacySave}
                          disabled={privacyLoading}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] hover:from-[#1E2A4A] hover:to-[#151E3D] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#151E3D] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                          {privacyLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            'Save Privacy Settings'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Actions Tab */}
                {activeTab === 'account' && (
                  <div className="p-8">
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] rounded-lg flex items-center justify-center mr-4">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Account Actions</h2>
                        <p className="text-gray-600">Manage your account and security settings</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                          <LogOut className="w-5 h-5 mr-2" />
                          Security Actions
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-blue-900">Log Out All Devices</p>
                              <p className="text-sm text-blue-700">Sign out from all devices and browsers</p>
                            </div>
                            <button
                              onClick={handleLogoutAllDevices}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                            >
                              Log Out All
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                          <Trash2 className="w-5 h-5 mr-2" />
                          Danger Zone
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-900">Deactivate Account</p>
                              <p className="text-sm text-red-700">Temporarily disable your account. You can reactivate it later.</p>
                            </div>
                            <button
                              onClick={handleDeactivateAccount}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                            >
                              Deactivate
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default SettingsPage;
