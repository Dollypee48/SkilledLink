const User = require("../models/User");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const Issue = require("../models/Issue");
const ArtisanProfile = require("../models/ArtisanProfile"); // New: Import ArtisanProfile model
const Report = require("../models/Report"); // New: Import Report model

// @desc    Get Admin Dashboard Statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin only)
exports.getAdminDashboardStats = async (req, res) => {
  try {
    // Ensure only admins can access this route
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const totalUsers = await User.countDocuments();
    const totalArtisans = await User.countDocuments({ role: "artisan" });
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: "Pending" });
    const completedBookings = await Booking.countDocuments({ status: "Completed" });
    const totalReviews = await Review.countDocuments();
    const totalIssues = await Issue.countDocuments();
    const pendingIssues = await Issue.countDocuments({ status: "Pending" });

    res.status(200).json({
      totalUsers,
      totalArtisans,
      totalCustomers,
      totalBookings,
      pendingBookings,
      completedBookings,
      totalReviews,
      totalIssues,
      pendingIssues,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const users = await User.find().select("-password -refreshToken");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
exports.getUserById = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const user = await User.findById(req.params.id).select("-password -refreshToken");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { role } = req.body;
    if (!["customer", "artisan", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role provided" });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password -refreshToken");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User role updated successfully", user });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.verifyKYC = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { 
        kycVerified: true,
        kycStatus: 'approved'
      }, 
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'KYC verified', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isSuspended: true }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User suspended', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const bookingsCount = await Booking.countDocuments();
    res.json({ usersCount, bookingsCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Fix KYC status for all users
// @route   POST /api/admin/fix-kyc-status
// @access  Private (Admin only)
exports.fixKYCStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    console.log('Starting KYC status migration...');
    
    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to check`);
    
    let fixedCount = 0;
    
    for (const user of users) {
      let needsUpdate = false;
      const updates = {};
      
      // All users now require admin verification - no auto-verification
      // Customers are no longer automatically verified
      
      // Fix artisans who have kycVerified but wrong status
      if (user.role === 'artisan' && user.kycVerified === true && user.kycStatus !== 'approved') {
        updates.kycStatus = 'approved';
        needsUpdate = true;
      }
      
      // Fix users who have approved status but kycVerified is false
      if (user.kycStatus === 'approved' && user.kycVerified !== true) {
        updates.kycVerified = true;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await User.findByIdAndUpdate(user._id, updates);
        console.log(`Fixed user ${user.email} (${user.role}):`, updates);
        fixedCount++;
      }
    }
    
    console.log(`Migration completed. Fixed ${fixedCount} users.`);
    res.json({ message: `KYC status migration completed. Fixed ${fixedCount} users.` });
    
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ message: 'Migration failed', error: error.message });
  }
};

// @desc    Get all artisans
// @route   GET /api/admin/artisans
// @access  Private (Admin only)
exports.getAllArtisans = async (req, res) => {
  try {
    const artisans = await User.find({ role: "artisan" })
      .populate("artisanProfile")
      .select("-password -refreshToken");
    res.status(200).json(artisans);
  } catch (error) {
    console.error("Error fetching all artisans:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private (Admin only)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("customer", "name email")
      .populate("artisan", "name email");
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private (Admin only)
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('userId', 'name email') // Corrected from reportedBy to userId
      .sort({ date: -1 });

    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    console.error("Error fetching all reports:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all reviews
// @route   GET /api/admin/reviews
// @access  Private (Admin only)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("customer", "name email")
      .populate("artisan", "name email");
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
};