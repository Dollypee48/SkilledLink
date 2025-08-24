const express = require("express");
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  getArtisanBookings, // Import getArtisanBookings
} = require("../controllers/bookingController");
const auth = require("../middleware/auth");

// Create booking
router.post("/", auth, createBooking);

// Get all bookings for logged-in customer
router.get("/my", auth, getMyBookings);

// Get all bookings for logged-in artisan
router.get("/artisan", auth, getArtisanBookings); // New route for artisan's bookings

// Get booking by ID
router.get("/:id", auth, getBookingById);

// Update booking status
router.put("/:id/status", auth, updateBookingStatus);

// Delete booking
router.delete("/:id", auth, deleteBooking);

module.exports = router;
