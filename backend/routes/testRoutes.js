const express = require('express');
const router = express.Router();
const { sendVerificationEmail } = require('../utils/emailService');

// Test email service endpoint
router.post('/test-email', async (req, res) => {
  try {
    const { email = 'test@example.com' } = req.body;
    
    console.log('🧪 Testing email service...');
    console.log('📧 SMTP Config:', {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      user: process.env.SMTP_USER || 'your-email@gmail.com',
      hasPassword: !!process.env.SMTP_PASS
    });
    
    const result = await sendVerificationEmail(email, '123456', 'Test User');
    
    res.json({
      success: result.success,
      message: result.success ? 'Email sent successfully' : 'Email failed to send',
      error: result.error,
      messageId: result.messageId,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        smtpHost: process.env.SMTP_HOST,
        smtpPort: process.env.SMTP_PORT,
        smtpUser: process.env.SMTP_USER,
        hasSmtpPass: !!process.env.SMTP_PASS
      }
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Test email failed',
      error: error.message
    });
  }
});

module.exports = router;
