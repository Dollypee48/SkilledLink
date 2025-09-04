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

  const completionPercentage = Math.round(((fieldsToCheck.length - missingFields.length) / fieldsToCheck.length) * 100);
  
  return {
    isComplete: missingFields.length === 0 && incompleteFields.length === 0,
    completionPercentage,
    missingFields,
    incompleteFields,
    totalFields: fieldsToCheck.length,
    completedFields: fieldsToCheck.length - missingFields.length
  };
};

const getProfileCompletionMessage = (completionData, userRole) => {
  const { isComplete, completionPercentage, missingFields, completedFields, totalFields } = completionData;
  
  if (isComplete) {
    return {
      type: 'success',
      title: 'Profile Complete!',
      message: 'Your profile is fully set up. You can update it anytime from settings.',
      showNotification: false
    };
  }

  if (completionPercentage < 30) {
    return {
      type: 'warning',
      title: 'Complete Your Profile',
      message: `Your profile is only ${completionPercentage}% complete. Please add your ${missingFields.slice(0, 3).join(', ')}${missingFields.length > 3 ? ' and more' : ''} to get started.`,
      showNotification: true,
      actionText: 'Complete Profile',
      actionUrl: userRole === 'artisan' ? '/artisan-settings' : '/customer-settings'
    };
  }

  if (completionPercentage < 70) {
    return {
      type: 'info',
      title: 'Almost There!',
      message: `Your profile is ${completionPercentage}% complete. Add a few more details to help others find you better.`,
      showNotification: true,
      actionText: 'Update Profile',
      actionUrl: userRole === 'artisan' ? '/artisan-settings' : '/customer-settings'
    };
  }

  return {
    type: 'info',
    title: 'Profile Almost Complete',
    message: `Your profile is ${completionPercentage}% complete. Just a few more details to make it perfect!`,
    showNotification: true,
    actionText: 'Finish Profile',
    actionUrl: userRole === 'artisan' ? '/artisan-settings' : '/customer-settings'
  };
};

module.exports = {
  checkProfileCompletion,
  getProfileCompletionMessage
};
