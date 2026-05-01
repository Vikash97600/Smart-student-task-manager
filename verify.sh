#!/bin/bash
# System Verification Script

echo "============================================"
echo "  System Verification"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check functions
check_service() {
    if curl -s "$1" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $2"
        return 0
    else
        echo -e "${RED}✗${NC} $2"
        return 1
    fi
}

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        return 0
    else
        echo -e "${RED}✗${NC} $2"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        return 0
    else
        echo -e "${RED}✗${NC} $2"
        return 1
    fi
}

echo "Checking Project Structure..."
echo "--------------------------------"

check_dir "backend" "Backend directory exists"
check_dir "backend/models" "Backend models directory"
check_dir "backend/routes" "Backend routes directory"
check_dir "backend/controllers" "Backend controllers directory"
check_dir "backend/middleware" "Backend middleware directory"
check_dir "backend/config" "Backend config directory"

check_dir "frontend" "Frontend directory exists"
check_dir "frontend/src" "Frontend src directory"
check_dir "frontend/src/components" "Frontend components directory"
check_dir "frontend/src/pages" "Frontend pages directory"
check_dir "frontend/src/context" "Frontend context directory"
check_dir "frontend/src/services" "Frontend services directory"
check_dir "frontend/src/styles" "Frontend styles directory"

echo ""
echo "Checking Backend Files..."
echo "--------------------------------"

check_file "backend/index.js" "Backend entry point"
check_file "backend/package.json" "Backend package.json"
check_file "backend/.env" "Backend environment file"
check_file "backend/config/db.js" "Database config"
check_file "backend/models/User.js" "User model"
check_file "backend/models/Task.js" "Task model"
check_file "backend/routes/authRoutes.js" "Auth routes"
check_file "backend/routes/taskRoutes.js" "Task routes"
check_file "backend/controllers/authController.js" "Auth controller"
check_file "backend/controllers/taskController.js" "Task controller"
check_file "backend/middleware/authMiddleware.js" "Auth middleware"
check_file "backend/middleware/errorMiddleware.js" "Error middleware"

echo ""
echo "Checking Frontend Files..."
echo "--------------------------------"

check_file "frontend/package.json" "Frontend package.json"
check_file "frontend/vite.config.js" "Vite config"
check_file "frontend/src/index.js" "Frontend entry point"
check_file "frontend/src/App.js" "App component"
check_file "frontend/src/context/store.js" "Redux store"
check_file "frontend/src/context/authSlice.js" "Auth slice"
check_file "frontend/src/context/taskSlice.js" "Task slice"
check_file "frontend/src/services/api.js" "API service"
check_file "frontend/src/styles/index.css" "Global styles"

echo ""
echo "Checking Services..."
echo "--------------------------------"

# Check if backend is running
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend service is running"
else
    echo -e "${YELLOW}⚠${NC} Backend service is not running"
fi

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend service is running"
else
    echo -e "${YELLOW}⚠${NC} Frontend service is not running"
fi

echo ""
echo "Checking Dependencies..."
echo "--------------------------------"

# Check Node.js
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓${NC} Node.js $(node --version)"
else
    echo -e "${RED}✗${NC} Node.js not installed"
fi

# Check npm
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✓${NC} npm $(npm --version)"
else
    echo -e "${RED}✗${NC} npm not installed"
fi

echo ""
echo "Checking API Endpoints..."
echo "--------------------------------"

check_service "http://localhost:5000/api/health" "Health check endpoint"

echo ""
echo "============================================"
echo "  Verification Complete"
echo "============================================"
echo ""
echo "Next Steps:"
echo "1. Start MongoDB if not running"
echo "2. Run: cd backend && npm run dev"
echo "3. Run: cd frontend && npm run dev"
echo "4. Open http://localhost:3000"
echo ""
