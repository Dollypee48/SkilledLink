const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email queue for asynchronous processing
const emailQueue = [];
let isProcessing = false;

// Create email transporter with connection pooling
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    pool: true, // Use connection pooling
    maxConnections: 5, // Maximum number of connections
    maxMessages: 100, // Maximum number of messages per connection
    rateDelta: 20000, // Time window for rate limiting
    rateLimit: 5, // Maximum number of messages per time window
    connectionTimeout: 60000, // Connection timeout
    greetingTimeout: 30000, // Greeting timeout
    socketTimeout: 60000, // Socket timeout
    debug: process.env.NODE_ENV === 'development', // Enable debug in development
    logger: process.env.NODE_ENV === 'development' // Enable logging in development
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Email templates
const emailTemplates = {
  verification: (userName, verificationCode) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #151E3D 0%, #1E2A4A 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ${process.env.APP_NAME || 'SkilledLink'}!</h1>
        <p style="color: #F59E0B; margin: 10px 0 0 0; font-size: 16px;">Email Verification</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #151E3D; margin-top: 0;">Hi ${userName},</h2>
        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
          Thank you for registering with us! To complete your registration, please enter the verification code below:
        </p>
        
        <div style="background: white; border: 2px solid #F59E0B; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
          <p style="margin: 0; color: #151E3D; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Verification Code</p>
          <div style="font-size: 32px; font-weight: bold; color: #F59E0B; letter-spacing: 8px; margin: 10px 0; font-family: 'Courier New', monospace;">${verificationCode}</div>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 0;">
          This code will expire in <strong>10 minutes</strong>. If you didn't create an account, please ignore this email.
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          For security reasons, never share this code with anyone. SkilledLink will never ask for your verification code.
        </p>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
        © ${new Date().getFullYear()} ${process.env.APP_NAME || 'SkilledLink'}. All rights reserved.
      </p>
    </div>
  `,

  passwordReset: (userName, otp) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #151E3D 0%, #1E2A4A 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
        <p style="color: #F59E0B; margin: 10px 0 0 0; font-size: 16px;">SkilledLink</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #151E3D; margin-top: 0;">Hi ${userName},</h2>
        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
          You requested to reset your password. Use the verification code below to proceed with resetting your password:
        </p>
        
        <div style="background: white; border: 2px solid #F59E0B; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
          <p style="margin: 0; color: #151E3D; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Verification Code</p>
          <div style="font-size: 32px; font-weight: bold; color: #F59E0B; letter-spacing: 8px; margin: 10px 0; font-family: 'Courier New', monospace;">${otp}</div>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 0;">
          This code will expire in <strong>10 minutes</strong>. If you didn't request this password reset, please ignore this email.
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          For security reasons, never share this code with anyone. SkilledLink will never ask for your verification code.
        </p>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
        © ${new Date().getFullYear()} ${process.env.APP_NAME || 'SkilledLink'}. All rights reserved.
      </p>
    </div>
  `
};

// Add email to queue for asynchronous processing
const queueEmail = (emailData) => {
  const emailWithId = {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    ...emailData
  };
  
  emailQueue.push(emailWithId);
  console.log(`📧 Email queued: ${emailWithId.id} (${emailData.type})`);
  
  // Start processing if not already running
  if (!isProcessing) {
    processEmailQueue();
  }
  
  return emailWithId.id;
};

// Process email queue asynchronously
const processEmailQueue = async () => {
  if (isProcessing || emailQueue.length === 0) {
    return;
  }
  
  isProcessing = true;
  console.log(`📧 Processing email queue: ${emailQueue.length} emails pending`);
  
  while (emailQueue.length > 0) {
    const emailData = emailQueue.shift();
    await sendEmailAsync(emailData);
  }
  
  isProcessing = false;
  console.log('📧 Email queue processing completed');
};

// Send email asynchronously with retry logic
const sendEmailAsync = async (emailData, retryCount = 0) => {
  const maxRetries = 3;
  const retryDelay = 5000; // 5 seconds
  
  try {
    const transporter = createTransporter();

    // Verify SMTP connection before attempting to send
    try {
      console.log('📧 Verifying SMTP transporter connection...', {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        user: process.env.SMTP_USER,
        hasPassword: !!process.env.SMTP_PASS,
        nodeEnv: process.env.NODE_ENV
      });
      await transporter.verify();
      console.log('✅ SMTP transporter verified');
    } catch (verifyError) {
      console.error('❌ SMTP transporter verification failed', {
        message: verifyError.message,
        code: verifyError.code,
        command: verifyError.command,
        response: verifyError.response,
        responseCode: verifyError.responseCode
      });
      // Continue to attempt send; some providers may not support verify
    }
    
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'SkilledLink'}" <${process.env.SMTP_USER}>`,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully: ${emailData.id} (${emailData.type}) - ${info.messageId}`);
    
    // Close transporter connection
    transporter.close();
    
  } catch (error) {
    console.error(`❌ Email send failed: ${emailData.id} (${emailData.type})`, {
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      retryCount
    });
    
    // Retry logic
    if (retryCount < maxRetries) {
      console.log(`🔄 Retrying email: ${emailData.id} (attempt ${retryCount + 1}/${maxRetries})`);
      setTimeout(() => {
        sendEmailAsync(emailData, retryCount + 1);
      }, retryDelay * (retryCount + 1)); // Exponential backoff
    } else {
      console.error(`💥 Email failed permanently: ${emailData.id} (${emailData.type})`);
      // Here you could implement dead letter queue or alerting
    }
  }
};

// Public API functions
const sendVerificationEmailAsync = (email, verificationCode, userName) => {
  const emailId = queueEmail({
    type: 'verification',
    to: email,
    subject: 'Verify Your Email Address - Verification Code',
    html: emailTemplates.verification(userName, verificationCode)
  });
  
  return { success: true, emailId };
};

const sendPasswordResetOTPAsync = (email, otp, userName) => {
  const emailId = queueEmail({
    type: 'password_reset',
    to: email,
    subject: 'Password Reset Verification Code',
    html: emailTemplates.passwordReset(userName, otp)
  });
  
  return { success: true, emailId };
};

// Get queue status for monitoring
const getQueueStatus = () => {
  return {
    queueLength: emailQueue.length,
    isProcessing,
    pendingEmails: emailQueue.map(email => ({
      id: email.id,
      type: email.type,
      to: email.to,
      timestamp: email.timestamp
    }))
  };
};

module.exports = {
  generateOTP,
  sendVerificationEmailAsync,
  sendPasswordResetOTPAsync,
  getQueueStatus,
  processEmailQueue
};
