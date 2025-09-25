const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  artisanId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Can reference either Booking or ServiceProfileBooking
  bookingType: { type: String, enum: ["regular", "serviceProfile"], required: true }, // Track which type of booking
  serviceProfileId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceProfile" }, // Reference to service profile for service profile reviews
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", reviewSchema);
