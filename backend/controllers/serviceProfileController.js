const mongoose = require("mongoose");
const ServiceProfile = require("../models/ServiceProfile");
const User = require("../models/User");
const Review = require("../models/Review");
const ServiceProfileBooking = require("../models/ServiceProfileBooking");
const { uploadFile } = require("../utils/cloudinary");

// Helper function to calculate service profile statistics
const calculateServiceProfileStats = async (serviceProfileId) => {
  try {
    // Calculate rating and review count from reviews
    const reviews = await Review.find({ 
      serviceProfileId: serviceProfileId 
    });
    
    console.log(`Service Profile ${serviceProfileId} has ${reviews.length} reviews:`, reviews.map(r => ({ rating: r.rating, bookingType: r.bookingType, artisanId: r.artisanId })));
    
    let rating = 0;
    let reviewCount = reviews.length;
    
    if (reviewCount > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      rating = totalRating / reviewCount;
      console.log(`Calculated rating for service profile ${serviceProfileId}: ${rating} (${reviewCount} reviews)`);
    }
    
    // Calculate booking count and total earnings from service profile bookings
    const bookings = await ServiceProfileBooking.find({ 
      serviceProfileId: serviceProfileId 
    });
    
    const bookingCount = bookings.length;
    const totalEarnings = bookings.reduce((sum, booking) => {
      return sum + (booking.totalAmount || booking.amount || 0);
    }, 0);
    
    return {
      rating: Math.round(rating * 10) / 10, // Round to 1 decimal place
      reviewCount,
      bookingCount,
      totalEarnings
    };
  } catch (error) {
    console.error('Error calculating service profile stats:', error);
    return {
      rating: 0,
      reviewCount: 0,
      bookingCount: 0,
      totalEarnings: 0
    };
  }
};

// Get all service profiles for an artisan
exports.getArtisanServiceProfiles = async (req, res) => {
  try {
    const artisanId = req.user.id;
    
    const serviceProfiles = await ServiceProfile.find({ 
      artisanId
    }).sort({ createdAt: -1 });

    // Calculate statistics for each service profile
    const profilesWithStats = await Promise.all(
      serviceProfiles.map(async (profile) => {
        const stats = await calculateServiceProfileStats(profile._id);
        
        // Update the profile with calculated statistics
        profile.rating = stats.rating;
        profile.reviewCount = stats.reviewCount;
        profile.bookingCount = stats.bookingCount;
        profile.totalEarnings = stats.totalEarnings;
        
        return profile;
      })
    );

    res.json(profilesWithStats);
  } catch (err) {
    console.error("Get service profiles error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single service profile by ID
exports.getServiceProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const serviceProfile = await ServiceProfile.findById(id)
      .populate('artisanId', 'name email phone profileImageUrl state address kycVerified kycStatus nationality isPremium')
      .populate({
        path: 'artisanId',
        populate: {
          path: 'artisanProfile',
          select: 'skills service bio experience hourlyRate rating totalJobs completedJobs earnings availability portfolio certifications'
        }
      });

    if (!serviceProfile) {
      return res.status(404).json({ message: "Service profile not found" });
    }

    // Calculate statistics for this service profile
    const stats = await calculateServiceProfileStats(serviceProfile._id);
    
    // Update the profile with calculated statistics
    serviceProfile.rating = stats.rating;
    serviceProfile.reviewCount = stats.reviewCount;
    serviceProfile.bookingCount = stats.bookingCount;
    serviceProfile.totalEarnings = stats.totalEarnings;

    res.json(serviceProfile);
  } catch (err) {
    console.error("Get service profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new service profile
exports.createServiceProfile = async (req, res) => {
  try {
    const artisanId = req.user.id;
    const profileData = req.body;

    // Validate required fields
    const requiredFields = ['title', 'category', 'hourlyRate'];
    for (const field of requiredFields) {
      if (!profileData[field]) {
        return res.status(400).json({ 
          message: `${field} is required` 
        });
      }
    }

    // Check if artisan exists and is verified
    const artisan = await User.findById(artisanId);
    if (!artisan || artisan.role !== 'artisan') {
      return res.status(403).json({ 
        message: "Only verified artisans can create service profiles" 
      });
    }

    // Handle image uploads if provided
    if (profileData.images && profileData.images.length > 0) {
      const uploadedImages = [];
      for (const imageData of profileData.images) {
        try {
          const result = await uploadFile(imageData.data, imageData.type, 'service_profiles');
          uploadedImages.push(result.secure_url);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          // Continue with other images if one fails
        }
      }
      profileData.images = uploadedImages;
    }

    // Set pricing defaults
    if (!profileData.pricing) {
      profileData.pricing = {};
    }
    profileData.pricing.baseRate = profileData.hourlyRate;

    const serviceProfile = new ServiceProfile({
      ...profileData,
      artisanId
    });

    await serviceProfile.save();

    // Populate the response
    const populatedProfile = await ServiceProfile.findById(serviceProfile._id)
      .populate('artisanId', 'name email phone profileImageUrl state address');

    res.status(201).json({
      message: "Service profile created successfully",
      serviceProfile: populatedProfile
    });
  } catch (err) {
    console.error("Create service profile error:", err);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: "Validation error", 
        errors: errors 
      });
    }
    
    res.status(500).json({ message: "Server error" });
  }
};

// Update service profile
exports.updateServiceProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const artisanId = req.user.id;
    const updateData = req.body;

    const serviceProfile = await ServiceProfile.findOne({ 
      _id: id, 
      artisanId 
    });

    if (!serviceProfile) {
      return res.status(404).json({ 
        message: "Service profile not found or you don't have permission to update it" 
      });
    }

    // Handle image uploads if provided
    if (updateData.images && updateData.images.length > 0) {
      const uploadedImages = [];
      for (const imageData of updateData.images) {
        try {
          if (imageData.startsWith('http')) {
            // Already uploaded image
            uploadedImages.push(imageData);
          } else {
            // New image to upload
            const result = await uploadFile(imageData.data, imageData.type, 'service_profiles');
            uploadedImages.push(result.secure_url);
          }
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          // Continue with other images if one fails
        }
      }
      updateData.images = uploadedImages;
    }

    // Update pricing base rate if hourly rate changes
    if (updateData.hourlyRate && !updateData.pricing?.baseRate) {
      updateData.pricing = updateData.pricing || {};
      updateData.pricing.baseRate = updateData.hourlyRate;
    }

    Object.assign(serviceProfile, updateData);
    await serviceProfile.save();

    // Populate the response
    const populatedProfile = await ServiceProfile.findById(serviceProfile._id)
      .populate('artisanId', 'name email phone profileImageUrl state address');

    res.json({
      message: "Service profile updated successfully",
      serviceProfile: populatedProfile
    });
  } catch (err) {
    console.error("Update service profile error:", err);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: "Validation error", 
        errors: errors 
      });
    }
    
    res.status(500).json({ message: "Server error" });
  }
};

