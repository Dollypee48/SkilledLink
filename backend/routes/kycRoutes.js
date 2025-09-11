const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const kycController = require('../controllers/kycController');

// @route   GET /api/kyc/types
// @desc    Get available government ID types and address proof types
// @access  Public
router.get('/types', kycController.getKYCTypes);

// @route   POST /api/kyc/submit
// @desc    Submit KYC documents (ID Proof, Address Proof, optional Credentials)
// @access  Private
router.post(
  '/submit',
  auth,
  kycController.submitKYC
);

// @route   GET /api/kyc/pending
// @desc    Get all pending KYC requests
// @access  Private (Admin only)
router.get('/pending', auth, role(['admin']), kycController.getPendingKYC);

// @route   PUT /api/kyc/verify/:id
// @desc    Approve or reject a KYC request
// @access  Private (Admin only)
router.put('/verify/:id', auth, role(['admin']), kycController.verifyKYC);

module.exports = router;
