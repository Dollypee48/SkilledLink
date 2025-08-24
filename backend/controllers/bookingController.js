const Booking = require("../models/Booking");
const User = require("../models/User"); // Import User model if not already

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { artisan, service, date, time, description, price } = req.body; // Added price
    const booking = await Booking.create({
      customer: req.user.id, // Use 'customer' field
      artisan,
      service,
      date,
      time,
      description,
      price, // Save price
      status: "Pending", // Initial status
    });
    res.status(201).json(booking);
  } catch (err) {
    console.error("Create booking error:", err.message);
    res.status(500).json({ message: "Server error during booking creation" });
  }
};

// Get bookings for the logged-in customer
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id }) // Use 'customer' field
      .populate("artisan", "name email"); // Populate artisan details
    res.json(bookings);
  } catch (err) {
    console.error("Get my bookings error:", err.message);
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
    console.error("Get artisan bookings error:", err.message);
    res.status(500).json({ message: "Server error while fetching artisan bookings" });
  }
};

// Get a single booking by ID (accessible by customer or artisan if involved)
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customer", "name email")
      .populate("artisan", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Ensure only involved customer/artisan or admin can view
    if (
      booking.customer.toString() !== req.user.id &&
      booking.artisan.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized to view this booking" });
    }

    res.json(booking);
  } catch (err) {
    console.error("Get booking by ID error:", err.message);
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

    if (!["Pending", "Accepted", "Declined", "Completed", "Cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    let booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only the assigned artisan or an admin can update status
    if (booking.artisan.toString() !== userId && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to update this booking" });
    }

    booking.status = status;
    await booking.save();

    res.json(booking);
  } catch (err) {
    console.error("Update booking status error:", err.message);
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
    console.error("Delete booking error:", err.message);
    res.status(500).json({ message: "Server error while deleting booking" });
  }
};
