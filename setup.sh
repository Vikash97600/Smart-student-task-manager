#!/bin/bash
# Quick Setup Script for Student Task Manager

echo "============================================"
echo "  Student Task Manager - Quick Setup"
echo "============================================"
echo ""

# Check for Node.js
echo "Checking Node.js installation..."
if command -v node &> /dev/null; then
    echo "✓ Node.js is installed ($(node --version))"
else
    echo "✗ Node.js is not installed. Please install Node.js v16+"
    exit 1
fi

# Check for MongoDB
echo ""
echo "Checking MongoDB connection..."
if command -v mongosh &> /dev/null || command -v mongo &> /dev/null; then
    echo "✓ MongoDB client is available"
else
    echo "⚠ MongoDB client not found. Using mongoose for connection."
fi

# Backend setup
echo ""
echo "Setting up backend..."
cd backend
echo "Installing backend dependencies..."
npm install
echo "✓ Backend dependencies installed"
cd ..

# Frontend setup
echo ""
echo "Setting up frontend..."
cd frontend
echo "Installing frontend dependencies..."
npm install
echo "✓ Frontend dependencies installed"
cd ..

echo ""
echo "============================================"
echo "  Setup Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Configure MongoDB URI in backend/.env"
echo "2. Start MongoDB server (if using local)"
echo "3. Start backend: cd backend && npm run dev"
echo "4. Start frontend: cd frontend && npm run dev"
echo "5. Open http://localhost:3000 in your browser"
echo ""
echo "For production deployment, see README.md"
