import React, { useState, useEffect, useRef, useCallback } from 'react'; // Added useRef, useCallback
import { useAuth } from '../context/AuthContext';
import { kycService } from '../services/kycService';
import { CheckCircle, XCircle, Loader2, UploadCloud, ArrowLeft, ArrowRight, Camera, ShieldAlert } from 'lucide-react';
import FileInput from './FileInput';
import ProfilePictureUpload from './ProfilePictureUpload';
import { userService } from '../services/userService';
import Webcam from 'react-webcam'; // Import Webcam component

// Helper function to convert File to Base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const KYCForm = () => {
  const { user, accessToken, updateUser } = useAuth();

  // Multi-step KYC state
  const [currentStep, setCurrentStep] = useState(1);
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.name || '',
    dateOfBirth: '',
    phoneNumber: user?.phone || '',
    address: user?.address || '',
  });
  const [documentInfo, setDocumentInfo] = useState({
    idProof: null,
    addressProof: null,
    credentials: null, // For artisans
  });
  const [faceRecognitionInfo, setFaceRecognitionInfo] = useState(null); // To store face recognition data (base64 image)

  // Existing states, adjusted
  const [profileImage, setProfileImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({
    type: '',
    text: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  // Webcam references and capture logic
  const webcamRef = useRef(null);
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setFaceRecognitionInfo(imageSrc); // Store the base64 image
    if (validationErrors.faceImage) {
      setValidationErrors(prev => ({ ...prev, faceImage: null }));
    }
  }, [webcamRef, validationErrors.faceImage]);

  // Validation functions
  const validatePersonalInfo = () => {
    const errors = {};
    
    if (!personalInfo.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    } else if (personalInfo.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }
    
    if (!personalInfo.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(personalInfo.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        errors.dateOfBirth = 'You must be at least 18 years old';
      }
      if (age > 120) {
        errors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }
    
    if (!personalInfo.phoneNumber?.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(personalInfo.phoneNumber.trim())) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }
    
    if (!personalInfo.address?.trim()) {
      errors.address = 'Address is required';
    } else if (personalInfo.address.trim().length < 10) {
      errors.address = 'Please provide a complete address';
    }
    
    return errors;
  };

  const validateDocuments = () => {
    const errors = {};
    
    if (!documentInfo.idProof) {
      errors.idProof = 'Government-issued ID is required';
    }
    
    if (!documentInfo.addressProof) {
      errors.addressProof = 'Proof of address is required';
    }
    
    if (user?.role === 'artisan' && !documentInfo.credentials) {
      errors.credentials = 'Professional credentials are required for artisans';
    }
    
    return errors;
  };

  const validateFaceRecognition = () => {
    const errors = {};
    
    if (!faceRecognitionInfo) {
      errors.faceImage = 'Face photo is required';
    }
    
    return errors;
  };

  const validateStep = (step) => {
    let stepErrors = {};
    
    switch (step) {
      case 1:
        stepErrors = validatePersonalInfo();
        break;
      case 2:
        stepErrors = validateDocuments();
        break;
      case 3:
        stepErrors = validateFaceRecognition();
        break;
      default:
        break;
    }
    
    setValidationErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  useEffect(() => {
    if (user) {
      setPersonalInfo({
        fullName: user.name || '',
        dateOfBirth: user.kycDetails?.dateOfBirth || '', // Assuming kycDetails will store this
        phoneNumber: user.phone || '',
        address: user.address || '',
      });

      if (user.kycDocuments) {
        setDocumentInfo({
          idProof: user.kycDocuments.idProof ? { name: "Existing ID Proof" } : null,
          addressProof: user.kycDocuments.addressProof ? { name: "Existing Address Proof" } : null,
          credentials: (user.role === 'artisan' && user.kycDocuments.credentials) ? { name: "Existing Credentials" } : null,
        });
      }
    }
  }, [user]);

  const handleProfileImageChange = async (file) => {
    setProfileImage(file);
    if (file && accessToken) {
      setLoading(true);
      try {
        const res = await userService.uploadProfilePicture(file, accessToken);
        updateUser(res.user);
        setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
      } catch (err) {
        setMessage({ type: 'error', text: err.message || 'Failed to upload profile picture.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
    setMessage({ type: '', text: '' });
    setCurrentStep(prev => prev + 1);
    } else {
      setMessage({ type: 'error', text: 'Please fix the errors before proceeding.' });
    }
  };

  const prevStep = () => {
    setMessage({ type: '', text: '' });
    setCurrentStep(prev => prev - 1);
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

    const kycData = {
      personalInfo: personalInfo,
    };

    if (documentInfo.idProof && documentInfo.idProof.name !== "Existing ID Proof") {
      kycData.idProof = await fileToBase64(documentInfo.idProof);
    }
    if (documentInfo.addressProof && documentInfo.addressProof.name !== "Existing Address Proof") {
      kycData.addressProof = await fileToBase64(documentInfo.addressProof);
    }
    if (user?.role === 'artisan' && documentInfo.credentials && documentInfo.credentials.name !== "Existing Credentials") {
      kycData.credentials = await fileToBase64(documentInfo.credentials);
    }

    if (faceRecognitionInfo) {
      // faceRecognitionInfo is already a base64 string from webcam capture
      kycData.faceImage = faceRecognitionInfo;
    }

    try {
      const res = await kycService.submitKYC(kycData, accessToken); // Pass kycData object
      setMessage({ type: 'success', text: res.message });
      if (res.user) {
        updateUser(res.user);
      }
      setIsEditing(false);
      setCurrentStep(1);
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

  const isFormDisabled = !isEditing && user?.kycStatus === 'approved';

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] mb-4">
          <ShieldAlert className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-[#151E3D] mb-2">Identity Verification</h2>
        <p className="text-gray-600 text-lg">Complete your KYC verification to unlock all features</p>
      </div>

      {/* Progress Bar */}
      {isEditing && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of 3</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / 3) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center mb-8">
        {!isEditing && user?.kycStatus !== 'approved' && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] hover:from-[#1E2A4A] hover:to-[#0F172A] text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Start Verification Process
          </button>
        )}
        {isEditing && (
          <button
            onClick={() => {
              setIsEditing(false);
              setCurrentStep(1);
              setMessage({ type: '', text: '' });
            }}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300"
          >
            Cancel Verification
          </button>
        )}
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`py-4 px-6 rounded-xl text-sm flex items-center mb-6 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <XCircle className="w-5 h-5 mr-3" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Status Display */}
      {status && user?.kycStatus !== 'approved' && !isEditing && (
        <div className={`p-6 rounded-xl mb-6 flex items-center ${status.color} border`}>
          {status.icon}
          <div>
            <p className="font-semibold">{status.text}</p>
            <p className="text-sm opacity-90 mt-1">
              {user?.kycStatus === 'pending' && 'We will review your documents within 24-48 hours.'}
              {user?.kycStatus === 'rejected' && 'Please check the requirements and resubmit your documents.'}
              {!user?.kycStatus && 'This process takes about 5 minutes to complete.'}
            </p>
          </div>
        </div>
      )}

      {/* Render Steps */}
      {isEditing && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && (
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                  <span className="text-2xl">👤</span>
                </div>
                <h3 className="text-2xl font-bold text-[#151E3D] mb-2">Personal Information</h3>
                <p className="text-gray-600">Please provide your basic personal details</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                <input
                  type="text"
                  id="fullName"
                    className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-2 transition-all duration-300 ${
                      validationErrors.fullName 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-200 focus:border-[#151E3D] focus:ring-[#151E3D]/20'
                    }`}
                  value={personalInfo.fullName}
                    onChange={(e) => {
                      setPersonalInfo({ ...personalInfo, fullName: e.target.value });
                      if (validationErrors.fullName) {
                        setValidationErrors(prev => ({ ...prev, fullName: null }));
                      }
                    }}
                  disabled={loading}
                    placeholder="Enter your full name"
                    required
                  />
                  {validationErrors.fullName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XCircle className="w-4 h-4 mr-1" />
                      {validationErrors.fullName}
                    </p>
                  )}
              </div>
                
              <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                <input
                  type="date"
                  id="dateOfBirth"
                    className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-2 transition-all duration-300 ${
                      validationErrors.dateOfBirth 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-200 focus:border-[#151E3D] focus:ring-[#151E3D]/20'
                    }`}
                  value={personalInfo.dateOfBirth}
                    onChange={(e) => {
                      setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value });
                      if (validationErrors.dateOfBirth) {
                        setValidationErrors(prev => ({ ...prev, dateOfBirth: null }));
                      }
                    }}
                  disabled={loading}
                    required
                  />
                  {validationErrors.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XCircle className="w-4 h-4 mr-1" />
                      {validationErrors.dateOfBirth}
                    </p>
                  )}
              </div>
                
              <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                <input
                    type="tel"
                  id="phoneNumber"
                    className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-2 transition-all duration-300 ${
                      validationErrors.phoneNumber 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-200 focus:border-[#151E3D] focus:ring-[#151E3D]/20'
                    }`}
                  value={personalInfo.phoneNumber}
                    onChange={(e) => {
                      setPersonalInfo({ ...personalInfo, phoneNumber: e.target.value });
                      if (validationErrors.phoneNumber) {
                        setValidationErrors(prev => ({ ...prev, phoneNumber: null }));
                      }
                    }}
                  disabled={loading}
                    placeholder="+234 800 000 0000"
                    required
                  />
                  {validationErrors.phoneNumber && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XCircle className="w-4 h-4 mr-1" />
                      {validationErrors.phoneNumber}
                    </p>
                  )}
              </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Address *
                  </label>
                  <textarea
                  id="address"
                    rows={3}
                    className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-2 transition-all duration-300 resize-none ${
                      validationErrors.address 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-200 focus:border-[#151E3D] focus:ring-[#151E3D]/20'
                    }`}
                  value={personalInfo.address}
                    onChange={(e) => {
                      setPersonalInfo({ ...personalInfo, address: e.target.value });
                      if (validationErrors.address) {
                        setValidationErrors(prev => ({ ...prev, address: null }));
                      }
                    }}
                  disabled={loading}
                    placeholder="Enter your complete address"
                    required
                  />
                  {validationErrors.address && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XCircle className="w-4 h-4 mr-1" />
                      {validationErrors.address}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="text-2xl font-bold text-[#151E3D] mb-2">Document Upload</h3>
                <p className="text-gray-600">Upload clear images of your verification documents</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`bg-white rounded-xl p-6 border-2 transition-all duration-300 ${
                  validationErrors.idProof 
                    ? 'border-red-300 hover:border-red-400' 
                    : 'border-gray-200 hover:border-[#151E3D]'
                }`}>
                <FileInput
                    label="Government-Issued ID"
                    subtitle="Passport, Driver's License, or National ID"
                  name="idProof"
                  file={documentInfo.idProof}
                    setFile={(file) => {
                      setDocumentInfo({ ...documentInfo, idProof: file });
                      if (validationErrors.idProof) {
                        setValidationErrors(prev => ({ ...prev, idProof: null }));
                      }
                    }}
                  disabled={loading}
                />
                  {validationErrors.idProof && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <XCircle className="w-4 h-4 mr-1" />
                      {validationErrors.idProof}
                    </p>
                  )}
                </div>
                
                <div className={`bg-white rounded-xl p-6 border-2 transition-all duration-300 ${
                  validationErrors.addressProof 
                    ? 'border-red-300 hover:border-red-400' 
                    : 'border-gray-200 hover:border-[#151E3D]'
                }`}>
                <FileInput
                    label="Proof of Address"
                    subtitle="Utility bill, Bank statement, or Government letter"
                  name="addressProof"
                  file={documentInfo.addressProof}
                    setFile={(file) => {
                      setDocumentInfo({ ...documentInfo, addressProof: file });
                      if (validationErrors.addressProof) {
                        setValidationErrors(prev => ({ ...prev, addressProof: null }));
                      }
                    }}
                  disabled={loading}
                />
                  {validationErrors.addressProof && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <XCircle className="w-4 h-4 mr-1" />
                      {validationErrors.addressProof}
                    </p>
                  )}
                </div>

                {user?.role === 'artisan' && (
                  <div className={`lg:col-span-2 bg-white rounded-xl p-6 border-2 transition-all duration-300 ${
                    validationErrors.credentials 
                      ? 'border-red-300 hover:border-red-400' 
                      : 'border-gray-200 hover:border-[#151E3D]'
                  }`}>
                  <FileInput
                      label="Professional Credentials"
                      subtitle="Trade license, Certification, or Professional qualification"
                    name="credentials"
                    file={documentInfo.credentials}
                      setFile={(file) => {
                        setDocumentInfo({ ...documentInfo, credentials: file });
                        if (validationErrors.credentials) {
                          setValidationErrors(prev => ({ ...prev, credentials: null }));
                        }
                      }}
                    disabled={loading}
                  />
                    {validationErrors.credentials && (
                      <p className="text-red-500 text-sm mt-2 flex items-center">
                        <XCircle className="w-4 h-4 mr-1" />
                        {validationErrors.credentials}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mt-8 text-center">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Camera className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-blue-800">Quick Capture</span>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">Use your camera to take photos directly</p>
                  <button 
                    type="button" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 flex items-center mx-auto" 
                    disabled={loading}
                  >
                    <Camera className="w-4 h-4 mr-2" /> Open Camera
              </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4">
                  <span className="text-2xl">📸</span>
                </div>
                <h3 className="text-2xl font-bold text-[#151E3D] mb-2">Face Verification</h3>
                <p className="text-gray-600">Take a clear photo of yourself for identity verification</p>
              </div>
              
              <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
                  <div className="flex flex-col items-center space-y-6">
                {faceRecognitionInfo ? (
                      <div className="relative">
                        <img 
                          src={faceRecognitionInfo} 
                          alt="Captured Face" 
                          className="w-48 h-48 object-cover rounded-full border-4 border-green-300 shadow-lg" 
                        />
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-2">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={200}
                    height={200}
                          className="rounded-full border-4 border-gray-300 shadow-lg"
                    videoConstraints={{ width: 200, height: 200, facingMode: "user" }}
                  />
                        <div className="absolute inset-0 rounded-full border-4 border-dashed border-gray-400 opacity-50"></div>
                      </div>
                )}
                    
                    <div className="text-center">
                <button
                  type="button"
                  onClick={capture}
                        className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center mx-auto ${
                          faceRecognitionInfo 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-[#151E3D] hover:bg-[#1E2A4A] text-white'
                        }`}
                  disabled={loading}
                >
                        <Camera className="w-5 h-5 mr-2" /> 
                        {faceRecognitionInfo ? 'Retake Photo' : 'Capture Photo'}
                </button>
                      {validationErrors.faceImage && (
                        <p className="text-red-500 text-sm mt-3 flex items-center justify-center">
                          <XCircle className="w-4 h-4 mr-1" />
                          {validationErrors.faceImage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm">💡</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-blue-800 mb-1">Photo Tips</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Ensure good lighting on your face</li>
                        <li>• Look directly at the camera</li>
                        <li>• Remove glasses or hats if possible</li>
                        <li>• Keep a neutral expression</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center"
                disabled={loading}
              >
                  <ArrowLeft className="w-5 h-5 mr-2" /> Previous
              </button>
            )}
            </div>

            <div className="flex space-x-3">
            {currentStep < 3 && (
              <button
                type="button"
                onClick={nextStep}
                  className="px-8 py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 flex items-center"
                disabled={loading}
              >
                  Next <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            )}

            {currentStep === 3 && (
              <button
                type="submit"
                  className={`px-8 py-3 font-semibold rounded-xl transition-all duration-300 flex items-center ${
                    loading || !faceRecognitionInfo
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                  disabled={loading || !faceRecognitionInfo}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Complete Verification
                    </>
                  )}
              </button>
            )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default KYCForm;
