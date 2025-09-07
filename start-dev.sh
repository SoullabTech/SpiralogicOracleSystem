#!/bin/bash

# Start Development Environment with Proper Port Allocation
# Frontend: 3000
# Backend: 3002
# Sesame: 8000

echo "🚀 Starting Spiralogic Oracle System Development Environment"
echo "================================================"

# Kill any existing processes on our ports
echo "📍 Clearing ports..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Start backend
echo ""
echo "🔧 Starting Backend on port 3002..."
cd backend
PORT=3002 npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo ""
echo "🎨 Starting Frontend on port 3000..."
cd ..
PORT=3000 npm run dev &
FRONTEND_PID=$!

# Start Sesame if available
if [ -d "sesame-csm" ]; then
    echo ""
    echo "🌱 Starting Sesame CSM on port 8000..."
    cd sesame-csm
    ./start-sesame.sh &
    SESAME_PID=$!
    cd ..
fi

echo ""
echo "================================================"
echo "✅ Development environment started!"
echo ""
echo "📍 Services:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:3002"
echo "   Sesame:    http://localhost:8000 (if available)"
echo ""
echo "📋 Process IDs:"
echo "   Frontend PID: $FRONTEND_PID"
echo "   Backend PID:  $BACKEND_PID"
if [ ! -z "$SESAME_PID" ]; then
    echo "   Sesame PID:   $SESAME_PID"
fi
echo ""
echo "To stop all services, run: killall node python"
echo "================================================"

# Keep script running
wait