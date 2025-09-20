const mongoose = require("mongoose");

const serviceProfileSchema = new mongoose.Schema(
  {
    artisanId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    title: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 100
    },
    description: { 
      type: String, 
      required: false,
      trim: true,
      maxlength: 1000,
      default: ''
    },
    category: { 
      type: String, 
      required: true,
      enum: [
        'plumbing', 'electrical', 'carpentry', 'painting', 'cleaning', 
        'gardening', 'appliance_repair', 'hvac', 'roofing', 'flooring',
        'tiling', 'masonry', 'welding', 'automotive', 'computer_repair',
        'phone_repair', 'photography', 'catering', 'event_planning',
        'tutoring', 'fitness', 'beauty', 'massage', 'other'
      ]
    },
    subcategory: { 
      type: String, 
      trim: true,
      maxlength: 50
    },
    hourlyRate: { 
      type: Number, 
      required: true,
      min: 0,
      max: 1000000 // Maximum ₦1,000,000 per hour
    },
    minimumHours: { 
      type: Number, 
      default: 1,
      min: 0.5,
      max: 24
    },
    maximumHours: { 
      type: Number, 
      default: 8,
      min: 1,
      max: 24
    },
    availability: {
      monday: {
        available: { type: Boolean, default: true },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "17:00" }
      },
      tuesday: {
        available: { type: Boolean, default: true },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "17:00" }
      },
      wednesday: {
        available: { type: Boolean, default: true },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "17:00" }
      },
      thursday: {
        available: { type: Boolean, default: true },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "17:00" }
      },
      friday: {
        available: { type: Boolean, default: true },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "17:00" }
      },
      saturday: {
        available: { type: Boolean, default: true },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "17:00" }
      },
      sunday: {
        available: { type: Boolean, default: false },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "17:00" }
      }
    },
    serviceArea: {
      type: { 
        type: String, 
        enum: ['local', 'city', 'state', 'national'], 
        default: 'local' 
      },
      radius: { 
        type: Number, 
        default: 10, // km
        min: 1,
        max: 500
      },
      specificAreas: [{ 
        type: String, 
        trim: true 
      }]
    },
    requirements: {
      toolsProvided: { type: Boolean, default: true },
      materialsProvided: { type: Boolean, default: false },
      customerTools: { type: Boolean, default: false },
      specialRequirements: { 
        type: String, 
        trim: true,
        maxlength: 500
      }
    },
    pricing: {
      baseRate: { 
        type: Number, 
        required: true,
        min: 0
      },
      weekendRate: { 
        type: Number, 
        min: 0
      },
      holidayRate: { 
        type: Number, 
        min: 0
      },
      emergencyRate: { 
        type: Number, 
        min: 0
      },
      travelFee: { 
        type: Number, 
        default: 0,
        min: 0
      }
    },
    images: [{ 
      type: String, 
      validate: {
        validator: function(v) {
          return v.length <= 10; // Maximum 10 images
        },
        message: 'Cannot have more than 10 images'
      }
    }],
    tags: [{ 
      type: String, 
      trim: true,
      maxlength: 30
    }],
    isActive: { 
      type: Boolean, 
      default: true 
    },
    isFeatured: { 
      type: Boolean, 
      default: false 
    },
    rating: { 
      type: Number, 
      min: 0, 
      max: 5, 
      default: 0 
    },
    reviewCount: { 
      type: Number, 
      default: 0 
    },
    bookingCount: { 
      type: Number, 
      default: 0 
    },
    totalEarnings: { 
      type: Number, 
      default: 0 
    },
    responseTime: { 
      type: String, 
      enum: ['within_1_hour', 'within_2_hours', 'within_4_hours', 'within_24_hours', 'next_day'],
      default: 'within_4_hours'
    },
    cancellationPolicy: {
      type: { 
        type: String, 
        enum: ['flexible', 'moderate', 'strict'], 
        default: 'moderate' 
      },
      description: { 
        type: String, 
        trim: true,
        maxlength: 500
      }
    }
  },
  { 
    timestamps: true 
  }
);

// Indexes for better performance
serviceProfileSchema.index({ artisanId: 1, isActive: 1 });
serviceProfileSchema.index({ category: 1, isActive: 1 });
serviceProfileSchema.index({ rating: -1, bookingCount: -1 });
serviceProfileSchema.index({ createdAt: -1 });

// Virtual for formatted hourly rate
serviceProfileSchema.virtual('formattedHourlyRate').get(function() {
  return `₦${this.hourlyRate.toLocaleString()}/hour`;
});

// Virtual for total availability hours per week
serviceProfileSchema.virtual('weeklyHours').get(function() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  let totalHours = 0;
  
  days.forEach(day => {
    if (this.availability[day].available) {
      const start = this.availability[day].startTime;
      const end = this.availability[day].endTime;
      const startTime = new Date(`2000-01-01T${start}:00`);
      const endTime = new Date(`2000-01-01T${end}:00`);
      const diffMs = endTime - startTime;
      const diffHours = diffMs / (1000 * 60 * 60);
      totalHours += diffHours;
    }
  });
  
  return Math.round(totalHours * 10) / 10; // Round to 1 decimal place
});

// Method to check if service is available at specific time
serviceProfileSchema.methods.isAvailableAt = function(dayOfWeek, time) {
  const day = dayOfWeek.toLowerCase();
  if (!this.availability[day] || !this.availability[day].available) {
    return false;
  }
  
  const requestedTime = new Date(`2000-01-01T${time}:00`);
  const startTime = new Date(`2000-01-01T${this.availability[day].startTime}:00`);
  const endTime = new Date(`2000-01-01T${this.availability[day].endTime}:00`);
  
  return requestedTime >= startTime && requestedTime <= endTime;
};

// Method to calculate total cost for booking
serviceProfileSchema.methods.calculateCost = function(hours, isWeekend = false, isHoliday = false, isEmergency = false) {
  let rate = this.pricing.baseRate;
  
  if (isWeekend && this.pricing.weekendRate) {
    rate = this.pricing.weekendRate;
  } else if (isHoliday && this.pricing.holidayRate) {
    rate = this.pricing.holidayRate;
  } else if (isEmergency && this.pricing.emergencyRate) {
    rate = this.pricing.emergencyRate;
  }
  
  const baseCost = rate * hours;
  const travelFee = this.pricing.travelFee || 0;
  
  return baseCost + travelFee;
};

module.exports = mongoose.model("ServiceProfile", serviceProfileSchema);
