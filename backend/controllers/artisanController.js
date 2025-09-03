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

    // Calculate actual rating from reviews
    let calculatedRating = 0;
    let reviewCount = 0;
    
    try {
      const Review = require("../models/Review");
      const reviews = await Review.find({ artisanId: user._id });
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
        calculatedRating = totalRating / reviews.length;
        reviewCount = reviews.length;
      }
    } catch (error) {
      console.error('Error calculating rating for artisan:', user._id, error);
    }

    // Update the artisanProfile with calculated rating
    if (user.artisanProfile) {
      user.artisanProfile.rating = calculatedRating;
      user.artisanProfile.reviewCount = reviewCount;
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

// Update artisan profile (including skills, service, location)
exports.updateArtisanProfile = async (req, res) => {
  try {
    const { skills, service, location, availability, bio, experience } = req.body;

    const user = await User.findById(req.user.id);
    if (!user || user.role !== "artisan") {
      return res.status(403).json({ message: "Only artisans can update their profile" });
    }

    const artisanProfile = await ArtisanProfile.findOneAndUpdate(
      { userId: user._id },
      { skills, service, location, availability, bio, experience },
      { new: true }
    );

    if (!artisanProfile) {
      return res.status(404).json({ message: "Artisan profile not found" });
    }

    res.json({ message: "Artisan profile updated successfully", artisanProfile });
  } catch (err) {
    console.error("Update artisan profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get artisans (with search & filters)
exports.getArtisans = async (req, res) => {
  try {
    const { search, location, service } = req.query;

    let query = { availability: true }; // Filter only available artisans by default
    if (search) {
      query.$or = [
        { skills: { $regex: search, $options: "i" } },
        { service: { $regex: search, $options: "i" } },
      ];
    }
    if (location) query.location = { $regex: location, $options: "i" };
    if (service) query.service = { $regex: service, $options: "i" };

    const artisans = await ArtisanProfile.find(query)
      .populate("userId", "name email phone role profileImageUrl state address nationality kycVerified kycStatus") // Include all necessary user fields
      .select("-__v");

    // Import Review model to calculate ratings
    const Review = require("../models/Review");

    const result = await Promise.all(artisans.map(async (ap) => {
      if (!ap.userId) {
        console.warn("Skipping artisan profile due to null userId:", ap._id);
        return null; // Skip if userId is null (user might have been deleted)
      }
      
      // Calculate actual rating from reviews
      let calculatedRating = 0;
      let reviewCount = 0;
      
      try {
        const reviews = await Review.find({ artisanId: ap.userId._id });
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
          calculatedRating = totalRating / reviews.length;
          reviewCount = reviews.length;
        }
      } catch (error) {
        console.error('Error calculating rating for artisan:', ap.userId._id, error);
      }
      
      return {
        _id: ap.userId._id,
        name: ap.userId.name,
        email: ap.userId.email || "",
        phone: ap.userId.phone || "",
        role: "Artisan",
        skills: ap.skills.length ? ap.skills : ["Unknown"],
        service: ap.service || "Unknown",
        location: ap.location || "Unknown",
        rating: calculatedRating,
        reviewCount: reviewCount,
        bio: ap.bio || "", // Include bio
        experience: ap.experience || "", // Include experience
        availability: ap.availability, // Include availability in the response
        profileImageUrl: ap.userId.profileImageUrl || "", // Include profile image URL
        state: ap.userId.state || "", // Include user's state
        address: ap.userId.address || "", // Include user's address
        nationality: ap.userId.nationality || "", // Include nationality
        kycVerified: ap.userId.kycVerified || false, // Include KYC verification status
        kycStatus: ap.userId.kycStatus || "pending", // Include KYC status
        // Include artisanProfile data for nested access
        artisanProfile: {
          skills: ap.skills.length ? ap.skills : ["Unknown"],
          service: ap.service || "Unknown",
          bio: ap.bio || "",
          experience: ap.experience || "",
          rating: calculatedRating,
          reviewCount: reviewCount,
          availability: ap.availability
        }
      };
    }));
    
    // Filter out null entries
    const filteredResult = result.filter(Boolean);

    res.json(filteredResult);
  } catch (err) {
    console.error("Get artisans error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single artisan by ID
exports.getArtisanById = async (req, res) => {
  try {
    const artisanProfile = await ArtisanProfile.findById(req.params.id)
      .populate("userId", "name email phone profileImageUrl state address nationality kycVerified kycStatus") // Include all necessary user fields
      .select("-__v");

    if (!artisanProfile) {
      return res.status(404).json({ message: "Artisan not found" });
    }

    // Calculate actual rating from reviews
    let calculatedRating = 0;
    let reviewCount = 0;
    
    try {
      const Review = require("../models/Review");
      const reviews = await Review.find({ artisanId: artisanProfile.userId._id });
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
        calculatedRating = totalRating / reviews.length;
        reviewCount = reviews.length;
      }
    } catch (error) {
      console.error('Error calculating rating for artisan:', artisanProfile.userId._id, error);
    }

    // Restructure the response to be consistent with getArtisans
    const result = {
      _id: artisanProfile.userId._id,
      name: artisanProfile.userId.name,
      email: artisanProfile.userId.email || "",
      phone: artisanProfile.userId.phone || "",
      role: "Artisan",
      skills: artisanProfile.skills.length ? artisanProfile.skills : ["Unknown"],
      service: artisanProfile.service || "Unknown",
      location: artisanProfile.location || "Unknown",
      rating: calculatedRating,
      reviewCount: reviewCount,
      bio: artisanProfile.bio || "",
      experience: artisanProfile.experience || "",
      availability: artisanProfile.availability,
      profileImageUrl: artisanProfile.userId.profileImageUrl || "",
      state: artisanProfile.userId.state || "", // Include user's state
      address: artisanProfile.userId.address || "", // Include user's address
      nationality: artisanProfile.userId.nationality || "", // Include nationality
      kycVerified: artisanProfile.userId.kycVerified || false, // Include KYC verification status
      kycStatus: artisanProfile.userId.kycStatus || "pending", // Include KYC status
      // Include artisanProfile data for nested access
      artisanProfile: {
        skills: artisanProfile.skills.length ? artisanProfile.skills : ["Unknown"],
        service: artisanProfile.service || "Unknown",
        bio: artisanProfile.bio || "",
        experience: artisanProfile.experience || "",
        rating: calculatedRating,
        reviewCount: reviewCount,
        availability: artisanProfile.availability
      }
    };

    res.json(result);
  } catch (err) {
    console.error("Get artisan by ID error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Suggest artisans based on user location
exports.suggestArtisansByLocation = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("state address");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // If user doesn't have location, return empty suggestions instead of error
    if (!user.state && !user.address) {
      return res.json({ message: "No location-based suggestions available", suggestions: [] });
    }

    const artisans = await ArtisanProfile.find({
      location: { $regex: user.state, $options: "i" },
    })
      .populate("userId", "name email phone role profileImageUrl state address nationality kycVerified kycStatus") // Include all necessary user fields
      .limit(5);

    // Import Review model to calculate ratings
    const Review = require("../models/Review");

    const suggestions = await Promise.all(artisans.map(async (ap) => {
      if (!ap.userId) {
        console.warn("Skipping suggested artisan profile due to null userId:", ap._id);
        return null;
      }

      // Calculate actual rating from reviews
      let calculatedRating = 0;
      let reviewCount = 0;
      
      try {
        const reviews = await Review.find({ artisanId: ap.userId._id });
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
          calculatedRating = totalRating / reviews.length;
          reviewCount = reviews.length;
        }
      } catch (error) {
        console.error('Error calculating rating for suggested artisan:', ap.userId._id, error);
      }

      return {
        _id: ap.userId._id,
        name: ap.userId.name,
        email: ap.userId.email || "",
        phone: ap.userId.phone || "",
        role: "Artisan",
        skills: ap.skills.length ? ap.skills : ["Unknown"],
        service: ap.service || "Unknown",
        location: ap.location || "Unknown",
        rating: calculatedRating,
        reviewCount: reviewCount,
        bio: ap.bio || "",
        experience: ap.experience || "",
        availability: ap.availability,
        profileImageUrl: ap.userId.profileImageUrl || "",
        state: ap.userId.state || "", // Include user's state
        address: ap.userId.address || "", // Include user's address
        nationality: ap.userId.nationality || "", // Include nationality
        kycVerified: ap.userId.kycVerified || false, // Include KYC verification status
        kycStatus: ap.userId.kycStatus || "pending", // Include KYC status
        // Include artisanProfile data for nested access
        artisanProfile: {
          skills: ap.skills.length ? ap.skills : ["Unknown"],
          service: ap.service || "Unknown",
          bio: ap.bio || "",
          experience: ap.experience || "",
          rating: calculatedRating,
          reviewCount: reviewCount,
          availability: ap.availability
        }
      };
    }));
    
    // Filter out null entries
    const filteredSuggestions = suggestions.filter(Boolean);

    res.json({ message: "Suggested artisans", suggestions: filteredSuggestions });
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
