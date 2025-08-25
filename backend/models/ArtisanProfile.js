const mongoose = require("mongoose");

const artisanProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    skills: { type: [String], default: [] },
    service: { type: String, default: "" },
    location: { type: String, default: "" },
    bio: { type: String, default: "" }, // New field: short biography
    experience: { type: String, default: "" }, // New field: years of experience or a description
    rating: { type: Number, min: 0, max: 5, default: 0 },
    availability: { type: Boolean, default: true },
    subscription: { type: String, enum: ["free", "premium"], default: "free" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ArtisanProfile", artisanProfileSchema);
