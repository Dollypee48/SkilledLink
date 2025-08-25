const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  service: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true }, // Added price field
  status: { type: String, enum: ["Pending", "Accepted", "Declined", "Completed", "Cancelled"], default: "Pending" }, // Updated enum
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
