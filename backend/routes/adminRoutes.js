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
  getAllReports,  // New
  getAllReviews   // New
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// User Management Routes
router.get("/users", auth, role(["admin"]), getAllUsers);
router.get("/users/:id", auth, role(["admin"]), getUserById);
router.put("/users/:id/role", auth, role(["admin"]), updateUserRole);
router.delete("/users/:id", auth, role(["admin"]), deleteUser);

router.put('/verify/:id', auth, role(['admin']), verifyKYC);
router.put('/suspend/:id', auth, role(['admin']), suspendUser);
router.get('/analytics', auth, role(['admin']), getAnalytics);

// Admin Dashboard Stats
router.get("/dashboard-stats", auth, role(["admin"]), getAdminDashboardStats); // Added role middleware

// New Admin Data Routes
router.get("/artisans", auth, role(["admin"]), getAllArtisans);
router.get("/bookings", auth, role(["admin"]), getAllBookings);
router.get("/reports", auth, role(["admin"]), getAllReports);
router.get("/reviews", auth, role(["admin"]), getAllReviews);

module.exports = router;