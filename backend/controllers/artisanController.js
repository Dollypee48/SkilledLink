const User = require("../models/User");
const ArtisanProfile = require("../models/ArtisanProfile");
const jwt = require("jsonwebtoken");
const Booking = require("../models/Booking"); // Import the Booking model

const ROLES = ["customer", "artisan", "admin"];

// Get current artisan profile
exports.getCurrentArtisanProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("artisanProfile", "-userId -__v")
      .select("-password");

    if (!user || user.role !== "artisan") {
      return res.status(404).json({ message: "Artisan profile not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update artisan subscription (free/premium)
exports.updateSubscription = async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!["free", "premium"].includes(subscription)) {
      return res.status(400).json({ message: "Invalid subscription type" });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== "artisan") {
      return res.status(403).json({ message: "Only artisans can update subscription" });
    }

    const artisan = await ArtisanProfile.findOneAndUpdate(
      { userId: user._id },
      { subscription },
      { new: true }
    );

    if (!artisan) return res.status(404).json({ message: "Artisan profile not found" });

    res.json({ message: "Subscription updated", artisan });
  } catch (err) {
    console.error("Subscription error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get artisans (with search & filters)
exports.getArtisans = async (req, res) => {
  try {
    const { search, location, service } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { skills: { $regex: search, $options: "i" } },
        { service: { $regex: search, $options: "i" } },
      ];
    }
    if (location) query.location = { $regex: location, $options: "i" };
    if (service) query.service = { $regex: service, $options: "i" };

    const artisans = await ArtisanProfile.find(query)
      .populate("userId", "name role")
      .select("-__v");

    const result = artisans.map((ap) => ({
      _id: ap.userId._id,
      name: ap.userId.name,
      role: "Artisan",
      skills: ap.skills.length ? ap.skills : ["Unknown"],
      service: ap.service || "Unknown",
      location: ap.location || "Unknown",
      rating: ap.rating || 0,
    }));

    res.json(result);
  } catch (err) {
    console.error("Get artisans error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Suggest artisans based on user location
exports.suggestArtisansByLocation = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("state");
    if (!user || !user.state) {
      return res.status(400).json({ message: "User location not available" });
    }

    const artisans = await ArtisanProfile.find({
      location: { $regex: user.state, $options: "i" },
    })
      .populate("userId", "name role")
      .limit(5);

    const suggestions = artisans.map((ap) => ({
      _id: ap.userId._id,
      name: ap.userId.name,
      role: "Artisan",
      skills: ap.skills.length ? ap.skills : ["Unknown"],
      service: ap.service || "Unknown",
      location: ap.location || "Unknown",
      rating: ap.rating || 0,
    }));

    res.json({ message: "Suggested artisans", suggestions });
  } catch (err) {
    console.error("Suggestion error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get bookings for current artisan
exports.getArtisanBookings = async (req, res) => {
  try {
    const artisanId = req.user.id; // User ID from authenticated token
    const bookings = await Booking.find({ artisan: artisanId }).populate("customer", "name email"); // Assuming 'artisan' field in Booking model
    res.json(bookings);
  } catch (err) {
    console.error("Get artisan bookings error:", err.message);
    res.status(500).json({ message: "Server error while fetching bookings" });
  }
};
