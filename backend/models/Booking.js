const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  service: { type: String, required: true },
  serviceProfile: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceProfile" }, // Reference to service profile
  date: { type: Date, required: true },
  time: { type: String, required: true },
  description: { type: String, required: true },
  // Additional fields from frontend
  urgencyLevel: { type: String, enum: ["low", "normal", "high", "emergency"], default: "normal" },
  contactPhone: { type: String, required: true },
  preferredContactMethod: { type: String, enum: ["phone", "sms", "whatsapp", "email"], default: "phone" },
  specialRequirements: { type: String },
  estimatedDuration: { type: Number }, // Duration in hours
  location: { type: String }, // Service location
  hourlyRate: { type: Number, default: 0 }, // Hourly rate from service profile
  totalAmount: { type: Number, default: 0 }, // Calculated total amount
  // Legacy fields (kept for backward compatibility)
  price: { type: Number, default: 0 }, // Made optional with default value
  status: { type: String, enum: ["Pending", "Accepted", "Declined", "Pending Confirmation", "Completed", "Cancelled"], default: "Pending" },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
