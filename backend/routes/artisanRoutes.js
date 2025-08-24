const express = require("express");
const router = express.Router();
const {
  getCurrentArtisanProfile,
  updateSubscription,
  getArtisans,
  suggestArtisansByLocation,
  getArtisanBookings, // Import getArtisanBookings
} = require("../controllers/artisanController");
const auth = require("../middleware/auth");

// Artisan routes
router.get("/me", auth, getCurrentArtisanProfile);
router.get("/me/bookings", auth, getArtisanBookings); // New route for artisan bookings
router.put("/subscription", auth, updateSubscription);
router.get("/", getArtisans);
router.get("/suggest-by-location", auth, suggestArtisansByLocation);

module.exports = router;
