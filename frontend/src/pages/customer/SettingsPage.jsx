import React, { useState, useEffect } from 'react';
import CustomerLayout from '../../components/common/Layouts/CustomerLayout';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { User, Lock, Eye, EyeOff, Camera } from 'lucide-react';

const SettingsPage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
    nationality: '',
    occupation: '',
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
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

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        nationality: user.nationality || '',
        occupation: user.occupation || '',
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
    try {
      let imageData = null;
      if (profileImage) {
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
      <div className="p-8 min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold text-[#151E3D] mb-8 text-center">Account Settings</h1>

        <div className="max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-white text-[#151E3D] shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Profile Settings
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'password'
                    ? 'bg-white text-[#151E3D] shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Change Password
              </button>
            </div>
          </div>

          {/* Profile Settings Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white shadow-lg rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <User className="w-6 h-6 mr-2 text-[#151E3D]" />
                Profile Information
              </h2>
              
              <form onSubmit={handleProfileSubmit}>
                {/* Profile Image Section */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative w-32 h-32 mb-4">
                    {profileImagePreview ? (
                      <img 
                        src={profileImagePreview} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover border-4 border-[#151E3D] shadow-md" 
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-4 border-[#151E3D] shadow-md">
                        <User className="w-16 h-16 text-gray-500" />
                      </div>
                    )}
                    <label htmlFor="profile-image-upload" className="absolute bottom-0 right-0 bg-[#151E3D] text-white rounded-full p-2 cursor-pointer hover:bg-[#1E2A4A] transition-colors">
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
                      className="text-red-500 hover:text-red-700 text-sm mt-2"
                    >
                      Remove Image
                    </button>
                  )}
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Click the camera icon to upload a new profile picture
                  </p>
                </div>

                {/* Profile Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#a0522d] focus:border-[#151E3D] transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#a0522d] focus:border-[#151E3D] transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      value={profileForm.address}
                      onChange={handleProfileChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#a0522d] focus:border-[#151E3D] transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-2">
                      Nationality *
                    </label>
                    <input
                      type="text"
                      name="nationality"
                      id="nationality"
                      value={profileForm.nationality}
                      onChange={handleProfileChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#a0522d] focus:border-[#151E3D] transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-2">
                      Occupation
                    </label>
                    <input
                      type="text"
                      name="occupation"
                      id="occupation"
                      value={profileForm.occupation}
                      onChange={handleProfileChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#a0522d] focus:border-[#151E3D] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-[#151E3D] hover:bg-[#1E2A4A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#151E3D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Password Change Tab */}
          {activeTab === 'password' && (
            <div className="bg-white shadow-lg rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Lock className="w-6 h-6 mr-2 text-[#151E3D]" />
                Change Password
              </h2>
              
              <form onSubmit={handlePasswordSubmit} className="max-w-md">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-[#a0522d] focus:border-[#151E3D] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-[#a0522d] focus:border-[#151E3D] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Must be at least 6 characters long</p>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-[#a0522d] focus:border-[#151E3D] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-[#151E3D] hover:bg-[#1E2A4A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#151E3D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {passwordLoading ? 'Changing Password...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default SettingsPage;
