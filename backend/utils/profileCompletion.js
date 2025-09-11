// Profile completion utility functions
const checkProfileCompletion = (user) => {
  const requiredFields = {
    customer: ['name', 'email', 'phone', 'address', 'nationality', 'state'],
    artisan: ['name', 'email', 'phone', 'address', 'nationality', 'state', 'occupation', 'service', 'bio', 'experience'],
    admin: ['name', 'email']
  };

  const userRole = user.role || 'customer';
  const fieldsToCheck = requiredFields[userRole] || requiredFields.customer;
  
  const missingFields = [];
  const incompleteFields = [];

  fieldsToCheck.forEach(field => {
    if (!user[field] || user[field].toString().trim() === '') {
      missingFields.push(field);
    } else if (user[field].toString().trim().length < 2) {
      incompleteFields.push(field);
    }
  });

  // Check artisan-specific fields
  if (userRole === 'artisan' && user.artisanProfile) {
    const artisanFields = ['skills', 'location'];
    artisanFields.forEach(field => {
      if (!user.artisanProfile[field] || 
          (Array.isArray(user.artisanProfile[field]) && user.artisanProfile[field].length === 0) ||
          (typeof user.artisanProfile[field] === 'string' && user.artisanProfile[field].trim() === '')) {
        missingFields.push(field);
      }
    });
  }

  // Check KYC verification status
  const kycStatus = user.kycStatus;
  const isKYCVerified = kycStatus === 'approved';
  const needsKYC = !isKYCVerified && (kycStatus === null || kycStatus === 'rejected');
  
  // Add KYC to missing fields if needed
  if (needsKYC) {
    missingFields.push('kyc_verification');
  }

  // Calculate completion percentage including KYC
  const totalFields = fieldsToCheck.length + 1; // +1 for KYC verification
  const completedFields = fieldsToCheck.length - missingFields.length + (isKYCVerified ? 1 : 0);
  const completionPercentage = Math.round((completedFields / totalFields) * 100);
  
  return {
    isComplete: missingFields.length === 0 && incompleteFields.length === 0 && isKYCVerified,
    completionPercentage,
    missingFields,
    incompleteFields,
    totalFields,
    completedFields,
    kycStatus,
    isKYCVerified,
    needsKYC
  };
};

const getProfileCompletionMessage = (completionData, userRole) => {
  const { isComplete, completionPercentage, missingFields, completedFields, totalFields, kycStatus, isKYCVerified, needsKYC } = completionData;
  
  if (isComplete) {
    return {
      type: 'success',
      title: 'Profile Complete!',
      message: 'Your profile and KYC verification are complete. You can update them anytime from settings.',
      showNotification: false
    };
  }

  // Check if KYC is the main missing piece
  const hasKYCInMissing = missingFields.includes('kyc_verification');
  const otherMissingFields = missingFields.filter(field => field !== 'kyc_verification');
  
  let message = '';
  let actionText = '';
  let actionUrl = '';

  if (hasKYCInMissing && otherMissingFields.length === 0) {
    // Only KYC is missing
    if (kycStatus === null) {
      message = 'Your profile is complete, but you need to complete KYC verification to access all features.';
      actionText = 'Complete KYC Verification';
      actionUrl = '/kyc-verification';
    } else if (kycStatus === 'rejected') {
      message = 'Your profile is complete, but your KYC verification was rejected. Please resubmit your documents.';
      actionText = 'Resubmit KYC Documents';
      actionUrl = '/kyc-verification';
    } else if (kycStatus === 'pending') {
      message = 'Your profile is complete and KYC documents are under review. You\'ll be notified once verified.';
      actionText = 'View KYC Status';
      actionUrl = '/kyc-verification';
    }
  } else if (hasKYCInMissing && otherMissingFields.length > 0) {
    // Both profile fields and KYC are missing
    const fieldNames = otherMissingFields.slice(0, 2).join(', ');
    message = `Complete your profile (${fieldNames}${otherMissingFields.length > 2 ? ' and more' : ''}) and KYC verification to access all features.`;
    actionText = 'Complete Profile & KYC';
    actionUrl = userRole === 'artisan' ? '/artisan-settings' : '/customer-settings';
  } else {
    // Only profile fields are missing
    const fieldNames = missingFields.slice(0, 3).join(', ');
    message = `Your profile is ${completionPercentage}% complete. Please add your ${fieldNames}${missingFields.length > 3 ? ' and more' : ''} to get started.`;
    actionText = 'Complete Profile';
    actionUrl = userRole === 'artisan' ? '/artisan-settings' : '/customer-settings';
  }

  if (completionPercentage < 30) {
    return {
      type: 'warning',
      title: 'Complete Your Profile',
      message,
      showNotification: true,
      actionText,
      actionUrl
    };
  }

  if (completionPercentage < 70) {
    return {
      type: 'info',
      title: 'Almost There!',
      message,
      showNotification: true,
      actionText,
      actionUrl
    };
  }

  return {
    type: 'info',
    title: 'Profile Almost Complete',
    message,
    showNotification: true,
    actionText,
    actionUrl
  };
};

module.exports = {
  checkProfileCompletion,
  getProfileCompletionMessage
};
