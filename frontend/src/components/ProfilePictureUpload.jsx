import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

const ProfilePictureUpload = ({ currentImageUrl, onImageChange, disabled = false }) => {
  const [imagePreview, setImagePreview] = useState(currentImageUrl);

  useEffect(() => {
    setImagePreview(currentImageUrl);
  }, [currentImageUrl]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        onImageChange(file); // Pass the file up to the parent component
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(currentImageUrl);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="relative w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
        {imagePreview ? (
          <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <User className="w-12 h-12 text-gray-400" />
        )}
      </div>
      <div>
        <p className="text-lg font-medium text-gray-900">Profile Photo</p>
        <p className="text-sm text-gray-500">Upload a clear photo of yourself</p>
        <label
          htmlFor="profile-picture-upload"
          className={`mt-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          Change Photo
          <input
            id="profile-picture-upload"
            name="profile-picture-upload"
            type="file"
            className="sr-only"
            onChange={handleImageChange}
            accept="image/*"
            disabled={disabled}
          />
        </label>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;
