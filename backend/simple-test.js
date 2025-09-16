require('dotenv').config();
const { sendVerificationEmail } = require('./utils/emailService');

async function simpleTest() {
  try {
    console.log('🧪 Testing email service directly...');
    
    const result = await sendVerificationEmail('test@example.com', '123456', 'Test User');
    console.log('✅ Email service result:', result);
    
  } catch (error) {
    console.error('❌ Email service error:', error);
  }
}

simpleTest();
