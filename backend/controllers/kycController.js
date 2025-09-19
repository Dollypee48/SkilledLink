const User = require('../models/User');
const { uploadFile } = require('../utils/cloudinary'); // Import Cloudinary upload utility
const { validateKYCSubmission, GOVERNMENT_ID_TYPES, ADDRESS_PROOF_TYPES } = require('../utils/kycValidation');
const dotenv = require('dotenv');
dotenv.config();

// @desc    Get available government ID types and address proof types
// @route   GET /api/kyc/types
// @access  Public
exports.getKYCTypes = async (req, res) => {
  try {
    res.status(200).json({
      governmentIdTypes: GOVERNMENT_ID_TYPES,
      addressProofTypes: ADDRESS_PROOF_TYPES
    });
  } catch (error) {
    console.error('Error fetching KYC types:', error.message);
    res.status(500).json({ message: 'Server error fetching KYC types' });
  }
};

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

    // Extract KYC data from req.body
    const { 
      governmentIdType, 
      governmentIdFront, 
      governmentIdBack,
      addressProofType,
      addressProof,
      credentials, 
      portfolio,
      faceImage, 
      personalInfo 
    } = req.body;

    // Validate KYC submission data
    const kycData = {
      governmentIdType,
      governmentIdFront,
      governmentIdBack,
      addressProofType,
      addressProof,
      credentials,
      portfolio,
      faceImage,
      userRole: user.role
    };

    const validation = validateKYCSubmission(kycData);
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'KYC validation failed', 
        errors: validation.errors 
      });
    }

    const kycDocuments = {};
    
    // Upload government ID documents
    if (governmentIdFront) {
      const frontUrl = await uploadFile(governmentIdFront.split(',')[1], 'image/jpeg', 'kyc/government_id');
      kycDocuments.governmentIdFront = frontUrl.secure_url;
    }
    
    if (governmentIdBack) {
      const backUrl = await uploadFile(governmentIdBack.split(',')[1], 'image/jpeg', 'kyc/government_id');
      kycDocuments.governmentIdBack = backUrl.secure_url;
    }

    // Upload address proof
    if (addressProof) {
      const addressProofUrl = await uploadFile(addressProof.split(',')[1], 'image/jpeg', 'kyc/address_proofs');
      kycDocuments.addressProof = addressProofUrl.secure_url;
    }

    // Upload professional credentials (for artisans)
    if (user.role === 'artisan' && credentials) {
      const credentialsUrl = await uploadFile(credentials.split(',')[1], 'image/jpeg', 'kyc/credentials');
      kycDocuments.credentials = credentialsUrl.secure_url;
    }

    // Upload portfolio (for artisans)
    if (user.role === 'artisan' && portfolio) {
      const portfolioUrl = await uploadFile(portfolio.split(',')[1], 'image/jpeg', 'kyc/portfolios');
      kycDocuments.portfolio = portfolioUrl.secure_url;
    }

    // Upload face image
    if (faceImage) {
      const faceImageUrl = await uploadFile(faceImage.split(',')[1], 'image/jpeg', 'kyc/face_images');
      kycDocuments.faceImage = faceImageUrl.secure_url;
    }

    // Update user's personal information from frontend if provided
    if (personalInfo) {
      user.name = personalInfo.fullName;
      if (personalInfo.gender) {
        user.gender = personalInfo.gender;
      }
      if (personalInfo.phoneNumber) {
        user.phone = personalInfo.phoneNumber;
      }
      if (personalInfo.address) {
        user.address = personalInfo.address;
      }
    }

    // Update user's KYC documents with new structure
    user.kycDocuments = {
      ...user.kycDocuments,
      ...kycDocuments,
      governmentIdType,
      addressProofType
    };
    user.kycStatus = 'pending';
    user.kycVerified = false; // Reset to false until approved by admin
    await user.save();

    const updatedUser = await User.findById(userId).select("-password -refreshToken");
    res.status(200).json({ message: 'KYC documents submitted successfully for review', user: updatedUser });
  } catch (error) {
    console.error('Error submitting KYC:', error.stack);
    
    // Provide more specific error messages
    if (error.message.includes('Cloudinary')) {
      return res.status(500).json({ 
        message: 'File upload service unavailable. Please check server configuration.',
        error: 'CLOUDINARY_ERROR'
      });
    }
    
    if (error.message.includes('validation')) {
      return res.status(400).json({ 
        message: 'Invalid KYC data provided',
        error: 'VALIDATION_ERROR'
      });
    }
    
    if (error.message.includes('User not found')) {
      return res.status(404).json({ 
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during KYC submission',
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_SERVER_ERROR'
    });
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
