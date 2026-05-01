# 🚀 COMPLETE STARTUP GUIDE

## Current Status

Based on your report:
- ✅ MongoDB is running (mongod process active)
- ✅ Backend is running (npm run dev in backend folder)
- ✅ Frontend is running (npm run dev in frontend folder)
- ❌ Frontend showing error page

## The Problem

The frontend is trying to fetch data from the backend API but failing.
This is likely a CORS or connection issue.

## Solution Steps

### Step 1: Stop All Services

Press Ctrl+C in each terminal window (3 windows).

### Step 2: Restart All Services Properly

**Terminal 1 - MongoDB:**
```cmd
mongod
```
Leave this running.

**Terminal 2 - Backend:**
```cmd
cd C:\Users\vikas_kvbdg9z\OneDrive\Desktop\Projects\Student task manager MERN\backend
npm run dev
```
Wait for: "Server running on port 5000"
Leave this running.

**Terminal 3 - Frontend:**
```cmd
cd C:\Users\vikas_kvbdg9z\OneDrive\Desktop\Projects\Student task manager MERN\frontend
npm run dev
```
Wait for: "Local: http://localhost:3000"
Leave this running.

### Step 3: Test the Connection

Open browser to: **http://localhost:3000**

### Step 4: If Still Not Working

**Check 1: Verify Backend is Responding**
```cmd
node -e "const http = require('http'); const req = http.request('http://localhost:5000/api/health', (res) => { let data = ''; res.on('data', c => data += c); res.on('end', () => console.log('Backend OK:', data)); }); req.end();"
```
Should print: Backend OK: {"status":"OK","message":"Server is running"}

**Check 2: Verify Frontend is Serving**
Open browser to: **http://localhost:3000**
Should see the login page

**Check 3: Check Browser Console**
Press F12 in browser
Go to Console tab
Look for red error messages

## What You Should See

### Terminal 1 (MongoDB):
```
{"t":{...},"s":"I",...,"MongoDB starting"}
{"t":{...},"s":"I",...,"Waiting for connections","attr":{"port":27017}}
```

### Terminal 2 (Backend):
```
Server running on port 5000
MongoDB Connected: localhost
```

### Terminal 3 (Frontend):
```
VITE v8.0.10  ready in 400 ms
Local:   http://localhost:3000/
```

### Browser:
```
http://localhost:3000

Login Page
┌─────────────────────────────────────────┐
│  Sign in to your account                │
│                                         │
│  [Email address]                        │
│  [Password]                             │
│                                         │
│  [Sign in]                              │
│                                         │
│  Don't have an account? Register here   │
└─────────────────────────────────────────┘
```

## Quick Fix for Current Issue

If frontend is showing error, try:

1. **Hard Refresh Browser**
   - Windows: Ctrl + F5
   - Mac: Cmd + Shift + R

2. **Clear Browser Cache**
   - Press F12
   - Right-click refresh button
   - Select "Empty Cache and Hard Reload"

3. **Check for Errors**
   - Press F12
   - Go to Console tab
   - Look for red error messages
   - Tell me what you see

## Common Error Messages and Fixes

### Error: "Failed to fetch"
**Cause:** Cannot connect to backend API
**Fix:** 
- Make sure backend is running (npm run dev in backend folder)
- Check if port 5000 is being used: `netstat -ano | findstr :5000`
- Kill anything on port 5000 if needed

### Error: "CORS"
**Cause:** Cross-origin request blocked
**Fix:**
- Backend is configured for CORS correctly
- Make sure you're accessing frontend at http://localhost:3000
- Not https or different port

### Error: "Network Error" or "ERR_CONNECTION_REFUSED"
**Cause:** Backend not running
**Fix:**
- Start backend: `cd backend && npm run dev`
- Check it says "Server running on port 5000"

### Error: "Cannot read property X of undefined"
**Cause:** Data format mismatch
**Fix:**
- Frontend code updated to handle undefined
- Hard refresh browser (Ctrl+F5)
- Clear browser cache

## Final Verification

After all services are running:

1. Open browser to **http://localhost:3000**
2. Click "Register"
3. Fill in: Name, Email, Password
4. Click "Create Account"
5. Should see Dashboard with statistics
6. Try adding a task

If it works: ✅ SUCCESS!

If not: Tell me what error you see in browser (press F12)

## Need Help?

Tell me:
1. What do you see in browser?
2. What errors in browser console (F12)?
3. What do the 3 terminals say?

I'll help you fix it! 🚀