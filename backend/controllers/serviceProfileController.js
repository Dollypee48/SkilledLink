const mongoose = require("mongoose");
const ServiceProfile = require("../models/ServiceProfile");
const User = require("../models/User");
const { uploadFile } = require("../utils/cloudinary");

// Get all service profiles for an artisan
exports.getArtisanServiceProfiles = async (req, res) => {
  try {
    const artisanId = req.user.id;
    
    const serviceProfiles = await ServiceProfile.find({ 
      artisanId
    }).sort({ createdAt: -1 });

    res.json(serviceProfiles);
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
      .populate('artisanId', 'name email phone profileImageUrl state address kycVerified kycStatus nationality')
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
      .populate('artisanId', 'name email phone profileImageUrl state address kycVerified kycStatus nationality')
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

    const total = await ServiceProfile.countDocuments(query);

    res.json({
      serviceProfiles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: skip + serviceProfiles.length < total,
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
