const express = require("express");
const router = express.Router();
const {
  getCurrentArtisanProfile,
  updateSubscription,
  updateArtisanProfile,
  getArtisans,
  suggestArtisansByLocation,
  getArtisanBookings, // Import getArtisanBookings
  getArtisanById, // Import getArtisanById
} = require("../controllers/artisanController");
const auth = require("../middleware/auth");

// Artisan routes
router.get("/me", auth, getCurrentArtisanProfile);
router.put("/me/profile", auth, updateArtisanProfile); // New route for artisan profile update
router.put("/subscription", auth, updateSubscription);
router.get("/", getArtisans);
router.get("/suggest-by-location", auth, suggestArtisansByLocation);
router.get("/:id", getArtisanById); // New route to get artisan by ID
router.get("/me/bookings", auth, getArtisanBookings); // Route to get an artisan's bookings

module.exports = router;
