const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'your-email@gmail.com',
      pass: process.env.SMTP_PASS || 'your-app-password'
    }
  });
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email with code
const sendVerificationEmail = async (email, verificationCode, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'SkilledLink'}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify Your Email Address - Verification Code',
      html: `
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
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

// Send verification email with link (legacy - keeping for backward compatibility)
const sendVerificationEmailWithLink = async (email, verificationToken, userName) => {
  try {
    const transporter = createTransporter();
    
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
    
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'SkilledLink'}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #151E3D;">Welcome to ${process.env.APP_NAME || 'SkilledLink'}!</h2>
          <p>Hi ${userName},</p>
          <p>Thank you for registering with us. Please verify your email address to complete your registration.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #151E3D; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 24 hours. If you didn't create an account, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            © ${new Date().getFullYear()} ${process.env.APP_NAME || 'SkilledLink'}. All rights reserved.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset OTP email
const sendPasswordResetOTP = async (email, otp, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'SkilledLink'}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Verification Code',
      html: `
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

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset OTP sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset OTP:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email (legacy - using token)
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'SkilledLink'}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #151E3D;">Password Reset Request</h2>
          <p>Hi ${userName},</p>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #151E3D; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateVerificationToken,
  generateOTP,
  sendVerificationEmail,
  sendVerificationEmailWithLink,
  sendPasswordResetOTP,
  sendPasswordResetEmail
};
