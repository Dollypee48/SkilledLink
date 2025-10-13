const User = require("../models/User");
const ArtisanProfile = require("../models/ArtisanProfile");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { uploadFile } = require("../utils/cloudinary");
const { generateOTP, sendVerificationEmailAsync, sendPasswordResetOTPAsync } = require("../utils/asyncEmailService");
const { checkProfileCompletion, getProfileCompletionMessage } = require("../utils/profileCompletion");

const ROLES = ["customer", "artisan", "admin"];

// Helper: Generate access & refresh tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
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
    .select('-password -refreshToken');
  return user;
};

// Performance monitoring helper
const logPerformance = (operation, startTime, additionalData = {}) => {
  const duration = Date.now() - startTime;
  console.log(`⏱️  ${operation} completed in ${duration}ms`, additionalData);
  return duration;
};

// OPTIMIZED REGISTER - Asynchronous email sending
exports.register = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { name, email, password, role } = req.body;

    // Basic validation
    if (!name || !email || !password) {
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

    // Generate verification code
    const verificationCode = generateOTP();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user with minimal required fields
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone: '',
      nationality: '',
      address: '',
      kycVerified: false,
      isVerified: false,
      verificationCode,
      verificationCodeExpires,
      jobAcceptance: {
        acceptedJobs: 0,
        maxJobs: role === 'artisan' ? 3 : 0,
        resetDate: new Date()
      }
    });

    // If artisan, create basic profile
    if (role === "artisan") {
      const profile = await ArtisanProfile.create({ 
        userId: user._id, 
        service: '',
        bio: '',
        experience: '',
        hourlyRate: 0,
        availability: true,
        skills: [],
        portfolio: [],
        certifications: [],
        reviews: [],
        rating: 0,
        totalJobs: 0,
        completedJobs: 0,
        location: {
          state: '',
          city: '',
          address: ''
        }
      });
      user.artisanProfile = profile._id;
      await user.save();
    }

    // Send verification email ASYNCHRONOUSLY (non-blocking)
    const emailResult = sendVerificationEmailAsync(email, verificationCode, name);
    
    console.log(`📧 Verification email queued: ${emailResult.emailId}`);

    // Get populated user for response
    const populatedUser = await getPopulatedUser(user._id);
    
    // Remove sensitive fields from response
    const safeUser = {
      ...populatedUser.toObject(),
      password: undefined,
      verificationCode: undefined,
      verificationCodeExpires: undefined,
    };

    // Log performance
    logPerformance('User Registration', startTime, {
      userId: user._id,
      email: user.email,
      role: user.role,
      emailQueued: emailResult.emailId
    });

    res.status(201).json({
      message: "Registration successful. Please check your email to verify your account.",
      user: safeUser,
      emailQueued: true,
      emailId: emailResult.emailId,
      requiresVerification: true,
    });

  } catch (err) {
    console.error("❌ Register error:", err);
    console.error("❌ Error details:", {
      message: err.message,
      name: err.name,
      code: err.code,
      keyValue: err.keyValue,
      errors: err.errors
    });
    
    // Handle specific MongoDB errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({ 
        message: `${field} already exists. Please use a different ${field}.` 
      });
    }
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: "Validation error", 
        errors: errors 
      });
    }
    
    res.status(500).json({ 
      message: "Server error during registration",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// OPTIMIZED LOGIN
exports.login = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { email, password, role } = req.body;
    
    console.log('🔍 Backend received:', { email, role, passwordLength: password ? password.length : 0 });

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    console.log('✅ User found:', { email: user.email, role: user.role });

    // Check if email is verified
    if (!user.isVerified) {
      console.log('❌ Email not verified:', email);
      return res.status(403).json({ 
        message: "Please verify your email address before logging in. Check your email for verification link.",
        requiresVerification: true,
        email: user.email
      });
    }

    // If a role is provided and the user is not an admin, check if it matches the user's role in the database
    if (role && user.role !== "admin" && user.role !== role) {
      console.log('❌ Role mismatch:', { requestedRole: role, userRole: user.role });
      return res.status(403).json({ message: `Access denied. You are registered as a ${user.role}.` });
    }
    
    console.log('✅ Role check passed');

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('❌ Password mismatch for user:', email);
      return res.status(401).json({ message: "Invalid password" });
    }
    
    console.log('✅ Password check passed for user:', email);

    // Tokens
    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    const populatedUser = await getPopulatedUser(user._id);
    
    // Check profile completion
    const profileCompletion = checkProfileCompletion(populatedUser);
    const profileMessage = getProfileCompletionMessage(profileCompletion, user.role);

    // Log performance
    logPerformance('User Login', startTime, {
      userId: user._id,
      email: user.email,
      role: user.role
    });

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: populatedUser,
      profileCompletion: {
        ...profileCompletion,
        message: profileMessage
      }
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ message: "Server error during login" });
  }
};

