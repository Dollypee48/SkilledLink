import React, { useRef } from 'react';
import { UploadCloud, Camera } from 'lucide-react';

const FileInput = ({ label, subtitle, name, file, setFile, disabled = false, onCameraClick }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current.click();
    }
  };

  const handleInternalFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {subtitle && (
        <p className="text-xs text-gray-500 mb-3">{subtitle}</p>
      )}
      <div
        onClick={handleClick}
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer
          ${disabled ? 'bg-gray-50 opacity-70 cursor-not-allowed' : 'hover:border-gray-400'}`}
      >
        <div className="space-y-1 text-center">
          {file ? (
            <p className="text-sm text-gray-900">File selected: {file.name}</p>
          ) : (
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
          )}
          <div className="flex text-sm text-gray-600 justify-center">
            <span
              className={`relative cursor-pointer bg-white rounded-md font-medium text-[#151E3D] hover:text-[#1E2A4A] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#F59E0B]
                ${disabled ? 'cursor-not-allowed text-gray-500 hover:text-gray-500' : ''}`}
            >
              Upload a file
            </span>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
          <input
            id={name}
            name={name}
            type="file"
            className="sr-only"
            onChange={handleInternalFileChange}
            ref={fileInputRef}
            disabled={disabled}
            accept=".png,.jpg,.jpeg,.pdf"
          />
        </div>
      </div>
      
      {/* Camera Button */}
      {onCameraClick && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={onCameraClick}
            disabled={disabled}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#151E3D] transition-all duration-200 ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Camera className="w-4 h-4 mr-2" />
            Take Photo
          </button>
        </div>
      )}
    </div>
  );
};

export default FileInput;
