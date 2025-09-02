const User = require("../models/User");
const ArtisanProfile = require("../models/ArtisanProfile");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { uploadFile } = require("../utils/cloudinary"); // Import Cloudinary utility

const ROLES = ["customer", "artisan", "admin"];

// Helper: Generate access & refresh tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" } // Changed from "1h" to "8h"
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

// Helper: Get user details with populated artisan profile
const getPopulatedUser = async (userId) => {
  const user = await User.findById(userId)
    .populate({
      path: 'artisanProfile',
      model: 'ArtisanProfile',
    })
    .select('-password -refreshToken'); // Exclude sensitive fields
  return user;
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, nationality, state, address, occupation, service } = req.body;

    // Basic validation
    if (!name || !email || !password || !phone || !nationality || !state || !address) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    if (!ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be customer, artisan, or admin" });
    }

    // Check existing user
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      nationality,
      state,
      address,
      occupation,
      kycVerified: role === "customer", // auto verify customers
    });

    // If artisan, create profile
    if (role === "artisan") {
      const profile = await ArtisanProfile.create({ userId: user._id, service });
      user.artisanProfile = profile._id;
      await user.save();
    }

    // Tokens
    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    const populatedUser = await getPopulatedUser(user._id);

    res.status(201).json({
      message: "Registration successful",
      accessToken,
      refreshToken,
      user: populatedUser,
    });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // If a role is provided and the user is not an admin, check if it matches the user's role in the database
    if (role && user.role !== "admin" && user.role !== role) {
      return res.status(403).json({ message: `Access denied. You are registered as a ${user.role}.` });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid password" });

    // Tokens
    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    const populatedUser = await getPopulatedUser(user._id);

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: populatedUser,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error during login" });
  }
};

// REFRESH TOKEN
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findOne({ _id: payload.id, refreshToken });
    if (!user) return res.status(401).json({ message: "Invalid or expired refresh token" });

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    user.refreshToken = newRefreshToken;
    await user.save();

    const populatedUser = await getPopulatedUser(user._id);

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
      user: populatedUser,
    });
  } catch (err) {
    console.error("Refresh error:", err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token has expired. Please log in again.' });
    }
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // User ID from authenticated token
    const { name, phone, address, nationality, occupation, service, bio, experience, skills, profileImage, role } = req.body;

    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update basic user fields
    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.nationality = nationality || user.nationality;
    user.occupation = occupation || user.occupation;

    // Handle profile image upload/removal
    if (profileImage) {
      if (profileImage === 'REMOVE_IMAGE') {
        user.profileImageUrl = null;
      } else {
        // Handle new image data structure with type
        let imageData, fileType;
        if (typeof profileImage === 'object' && profileImage.data && profileImage.type) {
          // New structure: { data: base64, type: mimeType }
          imageData = profileImage.data;
          fileType = profileImage.type;
        } else {
          // Fallback for old structure (just base64 string)
          imageData = profileImage;
          fileType = 'image/jpeg'; // Default fallback
        }
        
        const result = await uploadFile(imageData, fileType, 'profile_images');
        user.profileImageUrl = result.secure_url;
      }
    }

    await user.save();

    // Update artisan profile if user is an artisan
    if (role === 'artisan' && user.artisanProfile) {
      let artisanProfile = await ArtisanProfile.findById(user.artisanProfile);

      if (artisanProfile) {
        artisanProfile.service = service || artisanProfile.service;
        artisanProfile.bio = bio || artisanProfile.bio;
        artisanProfile.experience = experience || artisanProfile.experience;
        artisanProfile.skills = skills || artisanProfile.skills; // skills should be an array
        await artisanProfile.save();
      } else {
        console.warn("Artisan profile not found for user:", userId);
      }
    }

    // Return the updated user with populated artisan profile
    const updatedUser = await getPopulatedUser(user._id);

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });

  } catch (err) {
    console.error("Update profile error:", err.message);
    res.status(500).json({ message: "Server error during profile update" });
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    // Find user and include password for comparison
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.json({
      message: "Password changed successfully"
    });

  } catch (err) {
    console.error("Change password error:", err.message);
    res.status(500).json({ message: "Server error during password change" });
  }
};
