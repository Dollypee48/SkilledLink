const express = require("express");
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
} = require("../controllers/bookingController");
const auth = require("../middleware/auth");

// Create booking
router.post("/", auth, createBooking);

// Get all bookings for logged-in customer
router.get("/my", auth, getMyBookings);

// Get booking by ID
router.get("/:id", auth, getBookingById);

// Update booking status
router.put("/:id/status", auth, updateBookingStatus);

// Delete booking
router.delete("/:id", auth, deleteBooking);

module.exports = router;
