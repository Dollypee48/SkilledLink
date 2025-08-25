import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService'; // Assuming userService exists for updating user details
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import ProfilePictureUpload from './ProfilePictureUpload'; // Import the new component

const UserProfileEditForm = () => {
  const { user, accessToken, handleLogin, updateUser } = useAuth(); // Assuming handleLogin can update user in context
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    locationAddress: '',
    skills: '', // For artisans
    bio: '',
    experience: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({
    type: '',
    text: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const [firstName, ...lastNameParts] = user.name.split(' ');
      setFormData({
        firstName: firstName || '',
        lastName: lastNameParts.join(' ') || '',
        phone: user.phone || '',
        locationAddress: user.address || '',
        skills: user.artisanProfile?.skills?.join(', ') || '', // For artisans
        bio: user.artisanProfile?.bio || '',
        experience: user.artisanProfile?.experience || '',
      });
      // setProfileImage(user.profileImageUrl); // Assuming user has a profileImageUrl field
    }
  }, [user]);

  const handleImageChange = async (file) => {
    setProfileImage(file);
    if (file && accessToken) {
        setLoading(true);
        try {
            const res = await userService.uploadProfilePicture(file, accessToken);
            updateUser(res.user); // Update user context with new profile image URL
            setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Failed to upload profile picture.' });
        } finally {
            setLoading(false);
        }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setMessage({ type: '', text: '' });
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    // Reset form data to initial user values
    if (user) {
        const [firstName, ...lastNameParts] = user.name.split(' ');
        setFormData({
          firstName: firstName || '',
          lastName: lastNameParts.join(' ') || '',
          phone: user.phone || '',
          locationAddress: user.address || '',
          skills: user.artisanProfile?.skills?.join(', ') || '',
          bio: user.artisanProfile?.bio || '',
          experience: user.artisanProfile?.experience || '',
        });
    }
    // setProfileImage(user.profileImageUrl); // Reset profile image if implemented
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    if (!accessToken || !user?._id) {
      setMessage({ type: 'error', text: 'Authentication token or user ID missing.' });
      setLoading(false);
      return;
    }

    try {
      const updatedName = `${formData.firstName} ${formData.lastName}`.trim();
      const dataToUpdate = {
        name: updatedName,
        phone: formData.phone,
        address: formData.locationAddress,
        ...(user.role === 'artisan' && { 
          skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
          bio: formData.bio,
          experience: formData.experience,
        }),
      };

      // Handle profile image upload separately if implemented

      const updatedUser = await userService.updateProfile(user._id, dataToUpdate, accessToken, user.role);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      // Manually update the user in AuthContext. A more robust solution might refetch the user.
      handleLogin({ user: updatedUser, accessToken, refreshToken: localStorage.getItem('refreshToken') });
      setIsEditing(false);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const serviceCategories = ['Plumbing', 'Electrical', 'Carpentry']; // Example categories

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
          <p className="text-gray-600">Manage your personal details and preferences</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEditClick}
            className="px-4 py-2 bg-[#f5d4aa] text-[#6b2d11] rounded-md hover:bg-[#e0b48a]"
          >
            Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <ProfilePictureUpload
          currentImageUrl={user?.profileImageUrl} // Pass current image URL from user object
          onImageChange={handleImageChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f5d4aa] focus:border-[#f5d4aa] sm:text-sm"
              required
              disabled={!isEditing}
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f5d4aa] focus:border-[#f5d4aa] sm:text-sm"
              required
              disabled={!isEditing}
            />
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f5d4aa] focus:border-[#f5d4aa] sm:text-sm"
              required
              disabled={!isEditing}
            />
          </div>

          {/* Location/Address */}
          <div>
            <label htmlFor="locationAddress" className="block text-sm font-medium text-gray-700">Location/Address</label>
            <input
              type="text"
              id="locationAddress"
              name="locationAddress"
              value={formData.locationAddress}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f5d4aa] focus:border-[#f5d4aa] sm:text-sm"
              required
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Skills (Artisan Only) */}
        {user?.role === 'artisan' && (
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f5d4aa] focus:border-[#f5d4aa] sm:text-sm"
              placeholder="e.g., Plumbing, Electrical, Carpentry"
              disabled={!isEditing}
            />
          </div>
        )}

        {/* Bio (Artisan Only) */}
        {user?.role === 'artisan' && (
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f5d4aa] focus:border-[#f5d4aa] sm:text-sm"
              placeholder="Tell us about yourself and your craft..."
              disabled={!isEditing}
            ></textarea>
          </div>
        )}

        {/* Experience (Artisan Only) */}
        {user?.role === 'artisan' && (
          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Experience</label>
            <textarea
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              rows="2"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#f5d4aa] focus:border-[#f5d4aa] sm:text-sm"
              placeholder="e.g., 5 years in plumbing, certified electrician..."
              disabled={!isEditing}
            ></textarea>
          </div>
        )}

        {message.text && (
          <div className={`py-2 px-3 rounded-md text-sm flex items-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.type === 'success' ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
            {message.text}
          </div>
        )}

        {isEditing && (
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancelClick}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#f5d4aa] hover:bg-[#e0b48a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#6b2d11]" />
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default UserProfileEditForm;
