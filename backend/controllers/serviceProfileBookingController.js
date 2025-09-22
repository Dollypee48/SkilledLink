const ServiceProfileBooking = require("../models/ServiceProfileBooking");
const ServiceProfile = require("../models/ServiceProfile");
const User = require("../models/User");
const NotificationService = require('../services/notificationService');

// Create a new service profile booking
exports.createServiceProfileBooking = async (req, res) => {
  try {
    console.log('Received service profile booking request:', req.body);
    console.log('User ID:', req.user.id);
    
    const { 
      serviceProfile,
      date, 
      time, 
      description, 
      estimatedDuration,
      specialRequirements,
      location
    } = req.body;
    
    // Validate required fields
    console.log('Validating fields:', {
      serviceProfile: !!serviceProfile,
      date: !!date,
      time: !!time,
      description: !!description,
      estimatedDuration: !!estimatedDuration
    });
    
    if (!serviceProfile || !date || !time || !description || !estimatedDuration) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({ 
        message: "Missing required fields: serviceProfile, date, time, description, and estimatedDuration are required",
        received: {
          serviceProfile: !!serviceProfile,
          date: !!date,
          time: !!time,
          description: !!description,
          estimatedDuration: !!estimatedDuration
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

    // Get service profile details
    const serviceProfileDoc = await ServiceProfile.findById(serviceProfile)
      .populate('artisanId', 'name email')
      .populate({
        path: 'artisanId',
        populate: {
          path: 'artisanProfile',
          select: 'skills service bio experience hourlyRate'
        }
      });

    if (!serviceProfileDoc) {
      return res.status(404).json({ message: "Service profile not found" });
    }

    if (!serviceProfileDoc.isActive) {
      return res.status(400).json({ message: "This service profile is currently unavailable for booking" });
    }

    // Calculate pricing - use service profile hourly rate first, fallback to artisan's hourly rate
    const serviceProfileRate = serviceProfileDoc.hourlyRate;
    const artisanRate = serviceProfileDoc.artisanId?.artisanProfile?.hourlyRate;
    const hourlyRate = serviceProfileRate || artisanRate || 0;
    
    console.log('Pricing calculation:', {
      serviceProfileRate,
      artisanRate,
      selectedHourlyRate: hourlyRate,
      estimatedDuration: parseFloat(estimatedDuration)
    });
    
    if (!hourlyRate || hourlyRate <= 0) {
      return res.status(400).json({ 
        message: "Service profile has an invalid or missing hourly rate. Please contact the artisan to update their pricing." 
      });
    }
    
    const totalAmount = parseFloat(estimatedDuration) * hourlyRate;
    console.log('Total amount calculated:', totalAmount);

    // Validate date format
    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    console.log('Creating booking with data:', {
      customer: req.user.id,
      artisan: serviceProfileDoc.artisanId._id,
      serviceProfile: serviceProfile,
      serviceName: serviceProfileDoc.title,
      date: bookingDate,
      time,
      description,
      hourlyRate,
      estimatedDuration: parseFloat(estimatedDuration),
      totalAmount,
      specialRequirements: specialRequirements || '',
      location: location || serviceProfileDoc.serviceArea?.address || '',
      status: "Pending",
    });

    const booking = await ServiceProfileBooking.create({
      customer: req.user.id,
      artisan: serviceProfileDoc.artisanId._id,
      serviceProfile: serviceProfile,
      serviceName: serviceProfileDoc.title, // Use title instead of serviceName
      date: bookingDate, // Use validated date
      time,
      description,
      hourlyRate,
      estimatedDuration: parseFloat(estimatedDuration),
      totalAmount,
      specialRequirements: specialRequirements || '',
      location: location || serviceProfileDoc.serviceArea?.address || '',
      status: "Pending",
    });

    // Populate booking with customer and artisan details for notification
    const populatedBooking = await booking.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'artisan', select: 'name email phone' },
      { path: 'serviceProfile', select: 'serviceName pricing' }
    ]);

    // Send notification to artisan about new service profile booking
    try {
      console.log('Creating notification for artisan:', serviceProfileDoc.artisanId._id);
      console.log('Customer name:', customer.name);
      console.log('Service:', serviceProfileDoc.serviceName);
      
      const notification = await NotificationService.createNotification({
        recipient: serviceProfileDoc.artisanId._id,
        recipientRole: 'artisan',
        sender: req.user.id,
        senderRole: 'customer',
        title: 'New Service Profile Booking!',
        message: `You have received a new ${serviceProfileDoc.serviceName} booking from ${customer.name}. Estimated duration: ${estimatedDuration} hours. Total: ₦${totalAmount.toLocaleString()}`,
        type: 'info',
        category: 'job_status',
        important: true,
        data: {
          bookingId: booking._id,
          serviceProfileId: serviceProfile,
          serviceName: serviceProfileDoc.serviceName,
          customerName: customer.name,
          date: date,
          time: time,
          totalAmount: totalAmount,
          estimatedDuration: estimatedDuration
        }
      });
      
      console.log('Notification created successfully:', notification._id);
    } catch (notificationError) {
      console.error('Error sending service profile booking notification to artisan:', notificationError);
      // Don't fail the booking creation if notification fails
    }
    
    res.status(201).json(populatedBooking);
  } catch (err) {
    console.error("Create service profile booking error:", err);
    console.error("Error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    res.status(500).json({ 
      message: "Server error during service profile booking creation",
      error: err.message 
    });
  }
};

