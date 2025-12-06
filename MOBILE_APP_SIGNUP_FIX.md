# Mobile App Signup Error - Fixed! 🎉

## Problem Identified
Your mobile app was failing to create accounts because:
1. **Hardcoded placeholder URL**: SignupScreen was using `'YOUR_API_URL/auth/signup'` instead of the actual backend API
2. **Wrong localhost address**: Android emulator can't access `localhost:3001` (that refers to the emulator itself, not your computer)
3. **Missing API integration**: The signup flow wasn't properly connected to your backend

## What Was Fixed

### 1. Updated SignupScreen.js
- ✅ Replaced hardcoded URL with proper API configuration
- ✅ Added proper imports for `apiClient` and `API_CONFIG`
- ✅ Removed unnecessary OTP verification step (not needed for email/password signup)
- ✅ Added proper error handling with detailed error messages
- ✅ Simplified the signup flow to match backend expectations

### 2. Updated apiConfig.js
- ✅ Changed default development URL from `http://localhost:3001/api` to `http://10.0.2.2:3001/api`
- ✅ `10.0.2.2` is the special IP address that Android emulator uses to access the host machine's localhost

## How to Test

### Step 1: Start Your Backend Server
```bash
cd nyumbasync_backend
npm start
```

The server should start on port 3001. You should see:
```
✅ Connected to MongoDB
✅ Auth routes registered at /api/v1/auth
🚀 Server running on port 3001
```

### Step 2: Verify Backend is Running
Open your browser and go to: `http://localhost:3001/health`

You should see:
```json
{
  "status": "healthy",
  "database": "connected",
  ...
}
```

### Step 3: Run Your Mobile App
In Android Studio:
1. Start the emulator
2. Run the app
3. Navigate to the signup screen
4. Fill in the form:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Phone: +254712345678 (optional)
   - Role: Select any role
   - Password: password123
   - Confirm Password: password123
5. Click "Create Account"

### Step 4: Expected Result
- ✅ Account should be created successfully
- ✅ You'll see "Account created successfully!" alert
- ✅ You'll be redirected to the Login screen

## Important Notes for Different Scenarios

### If Using Physical Android Device
If you're testing on a physical device instead of emulator, you need to:

1. Find your computer's IP address:
   ```bash
   # On Windows
   ipconfig
   # Look for "IPv4 Address" under your active network adapter
   # Example: 192.168.1.100
   ```

2. Update `NyumbaSyncMobile/src/config/apiConfig.js`:
   ```javascript
   case 'development':
   default:
     // Replace with your computer's IP address
     return process.env.API_URL || 'http://192.168.1.100:3001/api';
   ```

3. Make sure your phone and computer are on the same WiFi network

### If Using iOS Simulator
iOS simulator can access `localhost` directly, so you can use:
```javascript
return process.env.API_URL || 'http://localhost:3001/api';
```

### If Backend is on Different Port
If your backend runs on a different port (like 10000), update the URL:
```javascript
return process.env.API_URL || 'http://10.0.2.2:10000/api';
```

## Troubleshooting

### Error: "Network request failed"
**Cause**: Backend server is not running or not accessible

**Solutions**:
1. Make sure backend is running: `cd nyumbasync_backend && npm start`
2. Check if backend is accessible: Open `http://localhost:3001/health` in browser
3. Verify the port number matches in both backend and mobile config
4. Check firewall settings - make sure port 3001 is not blocked

### Error: "Failed to create account"
**Cause**: Backend validation error or database issue

**Solutions**:
1. Check backend console logs for detailed error messages
2. Make sure MongoDB is running and connected
3. Verify all required fields are filled in the form
4. Check if email is already registered (try a different email)

### Error: "Validation failed"
**Cause**: Missing required fields or invalid data format

**Solutions**:
1. Make sure firstName, lastName, email, and password are filled
2. Email must be valid format (contains @)
3. Password must be at least 6 characters
4. Phone number (if provided) should be in format: +254712345678

### Backend Not Starting
**Cause**: Missing environment variables or dependencies

**Solutions**:
1. Create `.env` file in `nyumbasync_backend/`:
   ```env
   NODE_ENV=development
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/nyumbasync
   JWT_SECRET=your-secret-key-min-32-characters-long
   JWT_REFRESH_SECRET=your-refresh-secret-min-32-characters
   ```

2. Install dependencies:
   ```bash
   cd nyumbasync_backend
   npm install
   ```

3. Make sure MongoDB is running:
   ```bash
   # Check if MongoDB is running
   mongosh
   ```

## Testing the Complete Flow

1. **Signup**: Create a new account with the fixed signup screen
2. **Login**: Use the credentials to login
3. **Verify**: Check that you can access protected routes

## API Endpoint Reference

The signup endpoint being used:
- **URL**: `POST /api/v1/auth/signup`
- **Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+254712345678",
    "password": "password123",
    "role": "tenant"
  }
  ```
- **Success Response**:
  ```json
  {
    "token": "jwt-token-here",
    "refreshToken": "refresh-token-here",
    "user": {
      "id": "user-id",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "tenant",
      "phone": "+254712345678"
    }
  }
  ```

## Next Steps

After successful signup, you might want to:
1. ✅ Test the login flow
2. ✅ Test password reset functionality
3. ✅ Test role-specific features (tenant, landlord, etc.)
4. ✅ Test on physical device with your computer's IP

## Summary

The issue was that your mobile app wasn't properly connected to your backend API. The fixes ensure:
- ✅ Proper API endpoint configuration
- ✅ Correct network addressing for Android emulator
- ✅ Proper error handling and user feedback
- ✅ Simplified signup flow matching backend expectations

Your signup should now work perfectly! 🚀
