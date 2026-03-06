const mongoose = require("mongoose");

const artisanProfileSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true, 
      unique: true 
    },

    skills: { 
      type: [String], 
      default: [] 
    },

    service: {
      type: String,
      enum: [
        "Plumber", "Tailor", "Mechanic", "Painter", "Graphics Designer",
        "Electrician", "Carpenter", "Welder", "Mason", "Tiler",
        "AC Technician", "Generator Repair", "Phone Repair", "Computer Repair",
        "Hair Stylist", "Makeup Artist", "Photographer", "Videographer",
        "Interior Designer", "Landscaper", "Security Guard", "Driver",
        "Cleaner", "Cook", "Nanny", "Tutor", "Translator",
        "Event Planner", "DJ", "Musician", "Artist", "Writer",
        "Web Developer", "Mobile App Developer", "Data Analyst",
        "Accountant", "Lawyer", "Consultant", "Coach", "Trainer"
      ],
      default: null,
      set: (v) => (v === "" ? null : v)
    },

    location: {
      state: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "" },
      address: { type: String, trim: true, default: "" }
    },

    bio: { 
      type: String, 
      trim: true, 
      default: "" 
    },

    experience: { 
      type: String, 
      trim: true, 
      default: "" 
    },

    hourlyRate: { 
      type: Number, 
      default: 0 
    },

    rating: { 
      type: Number, 
      min: 0, 
      max: 5, 
      default: 0 
    },

    totalJobs: { 
      type: Number, 
      default: 0 
    },

    completedJobs: { 
      type: Number, 
      default: 0 
    },

    earnings: { 
      type: Number, 
      default: 0 
    },

    availability: { 
      type: Boolean, 
      default: true 
    },

    subscription: { 
      type: String, 
      enum: ["free", "premium"], 
      default: "free" 
    },

    portfolio: { 
      type: [String], 
      default: [] 
    },

    certifications: { 
      type: [String], 
      default: [] 
    },

    reviews: { 
      type: [mongoose.Schema.Types.ObjectId], 
      ref: "Review", 
      default: [] 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ArtisanProfile", artisanProfileSchema);