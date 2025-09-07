// KYC Utility Functions
export const KYC_STATUS = {
  NOT_SUBMITTED: null,
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

/**
 * Check if user has completed KYC verification
 * @param {Object} user - User object
 * @returns {boolean} - True if user is KYC verified (always true now)
 */
export const isKYCVerified = (user) => {
  return true; // Always return true - KYC verification disabled
};

/**
 * Check if user has submitted KYC (pending or approved)
 * @param {Object} user - User object
 * @returns {boolean} - True if user has submitted KYC
 */
export const hasKYCSubmitted = (user) => {
  return user?.kycStatus === KYC_STATUS.PENDING || user?.kycStatus === KYC_STATUS.APPROVED;
};

/**
 * Check if user needs to complete KYC
 * @param {Object} user - User object
 * @returns {boolean} - True if user needs to complete KYC (always false now)
 */
export const needsKYC = (user) => {
  return false; // Always return false - KYC verification disabled
};

/**
 * Get KYC status display information
 * @param {string} status - KYC status
 * @returns {Object} - Status display info
 */
export const getKYCStatusInfo = (status) => {
  switch (status) {
    case KYC_STATUS.APPROVED:
      return {
        text: 'Verified',
        color: 'green',
        icon: 'check-circle',
        description: 'Your identity has been verified'
      };
    case KYC_STATUS.PENDING:
      return {
        text: 'Under Review',
        color: 'yellow',
        icon: 'clock',
        description: 'Your documents are being reviewed'
      };
    case KYC_STATUS.REJECTED:
      return {
        text: 'Rejected',
        color: 'red',
        icon: 'x-circle',
        description: 'Please resubmit your documents'
      };
    default:
      return {
        text: 'Not Verified',
        color: 'gray',
        icon: 'shield',
        description: 'Complete verification to access all features'
      };
  }
};

/**
 * Check if a feature requires KYC verification
 * @param {string} feature - Feature name
 * @returns {boolean} - True if feature requires KYC
 */
export const requiresKYC = (feature) => {
  const kycRequiredFeatures = [
    'booking',
    'messaging',
    'reviews',
    'payments',
    'profile_editing',
    'service_creation',
    'availability_management'
  ];
  return kycRequiredFeatures.includes(feature);
};

/**
 * Get KYC restriction message for a feature
 * @param {string} feature - Feature name
 * @returns {string} - Restriction message
 */
export const getKYCRequirementMessage = (feature) => {
  const messages = {
    booking: 'Complete KYC verification to book services',
    messaging: 'Complete KYC verification to message artisans',
    reviews: 'Complete KYC verification to leave reviews',
    payments: 'Complete KYC verification to make payments',
    profile_editing: 'Complete KYC verification to edit your profile',
    service_creation: 'Complete KYC verification to create services',
    availability_management: 'Complete KYC verification to manage availability'
  };
  return messages[feature] || 'Complete KYC verification to access this feature';
};
