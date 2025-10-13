const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS'
];

const optionalEnvVars = [
  'NODE_ENV',
  'PORT',
  'CLIENT_URL',
  'APP_NAME',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'PAYSTACK_SECRET_KEY',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER'
];

const validateEnvironment = () => {
  const missing = [];
  const warnings = [];

  // Check required variables
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check optional variables and warn if missing
  optionalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  });

  // Log validation results
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    console.error('Please set these variables in your .env file or environment');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Missing optional environment variables:', warnings);
    console.warn('Some features may not work properly');
  }

  // Validate specific configurations
  validateSMTPConfig();
  validateDatabaseConfig();
  validateJWTConfig();

  console.log('✅ Environment validation passed');
};

const validateSMTPConfig = () => {
  const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  };

  console.log('📧 SMTP Configuration:', {
    host: smtpConfig.host,
    port: smtpConfig.port,
    user: smtpConfig.user,
    hasPassword: !!smtpConfig.pass
  });

  // Validate port
  const port = parseInt(smtpConfig.port);
  if (isNaN(port) || port < 1 || port > 65535) {
    console.error('❌ Invalid SMTP_PORT:', smtpConfig.port);
    process.exit(1);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(smtpConfig.user)) {
    console.error('❌ Invalid SMTP_USER email format:', smtpConfig.user);
    process.exit(1);
  }
};

const validateDatabaseConfig = () => {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    console.error('❌ Invalid MONGODB_URI format. Must start with mongodb:// or mongodb+srv://');
    process.exit(1);
  }

  console.log('🗄️  Database Configuration:', {
    uri: mongoUri.replace(/\/\/.*@/, '//***:***@'), // Hide credentials
    hasCredentials: mongoUri.includes('@'),
    nodeEnv: process.env.NODE_ENV || 'development'
  });
};

const validateJWTConfig = () => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

  if (jwtSecret.length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters long');
    process.exit(1);
  }

  if (jwtRefreshSecret.length < 32) {
    console.error('❌ JWT_REFRESH_SECRET must be at least 32 characters long');
    process.exit(1);
  }

  if (jwtSecret === jwtRefreshSecret) {
    console.error('❌ JWT_SECRET and JWT_REFRESH_SECRET must be different');
    process.exit(1);
  }

  console.log('🔐 JWT Configuration validated');
};

module.exports = {
  validateEnvironment,
  requiredEnvVars,
  optionalEnvVars
};