// OPTIMIZED RESEND VERIFICATION EMAIL
exports.resendVerificationEmail = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { email } = req.body;

    console.log('🔄 Resend verification request for email:', email);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(404).json({ message: "User not found" });
    }

    console.log('👤 User found:', { email: user.email, isVerified: user.isVerified });

    // Check if already verified
    if (user.isVerified) {
      console.log('✅ User already verified');
      return res.status(400).json({ 
        message: "Email is already verified",
        success: false 
      });
    }

    // Generate new verification code
    const verificationCode = generateOTP();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('🔐 Generated new verification code:', verificationCode);

    // Update user with new code using updateOne to avoid validation issues
    await User.updateOne(
      { _id: user._id },
      {
        verificationCode: verificationCode,
        verificationCodeExpires: verificationCodeExpires
      }
    );

    console.log('💾 User updated with new verification code');

    // Send verification email ASYNCHRONOUSLY
    console.log('📧 Attempting to queue verification email...');
    const emailResult = sendVerificationEmailAsync(email, verificationCode, user.name);
    
    console.log('📧 Email queued:', emailResult.emailId);
    
    // Log performance
    logPerformance('Resend Verification Email', startTime, {
      userId: user._id,
      email: user.email,
      emailQueued: emailResult.emailId
    });

    res.json({
      message: "Verification email has been queued for sending!",
      success: true,
      email: user.email,
      emailId: emailResult.emailId
    });

  } catch (err) {
    console.error("❌ Resend verification error:", err.message);
    res.status(500).json({ 
      message: "Server error during resend verification",
      success: false 
    });
  }
};

// OPTIMIZED FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if email exists or not
      return res.json({ 
        message: "If an account with that email exists, a password reset code has been sent.",
        success: true 
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({ 
        message: "Please verify your email address before resetting your password.",
        requiresVerification: true,
        email: user.email
      });
    }

    // Generate 6-digit OTP
    const resetCode = generateOTP();
    const resetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save reset code and expiry to user
    user.resetCode = resetCode;
    user.resetCodeExpiry = resetCodeExpiry;
    await user.save();

    // Send OTP email ASYNCHRONOUSLY
    const emailResult = sendPasswordResetOTPAsync(email, resetCode, user.name);
    
    console.log(`📧 Password reset email queued: ${emailResult.emailId}`);

    // Log performance
    logPerformance('Forgot Password', startTime, {
      userId: user._id,
      email: user.email,
      emailQueued: emailResult.emailId
    });

    res.json({ 
      message: "Password reset code has been queued for sending to your email.",
      success: true,
      emailId: emailResult.emailId
    });

  } catch (err) {
    console.error("❌ Forgot password error:", err.message);
    res.status(500).json({ 
      message: "Server error during forgot password",
      success: false 
    });
  }
};

