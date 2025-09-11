const Booking = require("../models/Booking");
const User = require("../models/User"); // Import User model if not already
const NotificationService = require('../services/notificationService'); // Import notification service

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { 
      artisan, 
      service, 
      date, 
      time, 
      description, 
      urgencyLevel,
      contactPhone,
      preferredContactMethod,
      specialRequirements,
      price 
    } = req.body;
    
    // Validate required fields
    if (!artisan || !service || !date || !time || !description || !contactPhone) {
      return res.status(400).json({ 
        message: "Missing required fields: artisan, service, date, time, description, and contactPhone are required" 
      });
    }

    // Check if customer has verified KYC
    const customer = await User.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (!customer.kycVerified || customer.kycStatus !== 'approved') {
      return res.status(403).json({ 
        message: "KYC verification required to book services. Please complete your identity verification first.",
        kycRequired: true,
        kycStatus: customer.kycStatus
      });
    }

    const booking = await Booking.create({
      customer: req.user.id, // Use 'customer' field
      artisan,
      service,
      date,
      time,
      description,
      urgencyLevel: urgencyLevel || 'normal',
      contactPhone,
      preferredContactMethod: preferredContactMethod || 'phone',
      specialRequirements: specialRequirements || '',
      price: price || 0, // Use provided price or default to 0
      status: "Pending", // Initial status
    });
    
    res.status(201).json(booking);
  } catch (err) {
    // console.error("Create booking error:", err.stack); // Changed to err.stack
    res.status(500).json({ message: "Server error during booking creation" });
  }
};

// Get bookings for the logged-in customer
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id }) // Use 'customer' field
      .populate("artisan", "name email") // Populate artisan details
      .populate("customer", "name email"); // Also populate customer details for consistency
    res.json(bookings);
  } catch (err) {
    // console.error("Get my bookings error:", err.message);
    res.status(500).json({ message: "Server error while fetching my bookings" });
  }
};

// Get bookings for the authenticated artisan
exports.getArtisanBookings = async (req, res) => {
  try {
    const artisanId = req.user.id;
    const bookings = await Booking.find({ artisan: artisanId })
      .populate("customer", "name email")
      .populate("artisan", "name email");

    res.json(bookings);
  } catch (err) {
    // console.error("Get artisan bookings error:", err.message);
    res.status(500).json({ message: "Server error while fetching artisan bookings" });
  }
};

// Get a single booking by ID (accessible by customer or artisan if involved)
exports.getBookingById = async (req, res) => {
  try {
    // console.log("--- Entering getBookingById controller ---");
    const booking = await Booking.findById(req.params.id)
      .populate("customer", "name email")
      .populate("artisan", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }


    // Ensure only involved customer/artisan or admin can view
    if (
      booking.customer._id.toString() !== req.user.id &&
      booking.artisan._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized to view this booking" });
    }

    res.json(booking);
  } catch (err) {
    // console.error("Get booking by ID error:", err.message);
    res.status(500).json({ message: "Server error while fetching booking" });
  }
};

// Update booking status (by artisan or admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!["Pending", "Accepted", "Declined", "Pending Confirmation", "Completed", "Cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    let booking = await Booking.findById(id)
      .populate("customer", "name email")
      .populate("artisan", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only the assigned artisan or an admin can update status
    if (booking.artisan._id.toString() !== userId && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to update this booking" });
    }

    // Check job acceptance limits for artisans when accepting a job
    if (status === "Accepted" && userRole === "artisan") {
      const artisan = await User.findById(userId);
      
      if (!artisan) {
        return res.status(404).json({ message: "Artisan not found" });
      }

      // Check if artisan has verified KYC
      if (!artisan.kycVerified || artisan.kycStatus !== 'approved') {
        return res.status(403).json({ 
          message: "KYC verification required to accept jobs. Please complete your identity verification first.",
          kycRequired: true,
          kycStatus: artisan.kycStatus
        });
      }

      // Check if artisan can accept more jobs
      if (!artisan.canAcceptJobs) {
        return res.status(400).json({ 
          message: "Job acceptance limit reached. Upgrade to premium for unlimited job acceptances.",
          limitReached: true,
          remainingJobs: artisan.remainingJobs
        });
      }

      // Increment accepted jobs count
      artisan.jobAcceptance.acceptedJobs += 1;
      await artisan.save();
    }

    booking.status = status;
    await booking.save();

    // Send notifications to both customer and artisan
    try {
      // Notify customer about status change
      await NotificationService.notifyJobStatusChange(
        booking, 
        status, 
        booking.customer._id, 
        userRole === 'admin' ? null : userId
      );

      // Notify artisan about status change (if not initiated by them)
      if (userRole !== 'admin') {
        await NotificationService.notifyJobStatusChange(
          booking, 
          status, 
          booking.artisan._id, 
          null
        );
      }
    } catch (notificationError) {
      // // console.error('Error sending notifications:', notificationError);
      // Don't fail the status update if notifications fail
    }

    res.json(booking);
  } catch (err) {
    // console.error("Update booking status error:", err.message);
    res.status(500).json({ message: "Server error while updating booking status" });
  }
};

// Delete booking (only by customer or admin)
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only the customer who created it or an admin can delete
    if (booking.customer.toString() !== userId && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to delete this booking" });
    }

    await Booking.findByIdAndDelete(id);
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    // console.error("Delete booking error:", err.message);
    res.status(500).json({ message: "Server error while deleting booking" });
  }
};
