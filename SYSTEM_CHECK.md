# SYSTEM STATUS CHECK

## Backend API
curl http://localhost:5000/api/health

Expected: {"status":"OK","message":"Server is running"}

## Frontend
http://localhost:3000

Expected: Login page

## MongoDB
netstat -ano | findstr :27017

Expected: LISTENING on port 27017

## Quick Test
1. Open http://localhost:3000 in browser
2. Click Register
3. Create account
4. Should see Dashboard

If Dashboard is empty or loading, the API calls may have failed.
Check browser console (F12) for errors.

## Common Issues

1. CORS Error - Check browser console
   Solution: Make sure backend is running on port 5000

2. Network Error - Cannot connect to API
   Solution: Check if backend is running (npm run dev in backend folder)

3. Loading forever - Stuck on spinner
   Solution: Check if MongoDB is running (mongod)

4. "Cannot read property X of undefined" - Data format issue
   Solution: Clear browser cache and reload
