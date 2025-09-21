#!/bin/bash

# Music Library Startup Script
echo "🎵 Starting Music Library Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    echo "Expected structure:"
    echo "  ./backend/"
    echo "  ./frontend/"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Check if ports are already in use
if check_port 5178; then
    echo -e "${YELLOW}⚠️  Backend port 5178 is already in use${NC}"
    read -p "Kill existing process and continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pkill -f "node.*server.js" 2>/dev/null || true
        sleep 2
    else
        echo -e "${RED}❌ Aborted${NC}"
        exit 1
    fi
fi

if check_port 3000; then
    echo -e "${YELLOW}⚠️  Frontend port 3000 is already in use${NC}"
    read -p "Kill existing process and continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pkill -f "vite.*dev" 2>/dev/null || true
        sleep 2
    else
        echo -e "${RED}❌ Aborted${NC}"
        exit 1
    fi
fi

# Install dependencies if needed
echo -e "${YELLOW}📦 Checking dependencies...${NC}"

# Backend dependencies
if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
else
    echo "✅ Backend dependencies already installed"
fi

# Frontend dependencies  
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
else
    echo "✅ Frontend dependencies already installed"
fi

# Start backend in background
echo -e "${GREEN}🚀 Starting backend server (port 5178)...${NC}"
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Check if backend is running
if check_port 5178; then
    echo -e "${GREEN}✅ Backend server is running at http://localhost:5178${NC}"
else
    echo -e "${RED}❌ Failed to start backend server${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Start frontend
echo -e "${GREEN}🚀 Starting frontend app (port 3000)...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 3

# Check if frontend is running
if check_port 3000; then
    echo -e "${GREEN}✅ Frontend app is running at http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Failed to start frontend app${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 1
fi

echo
echo -e "${GREEN}🎉 Music Library is now running!${NC}"
echo -e "📡 Backend API: ${YELLOW}http://localhost:5178${NC}"
echo -e "🎵 Frontend App: ${YELLOW}http://localhost:3000${NC}"
echo
echo -e "${YELLOW}Press Ctrl+C to stop both services${NC}"

# Function to cleanup on exit
cleanup() {
    echo
    echo -e "${YELLOW}🛑 Shutting down services...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Keep script running and show logs
echo "📋 Logs (Ctrl+C to stop):"
wait
