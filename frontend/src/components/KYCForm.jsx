import React, { useState, useEffect, useRef, useCallback } from 'react'; // Added useRef, useCallback
import { useAuth } from '../context/AuthContext';
import { kycService } from '../services/kycService';
import { CheckCircle, XCircle, Loader2, UploadCloud, ArrowLeft, ArrowRight, Camera } from 'lucide-react';
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

  // Webcam references and capture logic
  const webcamRef = useRef(null);
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setFaceRecognitionInfo(imageSrc); // Store the base64 image
  }, [webcamRef]);

  // Existing states, adjusted
  const [profileImage, setProfileImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({
    type: '',
    text: ''
  });
  const [loading, setLoading] = useState(false);

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
    if (currentStep === 1) {
      if (!personalInfo.fullName || !personalInfo.dateOfBirth || !personalInfo.phoneNumber || !personalInfo.address) {
        setMessage({ type: 'error', text: 'Please fill in all personal information fields.' });
        return;
      }
    } else if (currentStep === 2) {
      if (!documentInfo.idProof || !documentInfo.addressProof || (user?.role === 'artisan' && !documentInfo.credentials)) {
        setMessage({ type: 'error', text: 'Please upload all required documents.' });
        return;
      }
    } else if (currentStep === 3) {
      if (!faceRecognitionInfo) {
        setMessage({ type: 'error', text: 'Please capture your face for verification.' });
        return;
      }
    }
    setMessage({ type: '', text: '' });
    setCurrentStep(prev => prev + 1);
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">KYC Verification (Step {currentStep}/3)</h2>
          <p className="text-gray-600">Manage your Know Your Customer (KYC) documents</p>
        </div>
        {!isEditing && user?.kycStatus !== 'approved' && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-[#F59E0B] text-white rounded-md hover:bg-[#D97706]"
          >
            Start Verification
          </button>
        )}
        {isEditing && (
          <button
            onClick={() => {
              setIsEditing(false);
              setCurrentStep(1);
              setMessage({ type: '', text: '' });
            }}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>

      {message.text && (
        <div className={`py-2 px-3 rounded-md text-sm flex items-center mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
          {message.text}
        </div>
      )}

      {status && user?.kycStatus !== 'approved' && !isEditing && (
        <div className={`p-3 rounded-md mb-4 flex items-center ${status.color}`}>
          {status.icon}
          <p className="text-sm font-medium">{status.text}</p>
        </div>
      )}

      {/* Render Steps */}
      {isEditing && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Step 1: Personal Information</h3>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={personalInfo.fullName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={personalInfo.dateOfBirth}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="text"
                  id="phoneNumber"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={personalInfo.phoneNumber}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phoneNumber: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  id="address"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={personalInfo.address}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Step 2: Document Upload</h3>
              <p className="text-sm text-gray-600">Please upload clear images of your documents. You may also use your camera to snap pictures directly.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileInput
                  label="Government-Issued ID (Passport/Driver's License)"
                  name="idProof"
                  file={documentInfo.idProof}
                  setFile={(file) => setDocumentInfo({ ...documentInfo, idProof: file })}
                  disabled={loading}
                />
                <FileInput
                  label="Proof of Address (Utility Bill, Bank Statement)"
                  name="addressProof"
                  file={documentInfo.addressProof}
                  setFile={(file) => setDocumentInfo({ ...documentInfo, addressProof: file })}
                  disabled={loading}
                />

                {user?.role === 'artisan' && (
                  <FileInput
                    label="Professional Credentials (Trade License, Certification)"
                    name="credentials"
                    file={documentInfo.credentials}
                    setFile={(file) => setDocumentInfo({ ...documentInfo, credentials: file })}
                    disabled={loading}
                  />
                )}
              </div>
              {/* Placeholder for camera snapping functionality */}
              <button type="button" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center mt-4" disabled={loading}>
                <Camera className="w-5 h-5 mr-2" /> Snap Document
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 text-center">
              <h3 className="text-lg font-semibold text-gray-800">Step 3: Face Recognition</h3>
              <p className="text-sm text-gray-600">Please position your face clearly in front of the camera and click "Capture Photo".</p>
              <div className="flex flex-col items-center justify-center space-y-4">
                {faceRecognitionInfo ? (
                  <img src={faceRecognitionInfo} alt="Captured Face" className="w-48 h-48 object-cover rounded-full border-2 border-gray-300" />
                ) : (
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={200}
                    height={200}
                    className="rounded-full border-2 border-gray-300"
                    videoConstraints={{ width: 200, height: 200, facingMode: "user" }}
                  />
                )}
                <button
                  type="button"
                  onClick={capture}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center"
                  disabled={loading}
                >
                  <Camera className="w-5 h-5 mr-2" /> {faceRecognitionInfo ? 'Retake Photo' : 'Capture Photo'}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">Make sure you are in a well-lit area.</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center"
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Previous
              </button>
            )}

            {currentStep < 3 && (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#F59E0B] hover:bg-[#D97706] flex items-center ml-auto"
                disabled={loading}
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}

            {currentStep === 3 && (
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#10B981] hover:bg-[#059669] flex items-center ml-auto"
                disabled={loading || !faceRecognitionInfo} // Disable if no image captured
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Complete KYC'}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default KYCForm;
