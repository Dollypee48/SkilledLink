const express = require("express");
const router = express.Router();
const {
  getCurrentArtisanProfile,
  updateSubscription,
  getArtisans,
  suggestArtisansByLocation,
} = require("../controllers/artisanController");
const auth = require("../middleware/auth");

// Artisan routes
router.get("/me", auth, getCurrentArtisanProfile);
router.put("/subscription", auth, updateSubscription);
router.get("/", getArtisans);
router.get("/suggest-by-location", auth, suggestArtisansByLocation);

module.exports = router;
