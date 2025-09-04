const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: { type: String, required: true, minlength: 6 },
    phone: {
      type: String,
      required: false,
      match: [/^\+?\d{10,15}$/, "Invalid phone number"],
    },
    role: {
      type: String,
      enum: ["customer", "artisan", "admin"],
      default: "customer",
    },
    nationality: { type: String, required: false, trim: true },
    state: { type: String, required: false, trim: true },
    address: { type: String, required: false, trim: true },
    occupation: { type: String, required: false, trim: true },
    kycVerified: {
      type: Boolean,
      default: function () {
        return this.role === "customer"; // auto verified if customer
      },
    },
    kycStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: function () {
        return this.kycVerified ? "approved" : "pending";
      },
    },
    kycDocuments: {
      idProof: { type: String },
      addressProof: { type: String },
      credentials: { type: String }, // For artisans only
      faceImage: { type: String }, // New: For face recognition
    },
    isSuspended: { type: Boolean, default: false },
    artisanProfile: { type: mongoose.Schema.Types.ObjectId, ref: "ArtisanProfile", default: null },
    refreshToken: { type: String },
    profileImageUrl: { type: String, default: '' },
    // Email verification fields
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    verificationTokenExpires: { type: Date, default: null },
    // Password reset fields
    resetCode: { type: String, default: null },
    resetCodeExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
