# Quick Start Guide

## Immediate Setup (3 Steps)

### Step 1: Start MongoDB
Make sure MongoDB is running on your system:
```bash
# If using local MongoDB
mongod

# Or if using Docker
docker run -d -p 27017:27017 mongo:latest
```

### Step 2: Start Backend
```bash
cd backend
npm run dev
# Server will start on http://localhost:5000
```

### Step 3: Start Frontend
```bash
cd frontend
npm run dev
# App will start on http://localhost:3000
```

## Your First Task (Once Logged In)

1. Click **"Add New Task"** button
2. Fill in the form:
   - **Title**: "Complete React Tutorial"
   - **Description**: "Finish the task management application"
   - **Subject**: "Computer Science"
   - **Due Date**: Select a future date
   - **Priority**: "High"
   - **Status**: "Pending"
3. Click **"Create Task"**
4. View your task in the list
5. Mark it as completed when done

## Register Your Account

1. Go to `http://localhost:3000/register`
2. Fill in:
   - Full Name: Your Name
   - Email: your.email@example.com
   - Password: Secure password (min 6 chars)
   - Confirm Password: Same password
3. Click **"Create Account"**
4. You're automatically logged in and redirected to dashboard

## Login

1. Go to `http://localhost:3000/login`
2. Enter your email and password
3. Click **"Sign in"**
4. You're redirected to dashboard

## Dashboard Overview

Once logged in, you'll see:
- **Total Tasks**: Count of all your tasks
- **Completed**: Tasks you've finished
- **Pending**: Tasks yet to complete
- **Overdue**: Tasks past their due date
- **Productivity**: Percentage complete
- **Weekly Chart**: Visual progress of completed tasks

## Features Quick Tour

### Task List Page
- View all tasks in a table
- Search tasks by title
- Filter by priority, status, and subject
- Edit or delete tasks
- Toggle completion status

### Calendar View
- Visual calendar with task indicators
- Blue dates = tasks due
- Green dates = tasks completed
- Red dates = overdue tasks
- Click any date to see tasks

### Add/Edit Task
- Create new tasks with full details
- Edit existing tasks
- Set priority levels
- Track due dates
- Organize by subject

## Keyboard Shortcuts

- **Ctrl/Cmd + K**: Focus search
- **Ctrl/Cmd + N**: New task (from task list)
- **Esc**: Close modals/dialogs

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Start MongoDB if not running
mongod
```

### Cannot Connect to Backend
```bash
# Test backend directly
curl http://localhost:5000/api/health

# Should return: {"status":"OK","message":"Server is running"}
```

## Next Steps

1. **Add more tasks** - Try different subjects and priorities
2. **Use calendar view** - Plan your week
3. **Check dashboard** - Monitor your productivity
4. **Set reminders** - Stay on top of deadlines
5. **Explore filters** - Find specific tasks quickly

## Production Deployment

When ready to deploy:
1. See **DEPLOYMENT.md** for detailed instructions
2. Use **MongoDB Atlas** for cloud database
3. Deploy backend to **Render** or **Railway**
4. Deploy frontend to **Vercel** or **Netlify**
5. Update environment variables for production

## Support

- Full documentation: **README.md**
- API documentation: **API.md**
- Deployment guide: **DEPLOYMENT.md**
- Project summary: **PROJECT_SUMMARY.md**

## Example Data

Try these sample tasks to get started:

1. **Math Homework** - Due: Tomorrow - Priority: High
2. **Physics Lab Report** - Due: Next Week - Priority: Medium
3. **English Essay** - Due: Friday - Priority: High
4. **History Quiz Study** - Due: Today - Priority: Medium
5. **Programming Assignment** - Due: Next Monday - Priority: High

---

**Happy Task Management!** 🎓📚✅