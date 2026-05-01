# Deployment Guide

## Quick Start (Docker)

The easiest way to deploy the entire application is using Docker Compose:

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access the application at `http://localhost:3000`

## Manual Deployment

### Prerequisites

1. **Node.js** v18 or higher
2. **MongoDB** (local or MongoDB Atlas)
3. **npm** or **yarn**

### Backend Deployment

#### Local Deployment

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student_task_manager
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

#### Render Deployment

1. Create a [Render](https://render.com) account
2. Create New → Web Service
3. Connect your GitHub repository
4. Configure:
   - **Name**: student-task-manager-backend
   - **Region**: Choose closest to you
   - **Branch**: main
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or higher)
5. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your secure secret
   - `NODE_ENV`: `production`
6. Click Create Web Service

#### Railway Deployment

1. Create a [Railway](https://railway.app) account
2. Create New Project
3. Deploy from GitHub
4. Select your repository
5. Add environment variables
6. Deploy

### Frontend Deployment

#### Local Deployment

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

#### Vercel Deployment

1. Install Vercel CLI (optional):
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from project directory:
```bash
cd frontend
vercel
```

4. Follow prompts:
   - Set up and deploy? **Yes**
   - Which scope? **Your account**
   - Link to existing project? **No**
   - What's your project's name? **student-task-manager**
   - In which directory is your code located? **./**

5. Configure environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL`: Your backend URL

#### Netlify Deployment

1. Create `netlify.toml` in frontend directory:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Build the project:
```bash
npm run build
```

3. Deploy via Netlify CLI or connect GitHub repository

### MongoDB Atlas Deployment

1. Create [MongoDB Atlas](https://www.mongodb.com/atlas) account
2. Create New Project
3. Build Database (M0 free tier)
4. Create Database User:
   - Username: admin
   - Password: [secure password]
5. Add IP Access (0.0.0.0/0 for testing)
6. Get Connection String:
```
mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/student_task_manager?retryWrites=true&w=majority
```
7. Update `.env` file with this URI

### Production Configuration

#### Backend `.env`
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/student_task_manager
JWT_SECRET=your_production_secret_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-domain.com
```

#### Frontend Environment
```env
VITE_API_URL=https://your-backend-domain.com
```

#### Nginx Reverse Proxy (Optional)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Render
        uses: render-oss/render-action@main
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Monitoring

### Backend Health Check
```bash
curl http://localhost:5000/api/health
```

### Logs
```bash
# Backend logs
pm2 logs

# MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

## Scaling

### Horizontal Scaling
1. Use PM2 for process management
2. Set up load balancer (Nginx)
3. Use Redis for session management
4. Enable MongoDB replica sets

### Database Optimization
1. Add indexes for frequent queries
2. Implement connection pooling
3. Use MongoDB Atlas for auto-scaling

## Backup Strategy

### MongoDB Backup
```bash
# Daily backup
mongodump --uri="mongodb+srv://<connection-string>" --out /backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb+srv://<connection-string>" /backup/20260101
```

## Security Checklist

- [x] HTTPS enabled
- [x] JWT tokens in HTTP-only cookies
- [x] CORS properly configured
- [x] Rate limiting enabled
- [x] Input validation
- [x] No sensitive data in logs
- [x] Database credentials in environment variables
- [x] Regular dependency updates
- [x] MongoDB authentication enabled
- [x] Firewall rules configured

## Troubleshooting

### Connection Issues
```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017"

# Test backend
curl http://localhost:5000/api/health

# Test frontend
curl http://localhost:3000
```

### Port Conflicts
```bash
# Check port usage
lsof -i :5000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Memory Issues
```bash
# Increase Node.js memory limit
export NODE_OPTIONS=--max-old-space-size=4096
```

## Performance Optimization

1. Enable gzip compression
2. Use CDN for static assets
3. Implement caching (Redis)
4. Optimize database queries
5. Use lazy loading for frontend
6. Minimize bundle size
7. Enable HTTP/2

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | Token expiration | 7d |
| `NODE_ENV` | Environment mode | development |
| `CORS_ORIGIN` | Allowed frontend origin | `*` |