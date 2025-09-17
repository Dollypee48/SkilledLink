const Review = require("../models/Review");
const Booking = require("../models/Booking");
const ArtisanProfile = require("../models/ArtisanProfile");

// Create a review (only if booking is completed & belongs to customer)
exports.createReview = async (req, res) => {
  try {
    const { artisanId, rating, comment, bookingId } = req.body;

    console.log('Review creation request:', { artisanId, rating, comment, bookingId, userId: req.user.id });

    // Find the booking and validate it - allow reviews for both Completed and Pending Confirmation statuses
    const booking = await Booking.findOne({
      _id: bookingId,
      customer: req.user.id, // Use 'customer' field, not 'customerId'
      status: { $in: ["Completed", "Pending Confirmation"] }, // Allow both statuses
    });

    console.log('Found booking:', booking ? { id: booking._id, status: booking.status, customer: booking.customer } : 'No booking found');

    // If no booking found, let's check if it exists but with different criteria
    if (!booking) {
      const anyBooking = await Booking.findById(bookingId);
      console.log('Any booking found:', anyBooking ? { 
        id: anyBooking._id, 
        status: anyBooking.status, 
        customer: anyBooking.customer,
        customerType: typeof anyBooking.customer,
        userId: req.user.id,
        userIdType: typeof req.user.id,
        customerMatch: anyBooking.customer.toString() === req.user.id.toString()
      } : 'No booking found at all');
      
      return res.status(400).json({ 
        message: "Invalid or incomplete booking. Please ensure the booking is completed or pending confirmation and belongs to you." 
      });
    }

    // Additional validation - now allows both Completed and Pending Confirmation
    if (!["Completed", "Pending Confirmation"].includes(booking.status)) {
      return res.status(400).json({ 
        message: "Cannot review a booking that is not completed or pending confirmation. Current status: " + booking.status 
      });
    }

    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ 
        message: "You have already reviewed this booking" 
      });
    }

    const review = await Review.create({
      customerId: req.user.id,
      artisanId,
      bookingId,
      rating,
      comment,
    });

    // console.log('Review created successfully:', review);

    // Update artisan rating
    await updateArtisanRating(artisanId);

    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get all reviews by logged-in customer
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ customerId: req.user.id })
      .populate("artisanId", "name")
      .populate("bookingId", "service date");

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all reviews for an artisan (for artisan users)
exports.getArtisanReviews = async (req, res) => {
  try {
    // Check if user is an artisan
    if (req.user.role !== 'artisan') {
      return res.status(403).json({ message: "Only artisans can access this endpoint" });
    }

    const reviews = await Review.find({ artisanId: req.user.id })
      .populate("customerId", "name")
      .populate("bookingId", "service date")
      .sort({ date: -1 }); // Sort by date, newest first

    res.json(reviews);
  } catch (err) {
    console.error('Error fetching artisan reviews:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get public reviews for an artisan (no authentication required)
exports.getPublicArtisanReviews = async (req, res) => {
  try {
    const { artisanId } = req.params;

    if (!artisanId) {
      return res.status(400).json({ message: "Artisan ID is required" });
    }

    const reviews = await Review.find({ artisanId })
      .populate("customerId", "name")
      .populate("bookingId", "service date")
      .sort({ date: -1 }) // Sort by date, newest first
      .limit(10); // Limit to 10 most recent reviews for performance

    res.json(reviews);
  } catch (err) {
    console.error('Error fetching public artisan reviews:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, customerId: req.user.id },
      { rating, comment },
      { new: true }
    );

    if (!review) return res.status(404).json({ message: "Review not found" });

    res.json({ message: "Review updated", review });

    // Update artisan rating after review update
    await updateArtisanRating(review.artisanId);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper function to update artisan rating
async function updateArtisanRating(artisanId) {
  try {
    // Calculate average rating from all reviews
    const reviews = await Review.find({ artisanId });
    let averageRating = 0;
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      averageRating = totalRating / reviews.length;
    }

    // Update artisan profile with new rating
    await ArtisanProfile.findOneAndUpdate(
      { userId: artisanId },
      { rating: averageRating },
      { new: true }
    );

    // console.log(`Updated artisan ${artisanId} rating to ${averageRating}`);
  } catch (error) {
    console.error('Error updating artisan rating:', error);
  }
}

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      customerId: req.user.id
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Update artisan rating after review deletion
    await updateArtisanRating(review.artisanId);

    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
