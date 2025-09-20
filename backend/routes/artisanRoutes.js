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
  updateEarnings, // Import updateEarnings
} = require("../controllers/artisanController");

const {
  getArtisanServiceProfiles,
  createServiceProfile,
  getServiceProfile,
  updateServiceProfile,
  deleteServiceProfile,
  toggleServiceProfileStatus,
  getServiceProfileStats
} = require("../controllers/serviceProfileController");
const auth = require("../middleware/auth");

// Artisan routes
router.get("/me", auth, getCurrentArtisanProfile);
router.put("/me/profile", auth, updateArtisanProfile); // New route for artisan profile update
router.put("/subscription", auth, updateSubscription);
router.put("/earnings", auth, updateEarnings); // New route for updating earnings
router.get("/", getArtisans);
router.get("/suggest-by-location", auth, suggestArtisansByLocation);
router.get("/:id", getArtisanById); // New route to get artisan by ID
router.get("/me/bookings", auth, getArtisanBookings); // Route to get an artisan's bookings

// Service Profile routes
router.get("/me/service-profiles", auth, getArtisanServiceProfiles);
router.post("/me/service-profiles", auth, createServiceProfile);
router.get("/service-profiles/:id", getServiceProfile);
router.put("/me/service-profiles/:id", auth, updateServiceProfile);
router.delete("/me/service-profiles/:id", auth, deleteServiceProfile);
router.patch("/me/service-profiles/:id/toggle", auth, toggleServiceProfileStatus);
router.get("/me/service-profiles/stats", auth, getServiceProfileStats);

module.exports = router;
