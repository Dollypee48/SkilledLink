// KYC Validation utilities for government ID types and validation

// List of valid government ID types
const GOVERNMENT_ID_TYPES = [
  {
    id: 'national_id',
    name: 'National ID Card',
    description: 'Government-issued national identification card',
    requiredFields: ['front', 'back'],
    maxSize: '5MB',
    acceptedFormats: ['jpg', 'jpeg', 'png', 'pdf']
  },
  {
    id: 'passport',
    name: 'Passport',
    description: 'International passport',
    requiredFields: ['front', 'back'],
    maxSize: '5MB',
    acceptedFormats: ['jpg', 'jpeg', 'png', 'pdf']
  },
  {
    id: 'drivers_license',
    name: 'Driver\'s License',
    description: 'Government-issued driver\'s license',
    requiredFields: ['front', 'back'],
    maxSize: '5MB',
    acceptedFormats: ['jpg', 'jpeg', 'png', 'pdf']
  },
  {
    id: 'voters_card',
    name: 'Voter\'s Card',
    description: 'Voter registration card',
    requiredFields: ['front', 'back'],
    maxSize: '5MB',
    acceptedFormats: ['jpg', 'jpeg', 'png', 'pdf']
  },
  {
    id: 'military_id',
    name: 'Military ID',
    description: 'Military identification card',
    requiredFields: ['front', 'back'],
    maxSize: '5MB',
    acceptedFormats: ['jpg', 'jpeg', 'png', 'pdf']
  },
  {
    id: 'student_id',
    name: 'Student ID',
    description: 'Government-issued student identification',
    requiredFields: ['front', 'back'],
    maxSize: '5MB',
    acceptedFormats: ['jpg', 'jpeg', 'png', 'pdf']
  }
];

// Address proof types
const ADDRESS_PROOF_TYPES = [
  {
    id: 'utility_bill',
    name: 'Utility Bill',
    description: 'Electricity, water, gas, or internet bill (not older than 3 months)',
    requiredFields: ['front'],
    maxSize: '5MB',
    acceptedFormats: ['jpg', 'jpeg', 'png', 'pdf']
  },
  {
    id: 'bank_statement',
    name: 'Bank Statement',
    description: 'Bank statement or account summary (not older than 3 months)',
    requiredFields: ['front'],
    maxSize: '5MB',
    acceptedFormats: ['jpg', 'jpeg', 'png', 'pdf']
  },
  {
    id: 'rental_agreement',
    name: 'Rental Agreement',
    description: 'Lease or rental agreement',
    requiredFields: ['front'],
    maxSize: '5MB',
    acceptedFormats: ['jpg', 'jpeg', 'png', 'pdf']
  },
  {
    id: 'property_deed',
    name: 'Property Deed',
    description: 'Property ownership document',
    requiredFields: ['front'],
    maxSize: '5MB',
    acceptedFormats: ['jpg', 'jpeg', 'png', 'pdf']
  },
  {
    id: 'government_letter',
    name: 'Government Letter',
    description: 'Official letter from government agency',
    requiredFields: ['front'],
    maxSize: '5MB',
    acceptedFormats: ['jpg', 'jpeg', 'png', 'pdf']
  }
];

// Validation functions
const validateIdType = (idType) => {
  return GOVERNMENT_ID_TYPES.some(id => id.id === idType);
};

const validateAddressProofType = (proofType) => {
  return ADDRESS_PROOF_TYPES.some(proof => proof.id === proofType);
};

const validateRequiredFields = (idType, documents) => {
  const idConfig = GOVERNMENT_ID_TYPES.find(id => id.id === idType);
  if (!idConfig) return false;
  
  return idConfig.requiredFields.every(field => documents[field]);
};

const validateFileFormat = (filename, acceptedFormats) => {
  const extension = filename.split('.').pop().toLowerCase();
  return acceptedFormats.includes(extension);
};

const validateFileSize = (fileSize, maxSize) => {
  const maxSizeBytes = parseFileSize(maxSize);
  return fileSize <= maxSizeBytes;
};

const parseFileSize = (sizeString) => {
  const size = parseInt(sizeString);
  const unit = sizeString.replace(/[0-9]/g, '');
  const multipliers = {
    'B': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024
  };
  return size * (multipliers[unit] || 1);
};

// Get ID type configuration
const getIdTypeConfig = (idType) => {
  return GOVERNMENT_ID_TYPES.find(id => id.id === idType);
};

const getAddressProofConfig = (proofType) => {
  return ADDRESS_PROOF_TYPES.find(proof => proof.id === proofType);
};

// Validate complete KYC submission
const validateKYCSubmission = (kycData) => {
  const errors = [];
  
  // Validate government ID
  if (!kycData.governmentIdType || !validateIdType(kycData.governmentIdType)) {
    errors.push('Valid government ID type is required');
  }
  
  if (!kycData.governmentIdFront) {
    errors.push('Government ID front image is required');
  }
  
  if (!kycData.governmentIdBack) {
    errors.push('Government ID back image is required');
  }
  
  // Validate address proof
  if (!kycData.addressProofType || !validateAddressProofType(kycData.addressProofType)) {
    errors.push('Valid address proof type is required');
  }
  
  if (!kycData.addressProof) {
    errors.push('Address proof document is required');
  }
  
  // Validate face image
  if (!kycData.faceImage) {
    errors.push('Face image is required for verification');
  }
  
  // Validate artisan credentials (if applicable)
  if (kycData.userRole === 'artisan' && !kycData.credentials) {
    errors.push('Professional credentials (certificate) are required for artisans');
  }
  
  // Validate artisan portfolio (if applicable)
  if (kycData.userRole === 'artisan' && !kycData.portfolio) {
    errors.push('Portfolio is required for artisans');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  GOVERNMENT_ID_TYPES,
  ADDRESS_PROOF_TYPES,
  validateIdType,
  validateAddressProofType,
  validateRequiredFields,
  validateFileFormat,
  validateFileSize,
  getIdTypeConfig,
  getAddressProofConfig,
  validateKYCSubmission
};
