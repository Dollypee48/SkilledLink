const User = require('../models/User');

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

    const kycDocuments = {};

    if (req.files.idProof && req.files.idProof[0]) {
      kycDocuments.idProof = req.files.idProof[0].path;
    }
    if (req.files.addressProof && req.files.addressProof[0]) {
      kycDocuments.addressProof = req.files.addressProof[0].path;
    }
    if (user.role === 'artisan' && req.files.credentials && req.files.credentials[0]) {
      kycDocuments.credentials = req.files.credentials[0].path;
    }

    if (!kycDocuments.idProof || !kycDocuments.addressProof || (user.role === 'artisan' && !kycDocuments.credentials)) {
      return res.status(400).json({ message: 'Missing required KYC documents' });
    }

    user.kycDocuments = kycDocuments;
    user.kycStatus = 'pending';
    user.kycVerified = false; // Reset to false until approved by admin
    await user.save();

    const updatedUser = await User.findById(userId).select("-password -refreshToken");
    res.status(200).json({ message: 'KYC documents submitted successfully for review', user: updatedUser });
  } catch (error) {
    console.error('Error submitting KYC:', error.message);
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
