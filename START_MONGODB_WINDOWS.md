# 🍃 Starting MongoDB on Windows

## Your Backend is Running! ✅

Good news: Your backend server is running successfully on port 3001!

The only issue is that **MongoDB is not running**. Here's how to fix it:

## Quick Fix - Start MongoDB

### Option 1: Start MongoDB Service (Recommended)
```bash
net start MongoDB
```

If you get "service name is invalid", try:
```bash
net start "MongoDB Server"
```

### Option 2: Check if MongoDB is Installed
```bash
mongosh --version
```

If not installed, you have two options:

## Installing MongoDB

### Option A: Install MongoDB Community Edition

1. Download from: https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Complete" installation
4. Check "Install MongoDB as a Service"
5. After installation, MongoDB will start automatically

### Option B: Use MongoDB with Docker (Easier!)

If you have Docker installed:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

To stop it later:
```bash
docker stop mongodb
```

To start it again:
```bash
docker start mongodb
```

## Verify MongoDB is Running

Once MongoDB is started, check if it's working:
```bash
mongosh
```

You should see:
```
Current Mongosh Log ID: ...
Connecting to: mongodb://127.0.0.1:27017/
Using MongoDB: 7.x.x
```

Type `exit` to quit mongosh.

## Check Your Backend

Once MongoDB is running, your backend will automatically connect! Check the logs:

The backend will show:
```
✅ Connected to MongoDB
✅ Database indexes created successfully
```

Then test it:
- Open: http://localhost:3001/health
- You should see: `"database": "connected"`

## Your Backend is Already Running!

I've already started your backend in development mode. It's running on:
- **Port**: 3001
- **Health Check**: http://localhost:3001/health
- **API Base**: http://localhost:3001/api/v1

Once MongoDB is running, you can:
1. ✅ Test the backend: http://localhost:3001/health
2. ✅ Start your mobile app in Android Studio
3. ✅ Try creating an account - it should work!

## Common MongoDB Issues

### Issue: "net start MongoDB" says service doesn't exist
**Solution**: MongoDB might not be installed as a service. Use Docker instead or reinstall MongoDB with "Install as Service" checked.

### Issue: Port 27017 already in use
**Solution**: MongoDB might already be running!
```bash
# Check if MongoDB is running
tasklist | findstr mongod
```

### Issue: Can't connect to MongoDB
**Solution**: Make sure MongoDB is listening on 127.0.0.1:27017
Check your MongoDB config file (usually at `C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg`)

## Alternative: Use MongoDB Atlas (Cloud)

If you don't want to install MongoDB locally:

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create a free cluster
3. Get your connection string
4. Update `.env` in `nyumbasync_backend`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nyumbasync
   ```

## Summary

Your backend is running perfectly! Just need to:
1. Start MongoDB: `net start MongoDB` or use Docker
2. Backend will auto-connect
3. Test: http://localhost:3001/health
4. Start mobile app and test signup!

🎉 You're almost there!
