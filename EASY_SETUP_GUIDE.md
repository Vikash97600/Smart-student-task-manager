# 🎬 EASY STEP-BY-STEP GUIDE - Complete Instructions

## 📍 WHAT YOU NEED (Check First)

### Your Computer Should Have:
1. Node.js installed (check by typing: node --version)
2. MongoDB database running
3. About 10 minutes of time

---

## 🚦 STEP 1: CHECK IF YOU HAVE NODE.JS

Open your Command Prompt (Windows) or Terminal (Mac):

**Type this command:**
```cmd
node --version
```

**You should see something like:**
```
v24.11.1
```

✅ If you see a version number, you're good!
❌ If not, download from: https://nodejs.org/

---

## 🗄️ STEP 2: START MONGODB (DATABASE)

MongoDB is where your data is stored. It must be running first.

### Option A: If MongoDB is Installed Locally

**Open a NEW Command Prompt window and type:**
```cmd
mongod
```

**You should see:**
```
{"t":{...},"s":"I","c":"CONTROL",...,"MongoDB starting"}
```

**⚠️ LEAVE THIS WINDOW OPEN!** Don't close it.

---

### Option B: If Using MongoDB Atlas (Cloud - FREE)

1. Go to https://www.mongodb.com/atlas
2. Create free account
3. Build database cluster
4. Add connection IP: 0.0.0.0/0
5. Create database user
6. Copy connection string

**Then update backend/.env file:**
```
MONGODB_URI=your-copied-string
```

---

## 📁 STEP 3: OPEN PROJECT FOLDER

Open a NEW Command Prompt window:

**Type these commands (press Enter after each):**
```cmd
cd C:\Users\vikas_kvbdg9z\OneDrive\Desktop\Projects\Student task manager MERN
ls
```

**You should see:**
```
backend/
frontend/
README.md
```

✅ Good! You're in the right place.

---

## 🔧 STEP 4: INSTALL BACKEND PACKAGES

**In the same window, type:**
```cmd
cd backend
npm install
```

**Wait for it to finish...**

**You should see:**
```
added 103 packages
```

✅ Backend packages installed!

---

## 🌐 STEP 5: START BACKEND SERVER

**In the same window, type:**
```cmd
npm run dev
```

**You should see:**
```
Server running on port 5000
MongoDB Connected: localhost
```

✅ Backend is running!

**⚠️ DO NOT CLOSE THIS WINDOW! Keep it running.**

---

## 🎨 STEP 6: INSTALL FRONTEND PACKAGES

**Open a BRAND NEW Command Prompt window**

**Type these commands:**
```cmd
cd C:\Users\vikas_kvbdg9z\OneDrive\Desktop\Projects\Student task manager MERN\frontend
npm install
```

**Wait for it to finish...**

**You should see:**
```
added 52 packages
```

✅ Frontend packages installed!

---

## 🎯 STEP 7: START FRONTEND SERVER

**In the same window, type:**
```cmd
npm run dev
```

**You should see:**
```
VITE v8.0.10 ready in 777 ms
Local:   http://localhost:3000/
```

✅ Frontend is running!

**⚠️ DO NOT CLOSE THIS WINDOW EITHER!**

---

## 🎉 STEP 8: OPEN YOUR APPLICATION

**Now open your Web Browser** (Chrome, Edge, Firefox)

**Type this in the address bar:**
```
http://localhost:3000
```

**Press Enter**

🎊 YOU SHOULD SEE THE LOGIN PAGE!

---

## 📝 STEP 9: CREATE YOUR ACCOUNT

**On the webpage:**

1. Click **"Register"** link (top right corner)
2. Fill the form:
   - Name: Your Name (e.g., "John Student")
   - Email: Your email (e.g., "john@example.com")
   - Password: Any password (min 6 letters, e.g., "mypassword")
   - Confirm Password: Same password again
3. Click **"Create Account"** button

✅ YOU ARE NOW LOGGED IN!

---

