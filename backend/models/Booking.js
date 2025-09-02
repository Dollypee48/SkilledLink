const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  service: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  description: { type: String, required: true },
  // Additional fields from frontend
  urgencyLevel: { type: String, enum: ["low", "normal", "high", "emergency"], default: "normal" },
  contactPhone: { type: String, required: true },
  preferredContactMethod: { type: String, enum: ["phone", "sms", "whatsapp", "email"], default: "phone" },
  specialRequirements: { type: String },
  // Legacy fields (kept for backward compatibility)
  price: { type: Number, default: 0 }, // Made optional with default value
  status: { type: String, enum: ["Pending", "Accepted", "Declined", "Pending Confirmation", "Completed", "Cancelled"], default: "Pending" },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
