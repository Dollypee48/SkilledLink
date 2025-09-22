const Booking = require("../models/Booking");
const User = require("../models/User"); // Import User model if not already
const NotificationService = require('../services/notificationService'); // Import notification service

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    console.log('Received booking request:', req.body);
    console.log('User ID:', req.user.id);
    
    const { 
      artisan, 
      service, 
      serviceProfile, // New field for service profile ID
      date, 
      time, 
      description, 
      urgencyLevel,
      contactPhone,
      preferredContactMethod,
      specialRequirements,
      price,
      hourlyRate,
      totalAmount,
      estimatedDuration,
      location
    } = req.body;
    
    // Validate required fields
    console.log('Validating fields:', {
      artisan: !!artisan,
      service: !!service,
      date: !!date,
      time: !!time,
      description: !!description,
      contactPhone: !!contactPhone
    });
    
    if (!artisan || !service || !date || !time || !description || !contactPhone) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({ 
        message: "Missing required fields: artisan, service, date, time, description, and contactPhone are required",
        received: {
          artisan: !!artisan,
          service: !!service,
          date: !!date,
          time: !!time,
          description: !!description,
          contactPhone: !!contactPhone
        }
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
      serviceProfile: serviceProfile || null, // Service profile ID if available
      date,
      time,
      description,
      urgencyLevel: urgencyLevel || 'normal',
      contactPhone,
      preferredContactMethod: preferredContactMethod || 'phone',
      specialRequirements: specialRequirements || '',
      estimatedDuration: estimatedDuration || null,
      location: location || '',
      hourlyRate: hourlyRate || 0, // Hourly rate from service profile
      totalAmount: totalAmount || 0, // Calculated total amount
      price: price || totalAmount || 0, // Use totalAmount as price if available
      status: "Pending", // Initial status
    });

    // Populate booking with customer and artisan details for notification
    const populatedBooking = await booking.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'artisan', select: 'name email phone' }
    ]);

    // Send notification to artisan about new job request
    try {
      console.log('Creating notification for artisan:', artisan);
      console.log('Customer name:', customer.name);
      console.log('Service:', service);
      
      const notification = await NotificationService.createNotification({
        recipient: artisan,
        recipientRole: 'artisan',
        sender: req.user.id,
        senderRole: 'customer',
        title: 'New Job Request!',
        message: `You have received a new ${service} job request from ${customer.name}. Check your bookings to respond.`,
        type: 'info',
        category: 'job_status',
        important: true,
        data: {
          bookingId: booking._id,
          service: service,
          customerName: customer.name,
          date: date,
          time: time
        }
      });
      
      console.log('Notification created successfully:', notification._id);
    } catch (notificationError) {
      console.error('Error sending job request notification to artisan:', notificationError);
      // Don't fail the booking creation if notification fails
    }
    
    res.status(201).json(populatedBooking);
  } catch (err) {
    // console.error("Create booking error:", err.stack); // Changed to err.stack
    res.status(500).json({ message: "Server error during booking creation" });
  }
};

// Get bookings for the logged-in customer
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id }) // Use 'customer' field
      .populate("artisan", "name email phone") // Populate artisan details
      .populate("customer", "name email phone"); // Also populate customer details for consistency
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
      .populate("customer", "name email phone")
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
      .populate("customer", "name email phone")
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
      .populate("customer", "name email phone")
      .populate("artisan", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only the assigned artisan or an admin can update status
    if (booking.artisan._id.toString() !== userId && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to update this booking" });
    }

    // Validate status transitions for artisans
    if (userRole === 'artisan') {
      const currentStatus = booking.status;
      const validTransitions = {
        'Pending': ['Accepted', 'Declined'],
        'Accepted': ['Pending Confirmation', 'Cancelled'],
        'Pending Confirmation': ['Completed'], // Only after customer confirmation
        'Completed': [], // No further transitions from completed
        'Declined': [], // No further transitions from declined
        'Cancelled': [] // No further transitions from cancelled
      };

      if (!validTransitions[currentStatus]?.includes(status)) {
        return res.status(400).json({ 
          message: `Invalid status transition from "${currentStatus}" to "${status}". Valid transitions: ${validTransitions[currentStatus]?.join(', ') || 'none'}`,
          currentStatus,
          requestedStatus: status,
          validTransitions: validTransitions[currentStatus] || []
        });
      }

      // Special validation for Completed status
      if (status === 'Completed' && currentStatus !== 'Pending Confirmation') {
        return res.status(400).json({ 
          message: "Job can only be marked as completed after customer confirmation. Please first request customer confirmation.",
          currentStatus,
          requiredStatus: 'Pending Confirmation'
        });
      }
    }

    // Check job acceptance limits for artisans when accepting a job
    if (status === "Accepted" && userRole === "artisan") {
      const artisan = await User.findById(userId);
      
      if (!artisan) {
        return res.status(404).json({ message: "Artisan not found" });
      }

      // Check and update subscription status
      await artisan.checkSubscriptionStatus();

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
          remainingJobs: artisan.remainingJobs,
          isPremium: artisan.isPremium
        });
      }

      // Increment accepted jobs count
      artisan.jobAcceptance.acceptedJobs += 1;
      await artisan.save();
    }

    booking.status = status;
    await booking.save();

    // Send notifications only to the appropriate recipient
    try {
      if (userRole === 'artisan') {
        // Artisan is updating status - notify customer
        await NotificationService.notifyJobStatusChange(
          booking, 
          status, 
          booking.customer._id, 
          userId,
          'customer',
          'artisan'
        );
      } else if (userRole === 'admin') {
        // Admin is updating status - notify both customer and artisan
        await NotificationService.notifyJobStatusChange(
          booking, 
          status, 
          booking.customer._id, 
          userId,
          'customer',
          'admin'
        );
        
        await NotificationService.notifyJobStatusChange(
          booking, 
          status, 
          booking.artisan._id, 
          userId,
          'artisan',
          'admin'
        );
      }
      // Note: Customer cannot update job status, so no notification needed for customer-initiated changes
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
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
