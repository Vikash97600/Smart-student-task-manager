# API Documentation

## Base URL
`http://localhost:5000/api`

## Authentication

All protected routes require JWT authentication token sent via cookies.

### Register User
`POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Login
`POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

Sets JWT token in HTTP-only cookie.

### Logout
`POST /auth/logout`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Tasks

### Get All Tasks
`GET /tasks`

**Headers:**
- Cookie: jwt=<token>

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "1234567890",
      "title": "Math Homework",
      "description": "Complete algebra problems",
      "subject": "Math",
      "dueDate": "2026-12-01T00:00:00.000Z",
      "priority": "High",
      "status": "Pending",
      "createdBy": "user_id",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

### Create Task
`POST /tasks`

**Headers:**
- Cookie: jwt=<token>

**Request Body:**
```json
{
  "title": "Math Homework",
  "description": "Complete algebra problems",
  "subject": "Math",
  "dueDate": "2026-12-01T00:00:00.000Z",
  "priority": "High",
  "status": "Pending"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "1234567890",
    "title": "Math Homework",
    "description": "Complete algebra problems",
    "subject": "Math",
    "dueDate": "2026-12-01T00:00:00.000Z",
    "priority": "High",
    "status": "Pending",
    "createdBy": "user_id",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

### Get Single Task
`GET /tasks/:id`

**Headers:**
- Cookie: jwt=<token>

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "1234567890",
    "title": "Math Homework",
    "description": "Complete algebra problems",
    "subject": "Math",
    "dueDate": "2026-12-01T00:00:00.000Z",
    "priority": "High",
    "status": "Pending",
    "createdBy": "user_id",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

### Update Task
`PUT /tasks/:id`

**Headers:**
- Cookie: jwt=<token>

**Request Body:**
```json
{
  "title": "Updated Title",
  "status": "Completed"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "1234567890",
    "title": "Updated Title",
    "description": "Complete algebra problems",
    "subject": "Math",
    "dueDate": "2026-12-01T00:00:00.000Z",
    "priority": "High",
    "status": "Completed",
    "createdBy": "user_id",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

### Delete Task
`DELETE /tasks/:id`

**Headers:**
- Cookie: jwt=<token>

**Response (200):**
```json
{
  "success": true,
  "data": {}
}
```

### Get Dashboard Stats
`GET /tasks/dashboard/stats`

**Headers:**
- Cookie: jwt=<token>

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalTasks": 10,
    "completedTasks": 6,
    "pendingTasks": 4,
    "overdueTasks": 2,
    "productivityPercentage": 60,
    "weeklyData": [2, 3, 1, 0, 4, 2, 1],
    "streak": 5
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

### Common Status Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to 100 requests per 15 minutes per IP address.
