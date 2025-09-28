const User = require("../models/User");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const Issue = require("../models/issue");
const ArtisanProfile = require("../models/ArtisanProfile"); // New: Import ArtisanProfile model
const Report = require("../models/Report"); // New: Import Report model
const ServiceProfileBooking = require("../models/ServiceProfileBooking"); // New: Import ServiceProfileBooking model
const Message = require("../models/Message"); // New: Import Message model

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
    
    // Get regular bookings counts
    const regularBookings = await Booking.countDocuments();
    const pendingRegularBookings = await Booking.countDocuments({ status: "Pending" });
    const completedRegularBookings = await Booking.countDocuments({ status: "Completed" });
    
    // Get service profile bookings counts
    const serviceProfileBookings = await ServiceProfileBooking.countDocuments();
    const pendingServiceBookings = await ServiceProfileBooking.countDocuments({ status: "Pending" });
    const completedServiceBookings = await ServiceProfileBooking.countDocuments({ status: "Completed" });
    
    // Calculate combined totals
    const totalBookings = regularBookings + serviceProfileBookings;
    const pendingBookings = pendingRegularBookings + pendingServiceBookings;
    const completedBookings = completedRegularBookings + completedServiceBookings;
    
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
      // Additional breakdown for admin insights
      regularBookings,
      serviceProfileBookings,
      pendingRegularBookings,
      pendingServiceBookings,
      completedRegularBookings,
      completedServiceBookings,
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


// @desc    Get all issues (Admin only)
// @route   GET /api/admin/issues
// @access  Private (Admin only)
exports.getAllIssues = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const issues = await Issue.find()
      .populate('reporter', 'name email role')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: issues
    });
  } catch (error) {
    console.error("Error fetching all issues:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

// @desc    Update issue status (Admin only)
// @route   PUT /api/admin/issues/:id/status
// @access  Private (Admin only)
exports.updateIssueStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { id } = req.params;
    const { status, assignedTo } = req.body;

    // Validate status
    const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid status: open, in-progress, resolved, or closed"
      });
    }

    // Find issue
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }

    // Update issue
    issue.status = status;
    if (assignedTo) {
      issue.assignedTo = assignedTo;
    }
    
    // If resolving or closing, set resolvedAt timestamp
    if (status === 'resolved' || status === 'closed') {
      issue.resolvedAt = new Date();
    }

    await issue.save();

    // Populate the updated issue
    await issue.populate('reporter', 'name email role');
    await issue.populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      message: "Issue status updated successfully",
      data: issue
    });

  } catch (error) {
    console.error("Error updating issue status:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc    Get issue by ID (Admin only)
// @route   GET /api/admin/issues/:id
// @access  Private (Admin only)
exports.getIssueById = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const issue = await Issue.findById(req.params.id)
      .populate('reporter', 'name email role phone')
      .populate('assignedTo', 'name email');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }

    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    console.error("Error fetching issue by ID:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
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
      .populate("customer", "name email phone")
      .populate("artisan", "name email");
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all service profile bookings
// @route   GET /api/admin/service-profile-bookings
// @access  Private (Admin only)
exports.getAllServiceProfileBookings = async (req, res) => {
  try {
    const serviceProfileBookings = await ServiceProfileBooking.find()
      .populate("customer", "name email phone")
      .populate("artisan", "name email")
      .populate("serviceProfile", "title category hourlyRate");
    res.status(200).json(serviceProfileBookings);
  } catch (error) {
    console.error("Error fetching all service profile bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all messages
// @route   GET /api/admin/messages
// @access  Private (Admin only)
exports.getAllMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50, conversationId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (conversationId) {
      query.conversationId = conversationId;
    }

    const messages = await Message.find(query)
      .populate("sender", "name email role")
      .populate("recipient", "name email role")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments(query);

    res.status(200).json({
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: skip + messages.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error("Error fetching all messages:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all conversations
// @route   GET /api/admin/conversations
// @access  Private (Admin only)
exports.getAllConversations = async (req, res) => {
  try {
    // Get unique conversation IDs
    const conversations = await Message.aggregate([
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $last: "$$ROOT" },
          messageCount: { $sum: 1 },
          participants: { $addToSet: { sender: "$sender", recipient: "$recipient" } }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "lastMessage.sender",
          foreignField: "_id",
          as: "senderInfo"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "lastMessage.recipient",
          foreignField: "_id",
          as: "recipientInfo"
        }
      },
      {
        $project: {
          conversationId: "$_id",
          lastMessage: 1,
          messageCount: 1,
          sender: { $arrayElemAt: ["$senderInfo", 0] },
          recipient: { $arrayElemAt: ["$recipientInfo", 0] }
        }
      },
      {
        $sort: { "lastMessage.timestamp": -1 }
      }
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching all conversations:", error);
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
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const reviews = await Review.find()
      .populate("customerId", "name email phone createdAt")
      .populate("artisanId", "name email phone artisanProfile")
      .populate("bookingId", "service price status serviceDate")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

// @desc    Get all issues (for admin)
// @route   GET /api/admin/issues
// @access  Private (Admin only)
exports.getAllIssues = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const issues = await Issue.find()
      .populate('reporter', 'name email role')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: issues
    });
  } catch (error) {
    console.error("Error fetching all issues:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update issue status (admin only)
// @route   PUT /api/admin/issues/:id/status
// @access  Private (Admin only)
exports.updateIssueStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { id } = req.params;
    const { status, assignedTo } = req.body;

    // Validate status
    const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid status: open, in-progress, resolved, or closed"
      });
    }

    // Find issue
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }

    // Update issue
    issue.status = status;
    if (assignedTo) {
      issue.assignedTo = assignedTo;
    }
    
    // If resolving or closing, set resolvedAt timestamp
    if (status === 'resolved' || status === 'closed') {
      issue.resolvedAt = new Date();
    }

    await issue.save();

    // Populate the updated issue
    await issue.populate('reporter', 'name email role');
    await issue.populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      message: "Issue status updated successfully",
      data: issue
    });

  } catch (error) {
    console.error("Error updating issue status:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc    Get issue by ID (admin only)
// @route   GET /api/admin/issues/:id
// @access  Private (Admin only)
exports.getIssueById = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const issue = await Issue.findById(req.params.id)
      .populate('reporter', 'name email role phone')
      .populate('assignedTo', 'name email');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }

    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    console.error("Error fetching issue by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Approve user KYC
// @route   PUT /api/admin/users/:id/kyc/approve
// @access  Private (Admin only)
exports.approveKyc = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update KYC status
    user.kycStatus = "approved";
    user.kycVerified = true;
    user.kycVerifiedAt = new Date();
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: "KYC approved successfully", 
      data: user 
    });
  } catch (error) {
    console.error("Error approving KYC:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Reject user KYC
// @route   PUT /api/admin/users/:id/kyc/reject
// @access  Private (Admin only)
exports.rejectKyc = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update KYC status
    user.kycStatus = "rejected";
    user.kycVerified = false;
    user.kycVerifiedAt = null;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: "KYC rejected successfully", 
      data: user 
    });
  } catch (error) {
    console.error("Error rejecting KYC:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};