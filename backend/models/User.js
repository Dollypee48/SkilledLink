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
      required: true,
      match: [/^\+?\d{10,15}$/, "Invalid phone number"],
    },
    role: {
      type: String,
      enum: ["customer", "artisan", "admin"],
      default: "customer",
    },
    nationality: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
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
    },
    isSuspended: { type: Boolean, default: false },
    artisanProfile: { type: mongoose.Schema.Types.ObjectId, ref: "ArtisanProfile", default: null },
    refreshToken: { type: String },
    profileImageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
