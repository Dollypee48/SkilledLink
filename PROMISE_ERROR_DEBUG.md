# Promise Error Debug Guide

## Error Analysis

### **Error: "Uncaught (in promise) Object"**
This error occurs when:
1. A promise is rejected but not properly caught
2. The error object is not properly serialized for console logging
3. Network requests fail without proper error handling

## What I've Fixed

### **1. Enhanced Registration Error Handling**
✅ **Improved fetch error handling** in `Register.jsx`:
- Added proper response status checking before JSON parsing
- Added separate error handling for failed responses vs network errors
- Added specific error messages for different error types
- Added fallback error messages when JSON parsing fails

### **2. Recreated API Configuration**
✅ **Recreated `frontend/src/config/api.js`**:
- Centralized API URL configuration
- Dynamic environment detection (local vs production)
- Proper endpoint definitions

### **3. Added Global Error Handler**
✅ **Added global error handling** in `App.jsx`:
- Catches unhandled promise rejections
- Catches global JavaScript errors
- Provides detailed error logging
- Prevents default browser error behavior

## How to Debug

### **1. Check Console Logs**
Open browser console (F12) and look for:
```
🚀 Attempting registration with: [object details]
📡 Registration response status: [status code]
📡 Registration response data: [response data]
```

### **2. Common Issues & Solutions**

#### **Issue 1: Network Error**
**Symptoms**: `TypeError: Failed to fetch`
**Solution**: 
- Check if backend is running on port 5000
- Verify API URL in console logs
- Check CORS configuration

#### **Issue 2: Server Error**
**Symptoms**: Status 500, 400, etc.
**Solution**:
- Check backend logs
- Verify request data format
- Check database connection

#### **Issue 3: JSON Parse Error**
**Symptoms**: `SyntaxError: Unexpected token`
**Solution**:
- Server returning non-JSON response
- Check backend response format
- Verify Content-Type headers

### **3. Testing Steps**

1. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   # Should see: "Server running on port 5000"
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   # Should see: "Local: http://localhost:5173"
   ```

3. **Test Registration**:
   - Go to http://localhost:5173/register
   - Open browser console (F12)
   - Fill out registration form
   - Click "Create Account"
   - Watch console logs

### **4. Expected Console Output**

**Successful Registration**:
```
🔧 API Configuration: {environment: "development", baseUrl: "http://localhost:5000/api", ...}
🚀 Attempting registration with: {name: "...", email: "...", role: "customer", ...}
📡 Registration response status: 201
📡 Registration response data: {message: "Registration successful...", user: {...}}
✅ Registration successful, redirecting to verification...
```

**Failed Registration**:
```
🚀 Attempting registration with: {name: "...", email: "...", role: "customer", ...}
📡 Registration response status: 400
❌ Registration failed with error data: {message: "Email already registered"}
```

**Network Error**:
```
🚀 Attempting registration with: {name: "...", email: "...", role: "customer", ...}
❌ Registration error: TypeError: Failed to fetch
❌ Error details: {name: "TypeError", message: "Failed to fetch", ...}
```

## API Endpoints

### **Local Development**
- Registration: `http://localhost:5000/api/auth/register`
- Verification: `http://localhost:5000/api/auth/verify-code`

### **Production**
- Registration: `https://skilledlink-1.onrender.com/api/auth/register`
- Verification: `https://skilledlink-1.onrender.com/api/auth/verify-code`

## Backend Requirements

Make sure your backend is properly configured:

1. **CORS**: Should allow `http://localhost:5173`
2. **Database**: MongoDB should be running
3. **Environment**: Should have proper environment variables
4. **Email**: Should have email service configured

## Next Steps

1. **Test the registration flow** with the improved error handling
2. **Check console logs** for detailed error information
3. **Verify backend is running** and accessible
4. **Check network tab** in browser dev tools for request details

The improved error handling should now provide much clearer information about what's going wrong! 🎉