// Delete service profile
exports.deleteServiceProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const artisanId = req.user.id;

    console.log('Delete request - Profile ID:', id, 'Artisan ID:', artisanId);

    const serviceProfile = await ServiceProfile.findOne({ 
      _id: id, 
      artisanId 
    });

    if (!serviceProfile) {
      console.log('Service profile not found or permission denied');
      return res.status(404).json({ 
        message: "Service profile not found or you don't have permission to delete it" 
      });
    }

    console.log('Service profile found, proceeding with deletion');
    
    // Hard delete - actually remove the record
    await ServiceProfile.findByIdAndDelete(id);

    console.log('Service profile deleted successfully');
    res.json({ message: "Service profile deleted successfully" });
  } catch (err) {
    console.error("Delete service profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all active service profiles (for customers to browse)
exports.getAllServiceProfiles = async (req, res) => {
  try {
    const { 
      category, 
      minRate, 
      maxRate, 
      location, 
      search,
      sortBy = 'rating',
      page = 1,
      limit = 20
    } = req.query;

    const query = {};
    
    // Add filters
    if (category) {
      query.category = category;
    }
    
    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = parseInt(minRate);
      if (maxRate) query.hourlyRate.$lte = parseInt(maxRate);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    let sort = {};
    switch (sortBy) {
      case 'rating':
        sort = { rating: -1, reviewCount: -1 };
        break;
      case 'price_low':
        sort = { hourlyRate: 1 };
        break;
      case 'price_high':
        sort = { hourlyRate: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'popular':
        sort = { bookingCount: -1, rating: -1 };
        break;
      default:
        sort = { rating: -1, reviewCount: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const serviceProfiles = await ServiceProfile.find(query)
      .populate('artisanId', 'name email phone profileImageUrl state address kycVerified kycStatus nationality isPremium')
      .populate({
        path: 'artisanId',
        populate: {
          path: 'artisanProfile',
          select: 'skills service bio experience hourlyRate rating totalJobs completedJobs earnings availability portfolio certifications'
        }
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Calculate statistics for each service profile
    const profilesWithStats = await Promise.all(
      serviceProfiles.map(async (profile) => {
        const stats = await calculateServiceProfileStats(profile._id);
        
        // Update the profile with calculated statistics
        profile.rating = stats.rating;
        profile.reviewCount = stats.reviewCount;
        profile.bookingCount = stats.bookingCount;
        profile.totalEarnings = stats.totalEarnings;
        
        return profile;
      })
    );

    const total = await ServiceProfile.countDocuments(query);

    res.json({
      serviceProfiles: profilesWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: skip + profilesWithStats.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error("Get all service profiles error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Toggle service profile active status
exports.toggleServiceProfileStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const artisanId = req.user.id;

    const serviceProfile = await ServiceProfile.findOne({ 
      _id: id, 
      artisanId 
    });

    if (!serviceProfile) {
      return res.status(404).json({ 
        message: "Service profile not found or you don't have permission to update it" 
      });
    }

    serviceProfile.isActive = !serviceProfile.isActive;
    await serviceProfile.save();

    res.json({
      message: `Service profile ${serviceProfile.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: serviceProfile.isActive
    });
  } catch (err) {
    console.error("Toggle service profile status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get service profile statistics
exports.getServiceProfileStats = async (req, res) => {
  try {
    const artisanId = req.user.id;

    const stats = await ServiceProfile.aggregate([
      { $match: { artisanId: new mongoose.Types.ObjectId(artisanId) } },
      {
        $group: {
          _id: null,
          totalProfiles: { $sum: 1 },
          activeProfiles: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          totalBookings: { $sum: '$bookingCount' },
          totalEarnings: { $sum: '$totalEarnings' },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    const result = stats[0] || {
      totalProfiles: 0,
      activeProfiles: 0,
      totalBookings: 0,
      totalEarnings: 0,
      averageRating: 0
    };

    res.json(result);
  } catch (err) {
    console.error("Get service profile stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
