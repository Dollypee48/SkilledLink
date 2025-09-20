import React, { useState, useEffect } from 'react';
import ArtisanLayout from '../../components/common/Layouts/ArtisanLayout';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { User, Lock, Eye, EyeOff, Camera, Wrench, Bell, Shield, Trash2, LogOut, Settings, Mail, Smartphone, Globe, AlertTriangle, Briefcase, Star, CheckCircle, XCircle, MapPin, Plus, Edit3, Calendar } from 'lucide-react';
import KYCForm from '../../components/KYCForm';
import AutoLocationDetector from '../../components/AutoLocationDetector';
import ServiceProfileModal from '../../components/ServiceProfileModal';
import serviceProfileService from '../../services/serviceProfileService';
import { getSettings, updateNotificationPreferences, updatePrivacySettings, deactivateAccount, logoutAllDevices } from '../../services/settingsService';
import { issueService } from '../../services/issueService';

const ArtisanSettingsPage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  
  // Service Profile state
  const [serviceProfiles, setServiceProfiles] = useState([]);
  const [serviceProfileStats, setServiceProfileStats] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingServiceProfile, setEditingServiceProfile] = useState(null);
  const [serviceProfileLoading, setServiceProfileLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingServiceProfile, setViewingServiceProfile] = useState(null);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
    nationality: '',
    state: '',
    occupation: '',
    // Artisan specific
    service: '',
    bio: '',
    experience: '',
    skills: '',
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
    jobRequests: true,
    messages: true,
    reviews: true,
    earnings: true,
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showPhone: true,
    showEmail: false,
    showLocation: true,
    showPortfolio: true,
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

  // Report issue form state
  const [reportForm, setReportForm] = useState({
    category: '',
    title: '',
    description: '',
    priority: 'medium',
    file: null
  });
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        nationality: user.nationality || '',
        state: user.state || '',
        occupation: user.occupation || '',
        // Artisan specific
        service: user.artisanProfile?.service || '',
        bio: user.artisanProfile?.bio || '',
        experience: user.artisanProfile?.experience || '',
        skills: user.artisanProfile?.skills?.join(', ') || '',
      });
      setProfileImagePreview(user.profileImageUrl || '');
      
      // Load user settings
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const settings = await getSettings();
      if (settings.notificationPreferences) {
        setNotificationPrefs(settings.notificationPreferences);
      }
      if (settings.privacySettings) {
        setPrivacySettings(settings.privacySettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Use default settings if loading fails
    }
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleLocationDetected = (locationData) => {
    console.log('📍 Location detected:', locationData);
    
    // Update the profile form with detected location
    setProfileForm(prev => ({
      ...prev,
      address: locationData.address,
      state: locationData.state
    }));

    // No toast notification - silent operation
  };

  const handleLocationUpdated = async (locationData) => {
    console.log('📍 Auto-saving location to profile:', locationData);
    
    try {
      // Auto-save the location to the profile
      const dataToUpdate = {
        address: locationData.address,
        state: locationData.state
      };

      await updateProfile(dataToUpdate, user.role);
      
      // No toast notification - silent operation
    } catch (error) {
      console.error('❌ Error auto-saving location:', error);
      // Only show error if auto-save fails
      toast.error('Failed to auto-save location. Please save manually.', {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const handleLocationError = (errorMessage) => {
    console.error('❌ Location detection error:', errorMessage);
    // Don't show error toast for automatic detection to avoid spam
    // Only log the error
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
    
    if (!profileForm.service.trim()) {
      toast.error('Service is required for artisans');
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

      const dataToUpdate = {
        ...profileForm,
        // Split skills string into an array
        skills: profileForm.skills.split(',').map(skill => skill.trim()).filter(skill => skill !== ''),
      };

      if (imageData) {
        dataToUpdate.profileImage = imageData;
      }

      // Debug logging
      console.log('Settings Debug - Data being sent to updateProfile:');
      console.log('profileForm:', profileForm);
      console.log('dataToUpdate:', dataToUpdate);
      console.log('user.role:', user.role);

      const updatedUser = await updateProfile(dataToUpdate, user.role);
      
      // Debug logging
      console.log('Settings Debug - Response from updateProfile:');
      console.log('updatedUser:', updatedUser);
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
      await updateNotificationPreferences(notificationPrefs);
      toast.success('Notification preferences updated successfully!');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error(error.response?.data?.message || 'Failed to update notification preferences');
    } finally {
      setNotificationLoading(false);
    }
  };

  const handlePrivacySave = async () => {
    setPrivacyLoading(true);
    try {
      await updatePrivacySettings(privacySettings);
      toast.success('Privacy settings updated successfully!');
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update privacy settings');
    } finally {
      setPrivacyLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (window.confirm('Are you sure you want to deactivate your account? This action can be reversed by contacting support.')) {
      try {
        await deactivateAccount();
        toast.success('Account deactivated successfully');
        // Optionally redirect to login or show a message
      } catch (error) {
        console.error('Error deactivating account:', error);
        toast.error(error.response?.data?.message || 'Failed to deactivate account');
      }
    }
  };

  const handleLogoutAllDevices = async () => {
    if (window.confirm('This will log you out of all devices. Are you sure?')) {
      try {
        await logoutAllDevices();
        toast.success('Logged out from all devices successfully');
        // Optionally redirect to login
      } catch (error) {
        console.error('Error logging out all devices:', error);
        toast.error(error.response?.data?.message || 'Failed to logout from all devices');
      }
    }
  };

  // Report issue handlers
  const handleReportFormChange = (e) => {
    const { name, value } = e.target;
    setReportForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (reportError) setReportError('');
  };

  const handleReportFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setReportError('Please upload a valid file (JPEG, PNG, PDF, DOC, or DOCX)');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setReportError('File size must be less than 5MB');
        return;
      }
      
      setReportForm(prev => ({
        ...prev,
        file: file
      }));
      setReportError('');
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportLoading(true);
    setReportError('');
    setReportSuccess('');

    // Validation
    if (!reportForm.category) {
      setReportError('Please select an issue type');
      setReportLoading(false);
      return;
    }
    if (!reportForm.title.trim()) {
      setReportError('Please provide a subject');
      setReportLoading(false);
      return;
    }
    if (!reportForm.description.trim()) {
      setReportError('Please provide a description');
      setReportLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const formData = new FormData();
      formData.append('title', reportForm.title);
      formData.append('category', reportForm.category);
      formData.append('description', reportForm.description);
      formData.append('priority', reportForm.priority);
      if (reportForm.file) {
        formData.append('file', reportForm.file);
      }

      await issueService.submitIssue(formData, token);
      
      setReportSuccess('Issue reported successfully! We will review it and get back to you soon.');
      setReportForm({
        category: '',
        title: '',
        description: '',
        priority: 'medium',
        file: null
      });
      
      // Clear file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      toast.success('Issue reported successfully!');
    } catch (error) {
      console.error('Error submitting report:', error);
      setReportError(error.message || 'Failed to submit report. Please try again.');
      toast.error(error.message || 'Failed to submit report');
    } finally {
      setReportLoading(false);
    }
  };

  if (!user) {
    return (
      <ArtisanLayout>
        <div className="p-8 min-h-screen bg-gray-100">
          <p className="text-center text-gray-600 text-lg py-12">Please log in to manage your settings.</p>
        </div>
      </ArtisanLayout>
    );
  }

  // Service Profile Functions
  const loadServiceProfiles = async () => {
    try {
      setServiceProfileLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found');
        return;
      }

      console.log('Loading service profiles...');
      
      // Load profiles and stats separately to handle errors independently
      let profiles = [];
      let stats = null;
      
      try {
        profiles = await serviceProfileService.getArtisanServiceProfiles(token);
        console.log('Service profiles loaded:', profiles);
        setServiceProfiles(profiles);
      } catch (profileError) {
        console.error('Error loading service profiles:', profileError);
        toast.error('Failed to load service profiles');
      }
      
      try {
        stats = await serviceProfileService.getServiceProfileStats(token);
        console.log('Service profile stats loaded:', stats);
        setServiceProfileStats(stats);
      } catch (statsError) {
        console.error('Error loading service profile stats:', statsError);
        // Don't show error for stats as it's not critical
      }
    } catch (error) {
      console.error('Error loading service profiles:', error);
      console.error('Error details:', error.message, error.stack);
      toast.error(error.message || 'Failed to load service profiles');
    } finally {
      setServiceProfileLoading(false);
    }
  };

  const handleCreateServiceProfile = () => {
    setEditingServiceProfile(null);
    setShowServiceModal(true);
  };

  const handleEditServiceProfile = (profile) => {
    setEditingServiceProfile(profile);
    setShowServiceModal(true);
  };

  const handleViewServiceProfile = (profile) => {
    console.log('Viewing service profile:', profile);
    setViewingServiceProfile(profile);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingServiceProfile(null);
  };

  const handleServiceProfileSaved = () => {
    console.log('Service profile saved, reloading profiles...');
    setShowServiceModal(false);
    setEditingServiceProfile(null);
    loadServiceProfiles();
    toast.success(editingServiceProfile ? 'Service profile updated successfully!' : 'Service profile created successfully!');
  };

  const handleServiceModalClose = () => {
    setShowServiceModal(false);
    setEditingServiceProfile(null);
  };

  const handleDeleteServiceProfile = async (profileId) => {
    console.log('Attempting to delete service profile:', profileId);
    
    if (!window.confirm('Are you sure you want to delete this service profile?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      console.log('Deleting service profile with token:', token ? 'Token exists' : 'No token');
      
      await serviceProfileService.deleteServiceProfile(profileId, token);
      console.log('Service profile deleted successfully');
      
      await loadServiceProfiles();
      toast.success('Service profile deleted successfully');
    } catch (error) {
      console.error('Error deleting service profile:', error);
      console.error('Error details:', error.message, error.stack);
      toast.error(error.message || 'Failed to delete service profile');
    }
  };

  const handleToggleServiceProfileStatus = async (profileId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await serviceProfileService.toggleServiceProfileStatus(profileId, token);
      await loadServiceProfiles();
      toast.success('Service profile status updated successfully');
    } catch (error) {
      console.error('Error updating service profile status:', error);
      toast.error(error.message || 'Failed to update service profile status');
    }
  };

  // Load service profiles when the service profiles tab is active
  useEffect(() => {
    console.log('useEffect triggered:', { activeTab, userRole: user?.role, userId: user?.id });
    if (activeTab === 'service-profiles' && user?.role === 'artisan') {
      console.log('Loading service profiles...');
      loadServiceProfiles();
    }
  }, [activeTab, user?.role]);

  return (
    <ArtisanLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Modern Header with Glass Effect */}
        <div className="relative bg-white/90 backdrop-blur-sm shadow-xl border-b border-white/20">
          <div className="absolute inset-0 bg-gradient-to-r from-[#151E3D]/5 via-[#151E3D]/10 to-[#1E2A4A]/5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#151E3D] via-[#151E3D] to-[#1E2A4A] bg-clip-text text-transparent">
                  Artisan Settings
                </h1>
                <p className="text-gray-600 text-lg">Manage your professional profile, services, and preferences</p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Account Active</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Wrench className="w-4 h-4" />
                    <span>Professional Account</span>
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
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-[#151E3D]/5 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                      activeTab === 'profile' ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-[#151E3D]/10'
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
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-[#151E3D]/5 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                      activeTab === 'password' ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-[#151E3D]/10'
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
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-[#151E3D]/5 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                      activeTab === 'notifications' ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-[#151E3D]/10'
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
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-[#151E3D]/5 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                      activeTab === 'privacy' ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-[#151E3D]/10'
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
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-[#151E3D]/5 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                      activeTab === 'account' ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-[#151E3D]/10'
                    }`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Account Actions</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('kyc')}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-300 group ${
                      activeTab === 'kyc'
                        ? 'bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-[#151E3D]/5 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                      activeTab === 'kyc' ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-[#151E3D]/10'
                    }`}>
                      <Shield className="w-5 h-5" />
                    </div>
                    <span className="font-medium">KYC Verification</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('service-profiles')}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-300 group ${
                      activeTab === 'service-profiles'
                        ? 'bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-[#151E3D]/5 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                      activeTab === 'service-profiles' ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-[#151E3D]/10'
                    }`}>
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Service Profiles</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('report')}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-300 group ${
                      activeTab === 'report'
                        ? 'bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-[#151E3D]/5 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                      activeTab === 'report' ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-[#151E3D]/10'
                    }`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Report Issue</span>
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
                        <p className="text-gray-600">Update your personal details and professional information</p>
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

                      {/* Basic Information */}
                      <div className="space-y-6">
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
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
                              <AutoLocationDetector
                                onLocationDetected={handleLocationDetected}
                                onLocationUpdated={handleLocationUpdated}
                                onError={handleLocationError}
                                disabled={loading}
                                autoDetect={true}
                                autoSave={true}
                                showStatus={true}
                                delay={2000}
                                className="mt-2"
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
                              <select
                                name="state"
                                id="state"
                                value={profileForm.state}
                                onChange={handleProfileChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D] transition-all duration-200 bg-white"
                              >
                                <option value="">Select your state</option>
                                <option value="Abia">Abia</option>
                                <option value="Adamawa">Adamawa</option>
                                <option value="Akwa Ibom">Akwa Ibom</option>
                                <option value="Anambra">Anambra</option>
                                <option value="Bauchi">Bauchi</option>
                                <option value="Bayelsa">Bayelsa</option>
                                <option value="Benue">Benue</option>
                                <option value="Borno">Borno</option>
                                <option value="Cross River">Cross River</option>
                                <option value="Delta">Delta</option>
                                <option value="Ebonyi">Ebonyi</option>
                                <option value="Edo">Edo</option>
                                <option value="Ekiti">Ekiti</option>
                                <option value="Enugu">Enugu</option>
                                <option value="FCT">Federal Capital Territory</option>
                                <option value="Gombe">Gombe</option>
                                <option value="Imo">Imo</option>
                                <option value="Jigawa">Jigawa</option>
                                <option value="Kaduna">Kaduna</option>
                                <option value="Kano">Kano</option>
                                <option value="Katsina">Katsina</option>
                                <option value="Kebbi">Kebbi</option>
                                <option value="Kogi">Kogi</option>
                                <option value="Kwara">Kwara</option>
                                <option value="Lagos">Lagos</option>
                                <option value="Nasarawa">Nasarawa</option>
                                <option value="Niger">Niger</option>
                                <option value="Ogun">Ogun</option>
                                <option value="Ondo">Ondo</option>
                                <option value="Osun">Osun</option>
                                <option value="Oyo">Oyo</option>
                                <option value="Plateau">Plateau</option>
                                <option value="Rivers">Rivers</option>
                                <option value="Sokoto">Sokoto</option>
                                <option value="Taraba">Taraba</option>
                                <option value="Yobe">Yobe</option>
                                <option value="Zamfara">Zamfara</option>
                              </select>
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
                        </div>

                        {/* Artisan Specific Information */}
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Wrench className="w-5 h-5 mr-2 text-[#151E3D]" />
                            Professional Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label htmlFor="service" className="block text-sm font-semibold text-gray-700">
                                Service Type *
                              </label>
                              <input
                                type="text"
                                name="service"
                                id="service"
                                value={profileForm.service}
                                onChange={handleProfileChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D] transition-all duration-200 bg-white"
                                placeholder="e.g., Plumbing, Electrical, Carpentry"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="experience" className="block text-sm font-semibold text-gray-700">
                                Years of Experience
                              </label>
                              <input
                                type="text"
                                name="experience"
                                id="experience"
                                value={profileForm.experience}
                                onChange={handleProfileChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D] transition-all duration-200 bg-white"
                                placeholder="e.g., 5 years"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <label htmlFor="skills" className="block text-sm font-semibold text-gray-700">
                                Skills (comma-separated)
                              </label>
                              <input
                                type="text"
                                name="skills"
                                id="skills"
                                value={profileForm.skills}
                                onChange={handleProfileChange}
                                placeholder="e.g., Plumbing, Electrical, Carpentry, HVAC"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D] transition-all duration-200 bg-white"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <label htmlFor="bio" className="block text-sm font-semibold text-gray-700">
                                Professional Bio
                              </label>
                              <textarea
                                name="bio"
                                id="bio"
                                value={profileForm.bio}
                                onChange={handleProfileChange}
                                rows={4}
                                placeholder="Tell customers about your expertise, experience, and what makes you unique..."
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#151E3D] focus:border-[#151E3D] transition-all duration-200 bg-white resize-none"
                              />
                            </div>
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
                              <p className="font-medium text-gray-900">Job Requests</p>
                              <p className="text-sm text-gray-500">New job requests from customers</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notificationPrefs.jobRequests}
                                onChange={() => handleNotificationChange('jobRequests')}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#151E3D]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#151E3D]"></div>
                            </label>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Messages</p>
                              <p className="text-sm text-gray-500">New messages from customers</p>
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
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Earnings Updates</p>
                              <p className="text-sm text-gray-500">Updates about your earnings and payments</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notificationPrefs.earnings}
                                onChange={() => handleNotificationChange('earnings')}
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
                              <option value="public">Public - Visible to all customers</option>
                              <option value="verified">Verified Customers Only</option>
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
                              <p className="text-sm text-gray-500">Allow customers to see your phone number</p>
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
                              <p className="text-sm text-gray-500">Allow customers to see your email address</p>
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
                              <p className="text-sm text-gray-500">Allow customers to see your general location</p>
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
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Show Portfolio</p>
                              <p className="text-sm text-gray-500">Allow customers to see your work portfolio</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={privacySettings.showPortfolio}
                                onChange={() => handlePrivacyChange('showPortfolio', !privacySettings.showPortfolio)}
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
                      <div className="bg-gradient-to-r from-[#151E3D]/5 to-[#1E2A4A]/5 border border-[#151E3D]/20 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-[#151E3D] mb-4 flex items-center">
                          <LogOut className="w-5 h-5 mr-2" />
                          Security Actions
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-[#151E3D]">Log Out All Devices</p>
                              <p className="text-sm text-[#151E3D]/70">Sign out from all devices and browsers</p>
                            </div>
                            <button
                              onClick={handleLogoutAllDevices}
                              className="px-4 py-2 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] hover:from-[#1E2A4A] hover:to-[#151E3D] text-white rounded-lg transition-all duration-200"
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

                {/* KYC Verification Tab */}
                {activeTab === 'kyc' && (
                  <div className="p-8">
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] rounded-lg flex items-center justify-center mr-4">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">KYC Verification</h2>
                        <p className="text-gray-600">Complete your identity verification to access all features</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {/* KYC Status */}
                      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h3>
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${
                            user?.kycStatus === 'approved' ? 'bg-green-500' : 
                            user?.kycStatus === 'pending' ? 'bg-yellow-500' : 
                            user?.kycStatus === 'rejected' ? 'bg-red-500' : 'bg-gray-400'
                          }`}></div>
                          <span className="text-gray-700 capitalize">
                            {user?.kycStatus === 'approved' ? 'Verified' : 
                             user?.kycStatus === 'pending' ? 'Under Review' : 
                             user?.kycStatus === 'rejected' ? 'Rejected' : 'Not Submitted'}
                          </span>
                        </div>
                      </div>

                      {/* KYC Form */}
                      <KYCForm />
                    </div>
                  </div>
                )}

                {/* Report Issue Tab */}
                {activeTab === 'report' && (
                  <div className="p-8">
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] rounded-lg flex items-center justify-center mr-4">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Report an Issue</h2>
                        <p className="text-gray-600">Report problems or concerns to our support team</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                      {/* Success Message */}
                      {reportSuccess && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            <p className="text-green-800 font-medium">{reportSuccess}</p>
                          </div>
                        </div>
                      )}

                      {/* Error Message */}
                      {reportError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center">
                            <XCircle className="w-5 h-5 text-red-600 mr-2" />
                            <p className="text-red-800 font-medium">{reportError}</p>
                          </div>
                        </div>
                      )}

                      <form onSubmit={handleReportSubmit} className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Issue Type *
                          </label>
                          <select 
                            name="category"
                            value={reportForm.category}
                            onChange={handleReportFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#151E3D] focus:border-transparent"
                            required
                          >
                            <option value="">Select an issue type</option>
                            <option value="bug">Bug Report</option>
                            <option value="feature-request">Feature Request</option>
                            <option value="billing">Payment Issue</option>
                            <option value="technical">Technical Issue</option>
                            <option value="account">Account Related</option>
                            <option value="general">General Inquiry</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject *
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={reportForm.title}
                            onChange={handleReportFormChange}
                            placeholder="Brief description of the issue"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#151E3D] focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                          </label>
                          <select 
                            name="priority"
                            value={reportForm.priority}
                            onChange={handleReportFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#151E3D] focus:border-transparent"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                          </label>
                          <textarea
                            name="description"
                            value={reportForm.description}
                            onChange={handleReportFormChange}
                            rows={4}
                            placeholder="Please provide detailed information about the issue..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#151E3D] focus:border-transparent"
                            required
                          ></textarea>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Attachments (Optional)
                          </label>
                          <input
                            type="file"
                            onChange={handleReportFileChange}
                            accept="image/*,.pdf,.doc,.docx"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#151E3D] focus:border-transparent"
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Supported formats: JPEG, PNG, PDF, DOC, DOCX (Max 5MB)
                          </p>
                        </div>
                        
                        <div className="flex justify-end space-x-4">
                          <button
                            type="button"
                            onClick={() => {
                              setReportForm({
                                category: '',
                                title: '',
                                description: '',
                                priority: 'medium',
                                file: null
                              });
                              setReportError('');
                              setReportSuccess('');
                              const fileInput = document.querySelector('input[type="file"]');
                              if (fileInput) fileInput.value = '';
                            }}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Clear Form
                          </button>
                          <button
                            type="submit"
                            disabled={reportLoading}
                            className={`px-6 py-2 font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl ${
                              reportLoading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] text-white hover:from-[#1E2A4A] hover:to-[#151E3D]'
                            }`}
                          >
                            {reportLoading ? 'Submitting...' : 'Submit Report'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Service Profiles Tab */}
                {activeTab === 'service-profiles' && (
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] rounded-lg flex items-center justify-center mr-4">
                          <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">Service Profiles</h2>
                          <p className="text-gray-600">Create and manage your service offerings</p>
                        </div>
                      </div>
                      <button
                        onClick={handleCreateServiceProfile}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] text-white rounded-lg hover:from-[#1E2A4A] hover:to-[#151E3D] transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Create New Profile</span>
                      </button>
                    </div>

                    {/* Stats Cards */}
                    {serviceProfileStats && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-blue-600 text-sm font-medium">Total Profiles</p>
                              <p className="text-2xl font-bold text-blue-800">{serviceProfileStats.totalProfiles}</p>
                            </div>
                            <Briefcase className="w-8 h-8 text-blue-500" />
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-green-600 text-sm font-medium">Active Profiles</p>
                              <p className="text-2xl font-bold text-green-800">{serviceProfileStats.activeProfiles}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-500" />
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-purple-600 text-sm font-medium">Total Bookings</p>
                              <p className="text-2xl font-bold text-purple-800">{serviceProfileStats.totalBookings}</p>
                            </div>
                            <User className="w-8 h-8 text-purple-500" />
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-yellow-600 text-sm font-medium">Total Earnings</p>
                              <p className="text-2xl font-bold text-yellow-800">₦{serviceProfileStats.totalEarnings?.toLocaleString()}</p>
                            </div>
                            <Star className="w-8 h-8 text-yellow-500" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Service Profiles List */}
                    {serviceProfileLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#151E3D]"></div>
                        <span className="ml-3 text-gray-600">Loading service profiles...</span>
                      </div>
                    ) : serviceProfiles.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Service Profiles Yet</h3>
                        <p className="text-gray-500 mb-6">Create your first service profile to start offering your services</p>
                        <button
                          onClick={handleCreateServiceProfile}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] text-white rounded-lg hover:from-[#1E2A4A] hover:to-[#151E3D] transition-all duration-300"
                        >
                          <Plus className="w-5 h-5" />
                          <span>Create Your First Profile</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {serviceProfiles.map((profile) => (
                          <div key={profile._id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h3 className="text-xl font-semibold text-gray-900">{profile.title}</h3>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    profile.isActive 
                                      ? 'bg-green-100 text-green-700 border border-green-200' 
                                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                                  }`}>
                                    {profile.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                    {profile.category}
                                  </span>
                                </div>
                                <p className="text-gray-600 mb-4 line-clamp-2">{profile.description || 'No description provided'}</p>
                                <div className="flex items-center gap-6 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span>{profile.rating?.toFixed(1) || '0.0'}</span>
                                    <span>({profile.reviewCount || 0} reviews)</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    <span>{profile.bookingCount || 0} bookings</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="font-semibold text-[#151E3D]">₦{profile.hourlyRate?.toLocaleString()}/hr</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <button
                                  onClick={() => handleViewServiceProfile(profile)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                  title="View Profile"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleToggleServiceProfileStatus(profile._id)}
                                  className={`p-2 rounded-lg transition-colors duration-200 ${
                                    profile.isActive
                                      ? 'text-gray-600 hover:bg-gray-100'
                                      : 'text-yellow-600 hover:bg-yellow-50'
                                  }`}
                                  title={profile.isActive ? 'Deactivate' : 'Activate'}
                                >
                                  {profile.isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                                <button
                                  onClick={() => handleEditServiceProfile(profile)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                  title="Edit Profile"
                                >
                                  <Edit3 className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteServiceProfile(profile._id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                  title="Delete Profile"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Profile Modal */}
      {showServiceModal && (
        <ServiceProfileModal
          isOpen={showServiceModal}
          onClose={handleServiceModalClose}
          onSave={handleServiceProfileSaved}
          profile={editingServiceProfile}
          token={user?.accessToken || localStorage.getItem('accessToken')}
        />
      )}

      {/* Service Profile View Modal */}
      {showViewModal && viewingServiceProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#151E3D] to-[#1E2A4A] rounded-full flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#151E3D]">Service Profile Details</h2>
                    <p className="text-sm text-gray-500">{viewingServiceProfile.title}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseViewModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <XCircle className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-6">
                  {/* Service Title & Category */}
                  <div className="bg-gradient-to-r from-[#F8FAFC] to-[#F1F5F9] rounded-xl p-6">
                    <h3 className="text-2xl font-bold text-[#151E3D] mb-2">{viewingServiceProfile.title}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-[#F59E0B]/10 text-[#F59E0B] rounded-full text-sm font-semibold border border-[#F59E0B]/20">
                        {viewingServiceProfile.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        viewingServiceProfile.isActive 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {viewingServiceProfile.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-600">{viewingServiceProfile.description || 'No description provided'}</p>
                  </div>

                  {/* Pricing Information */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-[#151E3D] mb-4 flex items-center">
                      <Star className="w-5 h-5 mr-2 text-[#F59E0B]" />
                      Pricing Details
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Hourly Rate:</span>
                        <span className="text-xl font-bold text-[#151E3D]">₦{viewingServiceProfile.hourlyRate?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Minimum Hours:</span>
                        <span className="font-semibold text-[#151E3D]">{viewingServiceProfile.minimumHours || 1} hours</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Maximum Hours:</span>
                        <span className="font-semibold text-[#151E3D]">{viewingServiceProfile.maximumHours || 8} hours</span>
                      </div>
                    </div>
                  </div>

                  {/* Service Area */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-[#151E3D] mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-[#F59E0B]" />
                      Service Area
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-semibold text-[#151E3D] capitalize">{viewingServiceProfile.serviceArea?.type || 'Local'}</span>
                      </div>
                      {viewingServiceProfile.serviceArea?.radius && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Radius:</span>
                          <span className="font-semibold text-[#151E3D]">{viewingServiceProfile.serviceArea.radius} km</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Additional Info */}
                <div className="space-y-6">
                  {/* Availability */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-[#151E3D] mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-[#F59E0B]" />
                      Weekly Availability
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(viewingServiceProfile.availability || {}).map(([day, schedule]) => (
                        <div key={day} className="flex justify-between items-center">
                          <span className="text-gray-600 capitalize">{day}:</span>
                          <span className={`font-semibold ${schedule.available ? 'text-green-600' : 'text-gray-400'}`}>
                            {schedule.available ? `${schedule.startTime} - ${schedule.endTime}` : 'Not Available'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-[#151E3D] mb-4 flex items-center">
                      <Wrench className="w-5 h-5 mr-2 text-[#F59E0B]" />
                      Service Requirements
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tools Provided:</span>
                        <span className={`font-semibold ${viewingServiceProfile.requirements?.toolsProvided ? 'text-green-600' : 'text-red-600'}`}>
                          {viewingServiceProfile.requirements?.toolsProvided ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Materials Provided:</span>
                        <span className={`font-semibold ${viewingServiceProfile.requirements?.materialsProvided ? 'text-green-600' : 'text-red-600'}`}>
                          {viewingServiceProfile.requirements?.materialsProvided ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-[#151E3D] mb-4 flex items-center">
                      <Star className="w-5 h-5 mr-2 text-[#F59E0B]" />
                      Performance
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Rating:</span>
                        <span className="font-semibold text-[#151E3D]">{(viewingServiceProfile.rating || 0).toFixed(1)} ⭐</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Reviews:</span>
                        <span className="font-semibold text-[#151E3D]">{viewingServiceProfile.reviewCount || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Bookings:</span>
                        <span className="font-semibold text-[#151E3D]">{viewingServiceProfile.bookingCount || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Earnings:</span>
                        <span className="font-semibold text-[#151E3D]">₦{(viewingServiceProfile.totalEarnings || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={handleCloseViewModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleCloseViewModal();
                    handleEditServiceProfile(viewingServiceProfile);
                  }}
                  className="px-6 py-3 bg-[#F59E0B] text-white rounded-lg hover:bg-[#D97706] transition-colors duration-200"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ArtisanLayout>
  );
};

export default ArtisanSettingsPage;