// Keep other methods the same but add performance logging
exports.refreshToken = async (req, res) => {
  const startTime = Date.now();
  
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

    logPerformance('Token Refresh', startTime, { userId: user._id });

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
      user: populatedUser,
    });
  } catch (err) {
    console.error("❌ Refresh error:", err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token has expired. Please log in again.' });
    }
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

// Keep other methods unchanged...
exports.verifyEmailWithCode = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ 
        message: "Email and verification code are required",
        success: false 
      });
    }

    // Find user with valid verification code
    const user = await User.findOne({
      email: email.toLowerCase(),
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() }
    });

    if (!user) {
      // Check if user exists with this code but expired
      const expiredUser = await User.findOne({ 
        email: email.toLowerCase(),
        verificationCode: code 
      });
      
      if (expiredUser) {
        return res.status(400).json({ 
          message: "Verification code has expired. Please request a new one.",
          success: false 
        });
      } else {
        return res.status(400).json({ 
          message: "Invalid verification code or email",
          success: false 
        });
      }
    }

    // Mark email as verified
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    logPerformance('Email Verification', startTime, { userId: user._id, email: user.email });

    res.json({
      message: "Email verified successfully! You can now log in.",
      success: true,
      email: user.email
    });

  } catch (err) {
    console.error("❌ Email verification error:", err.message);
    res.status(500).json({ 
      message: "Server error during email verification",
      success: false 
    });
  }
};

// Keep other methods unchanged...
exports.updateProfile = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const userId = req.user.id;
    const { name, phone, address, nationality, state, occupation, service, bio, experience, skills, profileImage, role } = req.body;
    
    console.log('Update Profile - Received data:', { name, phone, address, nationality, state, occupation, service, bio, experience, skills, role });

    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update basic user fields
    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.nationality = nationality || user.nationality;
    user.state = state || user.state;
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
    if (role === 'artisan') {
      console.log('Updating artisan profile for user:', userId);
      let artisanProfile = await ArtisanProfile.findOne({ userId: user._id });

      if (artisanProfile) {
        console.log('Found existing artisan profile:', artisanProfile._id);
        console.log('Updating with data:', { service, bio, experience, skills });
        
        artisanProfile.service = service || artisanProfile.service;
        artisanProfile.bio = bio || artisanProfile.bio;
        artisanProfile.experience = experience || artisanProfile.experience;
        // Handle skills - convert string to array if needed
        if (skills) {
          artisanProfile.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(s => s);
        }
        await artisanProfile.save();
        console.log('Artisan profile updated successfully');
        
        // Update user's artisanProfile reference
        user.artisanProfile = artisanProfile._id;
        await user.save();
      } else {
        // Create artisan profile if it doesn't exist
        console.log("Creating new artisan profile for user:", userId);
        artisanProfile = await ArtisanProfile.create({
          userId: user._id,
          service: service || '',
          bio: bio || '',
          experience: experience || '',
          skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()).filter(s => s) : []),
          hourlyRate: 0,
          availability: true,
          portfolio: [],
          certifications: [],
          reviews: [],
          rating: 0,
          totalJobs: 0,
          completedJobs: 0,
          earnings: 0,
          subscription: 'free'
        });
        
        // Update user's artisanProfile reference
        user.artisanProfile = artisanProfile._id;
        await user.save();
      }
    }

    // Return the updated user with populated artisan profile
    const updatedUser = await getPopulatedUser(user._id);

    // Check profile completion after update
    const profileCompletion = checkProfileCompletion(updatedUser);
    const profileMessage = getProfileCompletionMessage(profileCompletion, updatedUser.role);

    logPerformance('Profile Update', startTime, { userId: user._id });

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
      profileCompletion: {
        ...profileCompletion,
        message: profileMessage
      }
    });

  } catch (err) {
    console.error("❌ Update profile error:", err.message);
    res.status(500).json({ message: "Server error during profile update" });
  }
};

// Keep other methods unchanged...
exports.changePassword = async (req, res) => {
  const startTime = Date.now();
  
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

    logPerformance('Password Change', startTime, { userId: user._id });

    res.json({
      message: "Password changed successfully"
    });

  } catch (err) {
    console.error("❌ Change password error:", err.message);
    res.status(500).json({ message: "Server error during password change" });
  }
};

