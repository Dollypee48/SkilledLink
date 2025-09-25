const express = require('express');
const router = express.Router();
const {
  verifyKYC,
  suspendUser,
  getAnalytics,
  getAdminDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAllArtisans, // New
  getAllBookings, // New
  getAllServiceProfileBookings, // New
  getAllReports,  // New
  getAllReviews,  // New
  fixKYCStatus,   // New
  getAllIssues,   // New
  updateIssueStatus, // New
  getIssueById,   // New
  approveKyc,     // New
  rejectKyc,      // New
  getAllMessages, // New
  getAllConversations // New
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// User Management Routes
router.get("/users", auth, role(["admin"]), getAllUsers);
router.get("/users/:id", auth, role(["admin"]), getUserById);
router.put("/users/:id/role", auth, role(["admin"]), updateUserRole);
router.delete("/users/:id", auth, role(["admin"]), deleteUser);

// KYC Management Routes
router.put("/users/:id/kyc/approve", auth, role(["admin"]), approveKyc);
router.put("/users/:id/kyc/reject", auth, role(["admin"]), rejectKyc);

router.put('/verify/:id', auth, role(['admin']), verifyKYC);
router.put('/suspend/:id', auth, role(['admin']), suspendUser);
router.get('/analytics', auth, role(['admin']), getAnalytics);
router.post('/fix-kyc-status', auth, role(['admin']), fixKYCStatus);

// Admin Dashboard Stats
router.get("/dashboard-stats", auth, role(["admin"]), getAdminDashboardStats); // Added role middleware

// New Admin Data Routes
router.get("/artisans", auth, role(["admin"]), getAllArtisans);
router.get("/bookings", auth, role(["admin"]), getAllBookings);
router.get("/service-profile-bookings", auth, role(["admin"]), getAllServiceProfileBookings);
router.get("/reports", auth, role(["admin"]), getAllReports);
router.get("/reviews", auth, role(["admin"]), getAllReviews);

// Issue Management Routes
router.get("/issues", auth, role(["admin"]), getAllIssues);
router.get("/issues/:id", auth, role(["admin"]), getIssueById);
router.put("/issues/:id/status", auth, role(["admin"]), updateIssueStatus);

// Message Management Routes
router.get("/messages", auth, role(["admin"]), getAllMessages);
router.get("/conversations", auth, role(["admin"]), getAllConversations);

module.exports = router;