const mongoose = require("mongoose");

const artisanProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    skills: { type: [String], default: [] },
    service: { type: String, default: "" },
    location: { 
      state: { type: String, default: "" },
      city: { type: String, default: "" },
      address: { type: String, default: "" }
    },
    bio: { type: String, default: "" },
    experience: { type: String, default: "" },
    hourlyRate: { type: Number, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    totalJobs: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    availability: { type: Boolean, default: true },
    subscription: { type: String, enum: ["free", "premium"], default: "free" },
    portfolio: { type: [String], default: [] },
    certifications: { type: [String], default: [] },
    reviews: { type: [mongoose.Schema.Types.ObjectId], ref: "Review", default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ArtisanProfile", artisanProfileSchema);
