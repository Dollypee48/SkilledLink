# Registration Flow Debug Guide

## Issue Description
When a user registers, they should be navigated to the email verification page, but instead they remain on the registration page. When they try to register again, they get an "already registered" error.

## What I've Fixed

### 1. **Updated API Configuration**
- ✅ Created centralized API configuration in `frontend/src/config/api.js`
- ✅ Updated all auth pages to use the centralized configuration
- ✅ Registration now uses dynamic API URL (local vs production)

### 2. **Updated Auth Pages**
- ✅ `Register.jsx` - Now uses `API_ENDPOINTS.auth`
- ✅ `VerifyCode.jsx` - Now uses `API_ENDPOINTS.auth`
- ✅ `ForgotPassword.jsx` - Now uses `API_ENDPOINTS.auth`
- ✅ `ResetPassword.jsx` - Now uses `API_ENDPOINTS.auth`

### 3. **Enhanced Debugging**
- ✅ Added detailed console logging to registration flow
- ✅ Added email tracking in VerifyCode page
- ✅ Added error details logging

## How to Test

### 1. **Start the Application**
```bash
# Backend
cd backend
npm run dev

# Frontend (in new terminal)
cd frontend
npm run dev
```

### 2. **Test Registration Flow**
1. Go to http://localhost:5173/register
2. Fill out the registration form
3. Open browser console (F12) to see debug logs
4. Click "Create Account"

### 3. **Expected Behavior**
- ✅ Registration should succeed (status 201)
- ✅ Should navigate to `/verify-code` page
- ✅ Email should be stored in localStorage
- ✅ Console should show success logs

### 4. **Debug Information**
The console will show:
- 🚀 Registration attempt details
- 📡 API response status and data
- ✅ Success confirmation
- 🔍 Email tracking in VerifyCode page

## Common Issues & Solutions

### Issue 1: Network Error
**Symptoms**: Console shows network error
**Solution**: 
- Check if backend is running on port 5000
- Verify API URL in console logs
- Check CORS configuration

### Issue 2: Registration Stays on Same Page
**Symptoms**: No navigation after successful registration
**Solution**:
- Check console for error messages
- Verify response status is 201
- Check if navigate function is working

### Issue 3: "Already Registered" Error
**Symptoms**: User gets error on second registration attempt
**Solution**:
- This is expected behavior
- User should check email for verification code
- Or use "Click here to login instead" link

## API Endpoints Used

### Local Development
- Registration: `http://localhost:5000/api/auth/register`
- Verification: `http://localhost:5000/api/auth/verify-code`
- Resend: `http://localhost:5000/api/auth/resend-verification`

### Production
- Registration: `https://skilledlink-1.onrender.com/api/auth/register`
- Verification: `https://skilledlink-1.onrender.com/api/auth/verify-code`
- Resend: `https://skilledlink-1.onrender.com/api/auth/resend-verification`

## Backend Registration Flow
1. User submits registration form
2. Backend validates data
3. Checks if email already exists
4. Creates user with `isVerified: false`
5. Generates verification code
6. Sends verification email
7. Returns 201 status with message
8. Frontend navigates to verification page

## Next Steps
1. Test the registration flow
2. Check console logs for any errors
3. Verify email is received
4. Test verification code submission
5. Test resend functionality

If issues persist, check the console logs and share the error details.