## 🎓 STEP 10: TRY THE APP

### Create Your First Task:
1. Click **"Add New Task"** button
2. Fill in:
   - Title: "My First Homework"
   - Description: "Complete math problems"
   - Subject: "Mathematics"
   - Due Date: Pick tomorrow's date
   - Priority: "High"
   - Status: "Pending"
3. Click **"Create Task"**

✅ Task Created!

### Explore:
- **Dashboard**: See your stats and charts
- **Tasks**: View all your tasks
- **Calendar**: See tasks on calendar
- **Filters**: Filter tasks by subject or priority

---

## 🛑 HOW TO STOP

When you want to stop:

1. Go to each Command Prompt window
2. Press **Ctrl + C** on keyboard
3. Press **Y** then **Enter**
4. Close the windows

---

## 🚨 TROUBLESHOOTING (If Something Goes Wrong)

### Problem: "Port 5000 already in use"

**Solution (Windows):**
```cmd
netstat -ano | findstr :5000
taskkill /PID [NUMBER] /F
```
Then restart backend: `npm run dev`

---

### Problem: "Port 3000 already in use"

**Solution (Windows):**
```cmd
netstat -ano | findstr :3000
taskkill /PID [NUMBER] /F
```
Then restart frontend: `npm run dev`

---

### Problem: "MongoDB Connection Error"

**Solution:**
1. Make sure Step 2 (mongod) is running
2. Check if you see "MongoDB starting" in that window
3. If not, run `mongod` again

---

### Problem: "npm install fails"

**Solution:**
```cmd
npm cache clean --force
npm install
```

---

## 📊 WHAT YOU SHOULD SEE NOW

### Window 1 (MongoDB):
```
{"t":{...},"MongoDB starting"}
```
✅ Running

### Window 2 (Backend):
```
Server running on port 5000
MongoDB Connected: localhost
```
✅ Running

### Window 3 (Frontend):
```
Local:   http://localhost:3000/
```
✅ Running

### Browser:
```
Dashboard with your tasks
📊 Charts and statistics
📅 Calendar with your tasks
✅ All working!
```
✅ Running

---

## 💡 IMPORTANT REMINDERS

1. **Keep all 3 windows open** while using the app
2. **Don't close** the Command Prompt windows
3. **Browser** is where you use the app
4. **Changes save automatically** to database
5. **Data persists** - it's saved in MongoDB

---

## 🎯 QUICK REFERENCE

| What to Do | Command |
|------------|---------|
| Check Node.js | node --version |
| Start Database | mongod |
| Install Backend | cd backend && npm install |
| Run Backend | npm run dev |
| Install Frontend | cd frontend && npm install |
| Run Frontend | npm run dev |
| Open App | http://localhost:3000 |
| Stop App | Ctrl + C |

---

## ✅ YOU DID IT!

You now have a fully working Student Task Manager!

**Features You Can Use:**
- ✅ Add homework and assignments
- ✅ Set due dates
- ✅ Mark tasks complete
- ✅ View your productivity
- ✅ Plan with calendar
- ✅ Track your progress

**Happy Task Managing!** 🎓📚✅

---

## 🆘 NEED MORE HELP?

If you get stuck:

1. Check all windows are running
2. Check for error messages (in red)
3. Try stopping everything (Ctrl+C) and starting again
4. Make sure MongoDB is running first
5. Check browser console (F12) for errors

**Common Mistake:** Forgetting to open MongoDB first. Always start MongoDB before the backend!

---

## 🌟 BONUS: What's Happening Behind the Scenes?

- **Frontend** (React): What you see in browser
- **Backend** (Node/Express): Processes your requests
- **Database** (MongoDB): Saves all your data
- **API**: Connects frontend and backend

It's like a restaurant:
- Frontend = Menu and waiter
- Backend = Kitchen
- Database = Food storage
- You = Customer

🍽️ **Enjoy your meal (app)!**

---

**Questions? Re-read the steps or check README.md for more details!**