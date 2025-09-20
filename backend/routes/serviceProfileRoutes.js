const express = require("express");
const router = express.Router();
const {
  getAllServiceProfiles,
  getServiceProfile
} = require("../controllers/serviceProfileController");

// Public routes for customers to browse service profiles
router.get("/", getAllServiceProfiles);
router.get("/:id", getServiceProfile);

module.exports = router;
