#!/bin/bash

echo "🎵 Starting VibeFM Frontend..."

# Check if backend is running
if ! lsof -Pi :5178 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Backend not detected on port 5178"
    echo "   Please start the backend first:"
    echo "   cd backend && npm start"
    echo ""
fi

# Start frontend
cd frontend2
echo "🚀 Starting frontend development server..."
npm run dev
