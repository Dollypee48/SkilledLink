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
    // Code-based verification fields
    verificationCode: { type: String, default: null },
    verificationCodeExpires: { type: Date, default: null },
    // Password reset fields
    resetCode: { type: String, default: null },
    resetCodeExpiry: { type: Date, default: null },
    // Subscription fields
    subscription: {
      plan: { 
        type: String, 
        enum: ['free', 'premium'], 
        default: 'free' 
      },
      status: { 
        type: String, 
        enum: ['active', 'inactive', 'cancelled', 'expired'], 
        default: 'active' 
      },
      startDate: { type: Date, default: Date.now },
      endDate: { type: Date, default: null },
      paystackSubscriptionId: { type: String, default: null },
      paystackCustomerId: { type: String, default: null },
      autoRenew: { type: Boolean, default: true }
    },
    isPremium: { 
      type: Boolean, 
      default: false
    },
    premiumFeatures: {
      verifiedBadge: { type: Boolean, default: false },
      prioritySearch: { type: Boolean, default: false },
      advancedAnalytics: { type: Boolean, default: false },
      unlimitedBookings: { type: Boolean, default: false },
      premiumSupport: { type: Boolean, default: false },
      featuredListing: { type: Boolean, default: false }
    },
  },
  { timestamps: true }
);

// Virtual field to check if user is currently premium (for display purposes)
userSchema.virtual('isCurrentlyPremium').get(function() {
  return this.subscription?.plan === 'premium' && 
         this.subscription?.status === 'active' && 
         (!this.subscription?.endDate || this.subscription?.endDate > new Date());
});

module.exports = mongoose.model("User", userSchema);
