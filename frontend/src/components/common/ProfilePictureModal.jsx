import React from 'react';
import { X } from 'lucide-react';

const ProfilePictureModal = ({ isOpen, onClose, imageUrl, alt, name }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 z-10 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Image Container */}
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={alt || name || 'Profile Picture'}
              className="w-full h-auto max-h-[80vh] object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          
          {/* Fallback for missing image */}
          <div 
            className={`w-full h-96 bg-gradient-to-br from-[#151E3D] to-[#1E2A4A] flex items-center justify-center text-white ${
              imageUrl ? 'hidden' : 'flex'
            }`}
          >
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-6xl font-bold">
                  {name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <p className="text-xl font-medium">{name || 'User'}</p>
              <p className="text-white/70 mt-2">No profile picture available</p>
            </div>
          </div>

          {/* Image Info */}
          {imageUrl && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <h3 className="text-white text-xl font-semibold mb-1">
                {name || 'Profile Picture'}
              </h3>
              <p className="text-white/80 text-sm">
                Click outside or press ESC to close
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureModal;
