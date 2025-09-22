const mongoose = require("mongoose");

const serviceProfileBookingSchema = new mongoose.Schema({
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  artisan: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  serviceProfile: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ServiceProfile", 
    required: true 
  },
  serviceName: { 
    type: String, 
    required: true 
  },
  // Booking details
  date: { 
    type: Date, 
    required: true 
  },
  time: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  // Service-specific pricing
  hourlyRate: { 
    type: Number, 
    required: true 
  },
  estimatedDuration: { 
    type: Number, 
    required: true 
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  // Additional details
  specialRequirements: { 
    type: String 
  },
  location: { 
    type: String 
  },
  // Booking status
  status: { 
    type: String, 
    enum: ["Pending", "Accepted", "Declined", "In Progress", "Pending Confirmation", "Completed", "Cancelled"], 
    default: "Pending" 
  },
  // Timestamps
  acceptedAt: { type: Date },
  startedAt: { type: Date },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
}, { 
  timestamps: true 
});

// Index for better query performance
serviceProfileBookingSchema.index({ customer: 1, status: 1 });
serviceProfileBookingSchema.index({ artisan: 1, status: 1 });
serviceProfileBookingSchema.index({ serviceProfile: 1 });
serviceProfileBookingSchema.index({ date: 1 });

module.exports = mongoose.model("ServiceProfileBooking", serviceProfileBookingSchema);
