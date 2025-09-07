const User = require('../models/User');
const { uploadFile } = require('../utils/cloudinary'); // Import Cloudinary upload utility
const dotenv = require('dotenv');
dotenv.config();

// @desc    Submit KYC documents
// @route   POST /api/kyc/submit
// @access  Private
exports.submitKYC = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Extract base64 strings from req.body
    const { idProof, addressProof, credentials, faceImage, personalInfo } = req.body; // Added personalInfo for completeness
    
    const kycDocuments = {};
    
    if (idProof) {
      const idProofUrl = await uploadFile(idProof.split(',')[1], 'image/jpeg', 'kyc/id_proofs');
      kycDocuments.idProof = idProofUrl.secure_url;
    }
    if (addressProof) {
      const addressProofUrl = await uploadFile(addressProof.split(',')[1], 'image/jpeg', 'kyc/address_proofs');
      kycDocuments.addressProof = addressProofUrl.secure_url;
    }
    if (user.role === 'artisan' && credentials) {
      const credentialsUrl = await uploadFile(credentials.split(',')[1], 'image/jpeg', 'kyc/credentials');
      kycDocuments.credentials = credentialsUrl.secure_url;
    }
    if (faceImage) {
      const faceImageUrl = await uploadFile(faceImage.split(',')[1], 'image/jpeg', 'kyc/face_images');
      kycDocuments.faceImage = faceImageUrl.secure_url;
    }

    // console.log('KYC Documents after Cloudinary processing:', kycDocuments); // Added log

    // Update validation logic to check for the presence of the uploaded URLs
    if (!kycDocuments.idProof || !kycDocuments.addressProof || (user.role === 'artisan' && !kycDocuments.credentials) || !kycDocuments.faceImage) {
      return res.status(400).json({ message: 'Missing required KYC documents or face image' });
    }

    // Update user's personal information from frontend if provided
    if (personalInfo) {
      user.name = personalInfo.fullName;
      // Add other personalInfo fields to update user model if needed
    }

    user.kycDocuments = kycDocuments;
    user.kycStatus = 'pending';
    user.kycVerified = false; // Reset to false until approved by admin
    await user.save();

    const updatedUser = await User.findById(userId).select("-password -refreshToken");
    res.status(200).json({ message: 'KYC documents submitted successfully for review', user: updatedUser });
  } catch (error) {
    console.error('Error submitting KYC:', error.stack); // Changed to error.stack
    res.status(500).json({ message: 'Server error during KYC submission' });
  }
};

// @desc    Get all pending KYC requests
// @route   GET /api/kyc/pending
// @access  Private (Admin only)
exports.getPendingKYC = async (req, res) => {
  try {
    const pendingUsers = await User.find({ kycStatus: 'pending' }).select('-password -refreshToken');
    res.status(200).json(pendingUsers);
  } catch (error) {
    console.error('Error fetching pending KYC requests:', error.message);
    res.status(500).json({ message: 'Server error fetching pending KYC' });
  }
};

// @desc    Verify (Approve/Reject) a KYC request
// @route   PUT /api/kyc/verify/:id
// @access  Private (Admin only)
exports.verifyKYC = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided. Must be \'approved\' or \'rejected\'.' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.kycStatus = status;
    user.kycVerified = status === 'approved';
    await user.save();

    const updatedUser = await User.findById(id).select("-password -refreshToken");
    res.status(200).json({ message: `KYC request ${status} successfully`, user: updatedUser });
  } catch (error) {
    console.error('Error verifying KYC:', error.message);
    res.status(500).json({ message: 'Server error during KYC verification' });
  }
};