// Get service profile bookings for the logged-in customer
exports.getMyServiceProfileBookings = async (req, res) => {
  try {
    const bookings = await ServiceProfileBooking.find({ customer: req.user.id })
      .populate("artisan", "name email")
      .populate("serviceProfile", "serviceName pricing")
      .populate("customer", "name email phone")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error("Get my service profile bookings error:", err.message);
    res.status(500).json({ message: "Server error while fetching service profile bookings" });
  }
};

// Get service profile bookings for the authenticated artisan
exports.getArtisanServiceProfileBookings = async (req, res) => {
  try {
    const artisanId = req.user.id;
    const bookings = await ServiceProfileBooking.find({ artisan: artisanId })
      .populate("customer", "name email phone")
      .populate("serviceProfile", "serviceName pricing")
      .populate("artisan", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Get artisan service profile bookings error:", err.message);
    res.status(500).json({ message: "Server error while fetching artisan service profile bookings" });
  }
};

// Get a single service profile booking by ID
exports.getServiceProfileBookingById = async (req, res) => {
  try {
    const booking = await ServiceProfileBooking.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("artisan", "name email")
      .populate("serviceProfile", "serviceName pricing serviceArea");

    if (!booking) {
      return res.status(404).json({ message: "Service profile booking not found" });
    }

    // Ensure only involved customer/artisan or admin can view
    if (
      booking.customer._id.toString() !== req.user.id &&
      booking.artisan._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized to view this service profile booking" });
    }

    res.json(booking);
  } catch (err) {
    console.error("Get service profile booking by ID error:", err.message);
    res.status(500).json({ message: "Server error while fetching service profile booking" });
  }
};

// Update service profile booking status
exports.updateServiceProfileBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!["Pending", "Accepted", "Declined", "In Progress", "Pending Confirmation", "Completed", "Cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    let booking = await ServiceProfileBooking.findById(id)
      .populate("customer", "name email phone")
      .populate("artisan", "name email")
      .populate("serviceProfile", "serviceName pricing");

    if (!booking) {
      return res.status(404).json({ message: "Service profile booking not found" });
    }

    // Only the assigned artisan or an admin can update status
    if (booking.artisan._id.toString() !== userId && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to update this service profile booking" });
    }

    // Validate status transitions for artisans
    if (userRole === 'artisan') {
      const currentStatus = booking.status;
      const validTransitions = {
        'Pending': ['Accepted', 'Declined'],
        'Accepted': ['In Progress', 'Pending Confirmation', 'Cancelled'],
        'In Progress': ['Completed', 'Pending Confirmation'],
        'Pending Confirmation': ['Completed', 'In Progress'],
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
    }

    // Update status and timestamps
    booking.status = status;
    const now = new Date();
    
    switch (status) {
      case 'Accepted':
        booking.acceptedAt = now;
        break;
      case 'In Progress':
        booking.startedAt = now;
        break;
      case 'Pending Confirmation':
        // No specific timestamp for pending confirmation
        break;
      case 'Completed':
        booking.completedAt = now;
        break;
      case 'Cancelled':
        booking.cancelledAt = now;
        break;
    }

    await booking.save();

    // Send notifications
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
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
      // Don't fail the status update if notifications fail
    }

    res.json(booking);
  } catch (err) {
    console.error("Update service profile booking status error:", err.message);
    res.status(500).json({ message: "Server error while updating service profile booking status" });
  }
};

// Delete service profile booking (only by customer or admin)
exports.deleteServiceProfileBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const booking = await ServiceProfileBooking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Service profile booking not found" });
    }

    // Only the customer who created it or an admin can delete
    if (booking.customer.toString() !== userId && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to delete this service profile booking" });
    }

    await ServiceProfileBooking.findByIdAndDelete(id);
    res.json({ message: "Service profile booking deleted successfully" });
  } catch (err) {
    console.error("Delete service profile booking error:", err.message);
    res.status(500).json({ message: "Server error while deleting service profile booking" });
  }
};
