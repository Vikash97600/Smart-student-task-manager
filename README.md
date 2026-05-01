# Smart Student Task Manager

A comprehensive MERN stack application designed to help students manage their tasks, track assignments, monitor deadlines, and improve productivity.

## Features

### Authentication System
- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes

### Task Management
- Create, read, update, delete tasks
- Mark tasks as completed/pending
- Task categorization by subject
- Priority levels (High, Medium, Low)
- Due date tracking

### Dashboard
- Total tasks count
- Completed vs pending tasks
- Overdue task alerts
- Productivity percentage
- Weekly progress chart

### Calendar View
- Visual calendar with task indicators
- Color-coded dates (blue = tasks, green = completed, red = overdue)
- Daily task listing

### Search and Filters
- Search by task title
- Filter by priority, status, subject

### Productivity Tracking
- Daily/weekly task completion tracking
- Streak calculation

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose ODM)
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React 19
- React Router DOM
- Redux Toolkit (state management)
- Chart.js (data visualization)
- React Calendar
- Axios (API calls)
- Vite (build tool)

## Project Structure

```
backend/
├── config/
│   └── db.js          # Database connection
├── controllers/
│   ├── authController.js
│   └── taskController.js
├── middleware/
│   ├── authMiddleware.js
│   └── errorMiddleware.js
├── models/
│   ├── User.js
│   └── Task.js
├── routes/
│   ├── authRoutes.js
│   └── taskRoutes.js
├── .env                 # Environment variables
├── .gitignore
├── index.js            # Server entry point
└── package.json

frontend/
├── src/
│   ├── components/
│   │   ├── Layout.js
│   │   └── ProtectedRoute.js
│   ├── context/
│   │   ├── store.js
│   │   ├── authSlice.js
│   │   └── taskSlice.js
│   ├── pages/
│   │   ├── DashboardPage.js
│   │   ├── TaskListPage.js
│   │   ├── TaskFormPage.js
│   │   ├── CalendarPage.js
│   │   ├── LoginPage.js
│   │   └── RegisterPage.js
│   ├── services/
│   │   └── api.js
│   ├── styles/
│   │   └── index.css
│   ├── App.js
│   └── index.js
├── vite.config.js
└── package.json
```

## Database Schema

### User Schema
```javascript
{
  name: String (required, max 50)
  email: String (required, unique, lowercase)
  password: String (required, min 6)
  role: String (enum: ['user', 'admin'], default: 'user')
  createdAt: Date (default: Date.now)
}
```

### Task Schema
```javascript
{
  title: String (required, max 100)
  description: String (max 500)
  subject: String (required)
  dueDate: Date (required)
  priority: String (enum: ['High', 'Medium', 'Low'], default: 'Medium')
  status: String (enum: ['Pending', 'Completed'], default: 'Pending')
  createdBy: ObjectId (ref: User, required)
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Tasks (Requires Authentication)
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/dashboard/stats` - Get dashboard statistics

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student_task_manager
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_SERVICE=gmail
```

4. Start development server:
```bash
npm run dev
```

5. For production:
```bash
npm start
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. For production build:
```bash
npm run build
```

## Running the Application

1. Start MongoDB (if using local):
```bash
mongod
```

2. Start backend server:
```bash
cd backend && npm run dev
```

3. Start frontend development server:
```bash
cd frontend && npm run dev
```

4. Access the application at `http://localhost:3000`

## Deployment Guide

### MongoDB Atlas

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create new cluster (M0 free tier available)
3. Add database user with username/password
4. Add IP address to network access (0.0.0.0/0 for testing)
5. Get connection string:
```
mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/student_task_manager?retryWrites=true&w=majority
```
6. Update `.env` file with new URI

### Backend Deployment (Render)

1. Create account at [Render](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Configure settings:
   - Environment: Node
   - Build command: `npm install`
   - Start command: `npm start`
   - Add environment variables
5. Deploy

### Frontend Deployment (Vercel)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
cd frontend
vercel
```

4. Update CORS origin in backend `.env`:
```env
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Environment Variables for Production

```env
# Backend
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/db
JWT_SECRET=strong-random-string-here
JWT_EXPIRES_IN=7d

# Email (for notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## Testing

### Manual Testing

1. Register a new user
2. Login with credentials
3. Create tasks with different priorities
4. Mark tasks as completed
5. View dashboard statistics
6. Test calendar view
7. Test search and filters

### API Testing

Use Postman or curl to test endpoints:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Create task (with authentication)
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"Math Homework","subject":"Math","dueDate":"2026-12-01","priority":"High"}'
```

## Security Considerations

1. **Password Hashing**: All passwords are hashed with bcrypt before storage
2. **JWT Tokens**: Secure token-based authentication
3. **CORS**: Configured to allow only trusted origins in production
4. **Input Validation**: Mongoose schema validation
5. **Error Handling**: Generic error messages in production
6. **HTTP Only Cookies**: JWT stored in HTTP-only cookies
7. **Environment Variables**: Sensitive data stored in `.env`

## Best Practices

- MVC architecture pattern
- RESTful API design
- Modular code structure
- Async/await for asynchronous operations
- Proper error handling
- Input validation
- Database indexing for performance
- Environment-based configuration
- CORS configuration
- Helmet.js for security headers (can be added)

## Future Enhancements

1. Email notifications for upcoming deadlines
2. Google Calendar integration
3. Task sharing/collaboration
4. File attachments
5. Reminder system
6. Mobile app
7. Dark mode
8. Advanced analytics
9. Study time tracking
10. Goal setting and tracking

## License

MIT License

## Author

Smart Student Task Manager Team