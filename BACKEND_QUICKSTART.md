# 🚀 Backend Quick Start Guide

## Get Your Backend Running in 10 Minutes

### Step 1: Create Backend Project (2 minutes)

```bash
# Create directory
mkdir nyumbasync-backend
cd nyumbasync-backend

# Initialize project
npm init -y

# Install dependencies
npm install express mongoose bcryptjs jsonwebtoken dotenv cors express-rate-limit helmet

# Install dev dependencies
npm install --save-dev nodemon
```

### Step 2: Update package.json (1 minute)

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Step 3: Create .env File (1 minute)

```bash
# Create .env file
touch .env
```

Add this content:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/nyumbasync
JWT_SECRET=your_super_secret_key_min_32_characters_long_change_in_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### Step 4: Create Minimal Server (3 minutes)

Create `server.js`:

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  firstName: { type: String, required: true },
  lastName: String,
  role: { type: String, default: 'tenant' },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    
    // Validate
    if (!email || !password || !firstName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email, password, and first name' 
      });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }
    
    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      role: role || 'tenant'
    });
    
    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed',
      error: error.message 
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }
    
    // Find user (include password)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed',
      error: error.message 
    });
  }
});

// Protected route example
app.get('/api/users/profile', async (req, res) => {
  try {
    // Get token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Not authorized' 
    });
  }
});

// Connect to database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Database connected');
    
    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 API available at http://localhost:${PORT}/api`);
    });
  })
  .catch(err => {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  });
```

### Step 5: Install MongoDB (if not installed)

**Option A: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Update MONGODB_URI in .env

**Option B: Local MongoDB**
```bash
# Windows (with Chocolatey)
choco install mongodb

# Mac
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb

# Start MongoDB
mongod
```

### Step 6: Run the Server (1 minute)

```bash
npm run dev
```

You should see:
```
✅ Database connected
🚀 Server running on http://localhost:3000
📝 API available at http://localhost:3000/api
```

### Step 7: Test the API (2 minutes)

**Test 1: Health Check**
```bash
curl http://localhost:3000/api/health
```

**Test 2: Register User**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "tenant"
  }'
```

**Test 3: Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123"
  }'
```

Copy the token from the response!

**Test 4: Get Profile (Protected Route)**
```bash
curl http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Connect Frontend to Backend

### Update Frontend API URL

**Web App:**
```javascript
// nyumbasynctest/.env
VITE_API_URL=http://localhost:3000/api
```

**Mobile App:**
```javascript
// NyumbaSyncMobile/src/services/api.js
const API_URL = 'http://localhost:3000/api';
// For Android emulator use: http://10.0.2.2:3000/api
// For iOS simulator use: http://localhost:3000/api
// For physical device use: http://YOUR_COMPUTER_IP:3000/api
```

### Test Frontend Login

1. Start backend: `npm run dev`
2. Start frontend: `npm run dev` (in nyumbasynctest folder)
3. Go to http://localhost:5173/login
4. Try logging in with the test account

---

## Troubleshooting

### Error: "Cannot connect to MongoDB"
- Make sure MongoDB is running
- Check MONGODB_URI in .env
- Try MongoDB Atlas (cloud) instead

### Error: "Port 3000 already in use"
- Change PORT in .env to 3001
- Or kill process: `npx kill-port 3000`

### Error: "CORS error"
- Check FRONTEND_URL in .env matches your frontend URL
- Make sure backend is running

### Error: "JWT secret not defined"
- Check JWT_SECRET in .env
- Make sure .env file is in root directory

---

## Next Steps

1. ✅ Backend is running
2. ✅ Can register users
3. ✅ Can login users
4. ✅ Passwords are hashed
5. ✅ JWT tokens work

**Now you can:**
- Add more routes (properties, payments, etc.)
- Add more security features
- Deploy to production
- Add database migrations
- Implement MFA
- Add email verification

---

## Production Deployment

### Deploy to Heroku (Free)

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create nyumbasync-api

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your_production_secret
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-frontend-url.com

# Deploy
git init
git add .
git commit -m "Initial backend"
git push heroku master
```

### Deploy to Railway (Recommended)

1. Go to https://railway.app
2. Connect GitHub repo
3. Add MongoDB database
4. Set environment variables
5. Deploy automatically

---

## Summary

You now have:
- ✅ Working backend server
- ✅ Secure password storage (bcrypt)
- ✅ JWT authentication
- ✅ User registration
- ✅ User login
- ✅ Protected routes
- ✅ MongoDB database
- ✅ Ready for production

**Total setup time: ~10 minutes!** 🎉
