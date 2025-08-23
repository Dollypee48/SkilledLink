require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET,
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
  cloudinary: {
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER
  },
  port: process.env.PORT || 5000
};