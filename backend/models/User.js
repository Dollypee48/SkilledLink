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
    gender: { 
      type: String, 
      enum: ['male', 'female', 'other'], 
      required: false 
    },
    nationality: { type: String, required: false, trim: true },
    state: { type: String, required: false, trim: true },
    address: { type: String, required: false, trim: true },
    occupation: { type: String, required: false, trim: true },
    kycVerified: {
      type: Boolean,
      default: false, // No automatic verification - admin must verify all users
    },
    kycStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: null, // No status until KYC documents are submitted
    },
    kycDocuments: {
      // Government ID documents
      governmentIdType: { 
        type: String, 
        enum: ['national_id', 'passport', 'drivers_license', 'voters_card', 'military_id', 'student_id'],
        required: false 
      },
      governmentIdFront: { type: String },
      governmentIdBack: { type: String },
      
      // Address proof documents
      addressProofType: { 
        type: String, 
        enum: ['utility_bill', 'bank_statement', 'rental_agreement', 'property_deed', 'government_letter'],
        required: false 
      },
      addressProof: { type: String },
      
      // Professional credentials (for artisans only)
      credentials: { type: String },
      
      // Portfolio (for artisans only)
      portfolio: { type: String },
      
      // Face recognition image
      faceImage: { type: String },
      
      // Legacy fields for backward compatibility
      idProof: { type: String },
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
    // Job acceptance tracking for artisans
    jobAcceptance: {
      acceptedJobs: { type: Number, default: 0 },
      maxJobs: { type: Number, default: 3 }, // 3 for free, unlimited for premium
      resetDate: { type: Date, default: Date.now } // Monthly reset for free accounts
    },
    // Notification preferences
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      jobUpdates: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      reviews: { type: Boolean, default: true },
      earnings: { type: Boolean, default: true }, // For artisans
      jobRequests: { type: Boolean, default: true } // For artisans
    },
    // Privacy settings
    privacySettings: {
      profileVisibility: { 
        type: String, 
        enum: ['public', 'private', 'contacts'], 
        default: 'public' 
      },
      showPhone: { type: Boolean, default: true },
      showEmail: { type: Boolean, default: false },
      showLocation: { type: Boolean, default: true },
      allowMessages: { type: Boolean, default: true },
      showOnlineStatus: { type: Boolean, default: true }
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

// Virtual field to check if user can accept more jobs
userSchema.virtual('canAcceptJobs').get(function() {
  if (this.role !== 'artisan') return false;
  
  // Premium users have unlimited job acceptances
  if (this.isCurrentlyPremium) return true;
  
  // Check if it's time to reset job count (monthly for free users)
  const now = new Date();
  const resetDate = new Date(this.jobAcceptance.resetDate);
  const shouldReset = now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear();
  
  if (shouldReset) {
    this.jobAcceptance.acceptedJobs = 0;
    this.jobAcceptance.resetDate = now;
    this.save(); // Save the reset
  }
  
  return this.jobAcceptance.acceptedJobs < this.jobAcceptance.maxJobs;
});

// Virtual field to get remaining job acceptances
userSchema.virtual('remainingJobs').get(function() {
  if (this.role !== 'artisan') return 0;
  if (this.isCurrentlyPremium) return 'Unlimited';
  return Math.max(0, this.jobAcceptance.maxJobs - this.jobAcceptance.acceptedJobs);
});

module.exports = mongoose.model("User", userSchema);
