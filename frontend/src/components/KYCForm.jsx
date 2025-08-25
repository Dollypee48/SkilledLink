import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { kycService } from '../services/kycService';
import { CheckCircle, XCircle, Loader2, UploadCloud } from 'lucide-react';
import FileInput from './FileInput';
import ProfilePictureUpload from './ProfilePictureUpload'; // Import ProfilePictureUpload
import { userService } from '../services/userService'; // Import userService for profile picture upload

const KYCForm = () => {
  const { user, accessToken, updateUser } = useAuth();
  const [idProof, setIdProof] = useState(null);
  const [addressProof, setAddressProof] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [profileImage, setProfileImage] = useState(null); // State for profile image
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({
    type: '',
    text: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Initialize profileImage state if user already has one
      // if (user.profileImageUrl) setProfileImage({ name: "Existing Profile Image" }); // Placeholder for existing image

      if (user?.kycDocuments) {
        if (user.kycDocuments.idProof) setIdProof({ name: "Existing ID Proof" });
        if (user.kycDocuments.addressProof) setAddressProof({ name: "Existing Address Proof" });
        if (user.role === 'artisan' && user.kycDocuments.credentials) {
          setCredentials({ name: "Existing Credentials" });
        }
      }
    }
  }, [user]);

  const handleProfileImageChange = async (file) => {
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

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    // Reset form data to initial user values or null
    setIdProof(null);
    setAddressProof(null);
    setCredentials(null);
    setProfileImage(null); // Reset profile image
    if (user?.kycDocuments) {
        if (user.kycDocuments.idProof) setIdProof({ name: "Existing ID Proof" });
        if (user.kycDocuments.addressProof) setAddressProof({ name: "Existing Address Proof" });
        if (user.role === 'artisan' && user.kycDocuments.credentials) {
          setCredentials({ name: "Existing Credentials" });
        }
    }
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    if (!accessToken) {
      setMessage({ type: 'error', text: 'Authentication token missing.' });
      setLoading(false);
      return;
    }

    const formData = new FormData();
    // Only append files if they are newly selected or changed during editing
    if (idProof && idProof.name !== "Existing ID Proof") formData.append('idProof', idProof);
    if (addressProof && addressProof.name !== "Existing Address Proof") formData.append('addressProof', addressProof);
    if (user?.role === 'artisan' && credentials && credentials.name !== "Existing Credentials") formData.append('credentials', credentials);
    
    // No need to append profileImage here, it's handled by handleProfileImageChange

    if (!idProof || !addressProof || (user?.role === 'artisan' && !credentials)) {
      setMessage({ type: 'error', text: 'Please upload all required documents for KYC.' });
      setLoading(false);
      return;
    }

    try {
      const res = await kycService.submitKYC(formData, accessToken);
      setMessage({ type: 'success', text: res.message });
      if (res.user) {
        updateUser(res.user);
      }
      setIsEditing(false);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to submit KYC.' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    if (!user) return null;
    switch (user.kycStatus) {
      case 'pending':
        return {
          icon: <Loader2 className="w-5 h-5 mr-2 animate-spin" />,
          text: 'Your KYC documents are currently under review.',
          color: 'bg-yellow-100 text-yellow-800'
        };
      case 'approved':
        return {
          icon: <CheckCircle className="w-5 h-5 mr-2" />,
          text: 'Your KYC has been successfully approved!',
          color: 'bg-green-100 text-green-800'
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-5 h-5 mr-2" />,
          text: 'Your previous KYC submission was rejected. Please re-submit the correct documents.',
          color: 'bg-red-100 text-red-800'
        };
      default:
        return {
          icon: <UploadCloud className="w-5 h-5 mr-2" />,
          text: 'KYC verification is required. Please upload the necessary documents.',
          color: 'bg-blue-100 text-blue-800'
        };
    }
  };

  const status = getStatusMessage();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">KYC Verification</h2>
          <p className="text-gray-600">Manage your Know Your Customer (KYC) documents</p>
        </div>
        {!isEditing && user?.kycStatus !== 'approved' && (
          <button
            onClick={handleEditClick}
            className="px-4 py-2 bg-[#f5d4aa] text-[#6b2d11] rounded-md hover:bg-[#e0b48a]"
          >
            Edit
          </button>
        )}
      </div>

      {status && (user?.kycStatus !== 'approved' || !isEditing) && (
        <div className={`p-3 rounded-md mb-4 flex items-center ${status.color}`}>
          {status.icon}
          <p className="text-sm font-medium">{status.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture Upload Section */}
        <ProfilePictureUpload
          currentImageUrl={user?.profileImageUrl ? `/uploads/profileImages/${user.profileImageUrl.split('/').pop()}` : null} 
          onImageChange={handleProfileImageChange}
          disabled={!isEditing && user?.kycStatus === 'approved'}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileInput
            label="Government-Issued ID (Passport/Driver's License)"
            name="idProof"
            file={idProof}
            setFile={setIdProof}
            disabled={!isEditing && user?.kycStatus === 'approved'}
          />
          <FileInput
            label="Proof of Address (Utility Bill, Bank Statement)"
            name="addressProof"
            file={addressProof}
            setFile={setAddressProof}
            disabled={!isEditing && user?.kycStatus === 'approved'}
          />

          {user?.role === 'artisan' && (
            <FileInput
              label="Professional Credentials (Trade License, Certification)"
              name="credentials"
              file={credentials}
              setFile={setCredentials}
              disabled={!isEditing && user?.kycStatus === 'approved'}
            />
          )}
        </div>

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
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f5d4aa]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#f5d4aa] hover:bg-[#e0b48a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f5d4aa] disabled:opacity-50"
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

export default KYCForm;
