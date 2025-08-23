const Review = require("../models/Review");
const Booking = require("../models/Booking");

// Create a review (only if booking is completed & belongs to customer)
exports.createReview = async (req, res) => {
  try {
    const { artisanId, rating, comment, bookingId } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      customerId: req.user.id,
      status: "completed",
    });

    if (!booking) return res.status(400).json({ message: "Invalid or incomplete booking" });

    const review = await Review.create({
      customerId: req.user.id,
      artisanId,
      bookingId,
      rating,
      comment,
    });

    res.status(201).json({ message: "Review submitted", review });
  } catch (err) {
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
