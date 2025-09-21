#!/bin/bash

# VibeFM Startup Script
echo "🎵 Starting VibeFM..."

# Check if we're in the right directory
if [ ! -d "frontend2" ] || [ ! -d "backend" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Kill any existing processes on our ports
echo "🧹 Cleaning up existing processes..."
if check_port 1504; then
    echo "Stopping backend on port 1504..."
    pkill -f "node.*server.js" 2>/dev/null || true
fi

if check_port 3000; then
    echo "Stopping frontend on port 3000..."
    pkill -f "vite" 2>/dev/null || true
fi

# Wait a moment for processes to stop
sleep 2

# Start backend
echo "🚀 Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
for i in {1..30}; do
    if check_port 1504; then
        echo "✅ Backend is running on http://localhost:1504"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
done

# Start frontend
echo "🚀 Starting frontend..."
cd ../frontend2
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
for i in {1..30}; do
    if check_port 3000; then
        echo "✅ Frontend is running on http://localhost:3000"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo "❌ Frontend failed to start"
        kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
        exit 1
    fi
done

echo ""
echo "🎉 VibeFM is now running!"
echo "🎵 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:1504"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping VibeFM..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Wait for either process to exit
wait
