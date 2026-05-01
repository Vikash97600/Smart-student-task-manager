# Student Task Manager - Fix Plan

## Issues Identified

### 1. Backend Issues

#### Issue 1.1: Async Error Handling in Controllers
- **Problem**: Express 5 doesn't automatically catch async errors. Errors in async controller functions are not properly caught by errorMiddleware
- **Affected files**: 
  - `backend/controllers/authController.js`
  - `backend/controllers/taskController.js`
- **Fix**: Wrap async controller functions with try-catch blocks that pass errors to next()

#### Issue 1.2: Dashboard Weekly Stats Index Mismatch
- **Problem**: MongoDB's `$dayOfWeek` returns 1-7 (1=Sunday, 7=Saturday), but the code assumes 0-6
- **Affected file**: `backend/controllers/taskController.js`
- **Fix**: Adjust array index offset in weeklyData assignment (item._id - 1 is correct, but needs to handle missing days properly)

#### Issue 1.3: Cookie Options Mismatch
- **Problem**: Cookie sameSite 'strict' may not work with cross-origin requests in development
- **Affected file**: `backend/controllers/authController.js`
- **Fix**: Change sameSite to 'lax' for development

### 2. Frontend Issues

#### Issue 2.1: Missing Async Thunk Error Handling
- **Problem**: createTask, updateTaskAsync, deleteTaskAsync don't handle error cases in extraReducers
- **Affected file**: `frontend/src/context/taskSlice.js`
- **Fix**: Add .addCase for .rejected states for create, update, delete operations

#### Issue 2.2: Direct API Calls in Login/Register Pages
- **Problem**: LoginPage and RegisterPage make direct API calls instead of using Redux thunks
- **Affected files**: 
  - `frontend/src/pages/LoginPage.jsx`
  - `frontend/src/pages/RegisterPage.jsx`
- **Fix**: Use authSlice thunks or handle response properly

#### Issue 2.3: Auth Service Response Structure
- **Problem**: Auth service checkAuth returns response.data but error handling expects different structure
- **Affected files**: 
  - `frontend/src/index.jsx`
  - `frontend/src/services/api.js`
- **Fix**: Ensure proper error handling with axios interceptors

#### Issue 2.4: TaskFormPage Missing Loading State for Update
- **Problem**: Loading state doesn't reset properly after form submission
- **Affected file**: `frontend/src/pages/TaskFormPage.jsx`
- **Fix**: Add proper loading state management

#### Issue 2.5: Tailwind CSS v4 Configuration
- **Problem**: Tailwind v4 requires different setup than v3. CSS imports may not work properly
- **Affected files**: 
  - `frontend/src/styles/index.css`
  - `frontend/postcss.config.cjs`
- **Fix**: Update CSS for Tailwind v4 compatibility or use v3 style config

#### Issue 2.6: Vite Proxy Configuration
- **Problem**: Check if proxy is properly configured for all API endpoints

### 3. Potential Configuration Issues

#### Issue 3.1: CORS Configuration
- **Problem**: CORS origin set to localhost:3000 but frontend runs on port 3000 per vite.config.js
- **Affected file**: `backend/index.js`
- **Fix**: Ensure CORS origin matches frontend port

## Implementation Plan

### Step 1: Fix Backend Controller Error Handling
- Update authController.js to properly handle async errors
- Update taskController.js to properly handle async errors

### Step 2: Fix Frontend Redux State Management
- Update taskSlice.js to handle all error states properly

### Step 3: Fix Tailwind CSS Configuration
- Update styles/index.css for Tailwind v4 or ensure proper v3 compatibility

### Step 4: Fix API Service Error Handling
- Update api.js with proper axios interceptors for error handling
- Update index.jsx to handle auth check properly

### Step 5: Test the Application
- Ensure all functionalities work properly
- Verify CSS is applied correctly