exports.verifyResetCode = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { email, resetCode } = req.body;

    // Validate input
    if (!email || !resetCode) {
      return res.status(400).json({ 
        message: "Email and reset code are required" 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        message: "Invalid email or reset code" 
      });
    }

    // Check if reset code exists and is not expired
    if (!user.resetCode || !user.resetCodeExpiry) {
      return res.status(400).json({ 
        message: "No password reset request found. Please request a new reset code." 
      });
    }

    if (new Date() > user.resetCodeExpiry) {
      // Clear expired reset code
      user.resetCode = null;
      user.resetCodeExpiry = null;
      await user.save();
      
      return res.status(400).json({ 
        message: "Reset code has expired. Please request a new one." 
      });
    }

    // Verify reset code
    if (user.resetCode !== resetCode) {
      return res.status(400).json({ 
        message: "Invalid reset code" 
      });
    }

    logPerformance('Reset Code Verification', startTime, { userId: user._id });

    res.json({
      message: "Verification code is valid. You can now set your new password.",
      success: true
    });

  } catch (err) {
    console.error("❌ Verify reset code error:", err.message);
    res.status(500).json({ 
      message: "Server error during code verification",
      success: false 
    });
  }
};

exports.resetPassword = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { email, resetCode, newPassword } = req.body;

    // Validate input
    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ 
        message: "Email, reset code, and new password are required" 
      });
    }

    // Password validation
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        message: "Invalid email or reset code" 
      });
    }

    // Check if reset code exists and is not expired
    if (!user.resetCode || !user.resetCodeExpiry) {
      return res.status(400).json({ 
        message: "No password reset request found. Please request a new reset code." 
      });
    }

    if (new Date() > user.resetCodeExpiry) {
      // Clear expired reset code
      user.resetCode = null;
      user.resetCodeExpiry = null;
      await user.save();
      
      return res.status(400).json({ 
        message: "Reset code has expired. Please request a new one." 
      });
    }

    // Verify reset code
    if (user.resetCode !== resetCode) {
      return res.status(400).json({ 
        message: "Invalid reset code" 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password and clear reset code
    user.password = hashedPassword;
    user.resetCode = null;
    user.resetCodeExpiry = null;
    await user.save();

    logPerformance('Password Reset', startTime, { userId: user._id });

    res.json({
      message: "Password has been reset successfully. You can now log in with your new password.",
      success: true
    });

  } catch (err) {
    console.error("❌ Reset password error:", err.message);
    res.status(500).json({ 
      message: "Server error during password reset",
      success: false 
    });
  }
};

// Legacy method for backward compatibility
exports.verifyEmail = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { token } = req.params;
    
    console.log('🔍 Verification attempt with token:', token);
    console.log('🔍 Current time:', new Date().toISOString());
    console.log('🔍 Token length:', token ? token.length : 'undefined');

    // Find user with valid verification token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    console.log('🔍 User found:', user ? { email: user.email, isVerified: user.isVerified, tokenExpires: user.verificationTokenExpires } : 'No user found');

    if (!user) {
      // Let's also check if user exists with this token but expired
      const expiredUser = await User.findOne({ verificationToken: token });
      if (expiredUser) {
        console.log('❌ Token found but expired:', { 
          email: expiredUser.email, 
          expires: expiredUser.verificationTokenExpires,
          currentTime: new Date(),
          isExpired: expiredUser.verificationTokenExpires < Date.now()
        });
      } else {
        console.log('❌ No user found with this token');
      }
      
      return res.status(400).json({ 
        message: "Invalid or expired verification token",
        success: false 
      });
    }

    // Mark email as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    console.log('✅ Email verified for user:', user.email);

    logPerformance('Email Verification (Token)', startTime, { userId: user._id, email: user.email });

    res.json({
      message: "Email verified successfully! You can now log in.",
      success: true,
      email: user.email
    });

  } catch (err) {
    console.error("❌ Email verification error:", err.message);
    res.status(500).json({ 
      message: "Server error during email verification",
      success: false 
    });
  }
};
