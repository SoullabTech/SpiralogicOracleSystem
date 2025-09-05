#!/bin/bash

# 🛠️ Spiralogic Oracle System - Quick Restart Script
# Cleans up stray Node processes and restarts both backend and frontend

echo "🧹 Cleaning up existing Node processes..."
pkill -f "node"
sleep 2

echo "🚀 Starting backend server on port 3002..."
cd backend && PORT=3002 nohup npm run dev > backend.log 2>&1 &
BACKEND_PID=$!

echo "🌟 Starting frontend server on port 3000..."
cd .. && nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

sleep 3

echo "✅ Checking server status..."
if lsof -i :3002 > /dev/null 2>&1; then
    echo "✓ Backend running on port 3002 (PID: $BACKEND_PID)"
else
    echo "✗ Backend failed to start on port 3002"
fi

if lsof -i :3000 > /dev/null 2>&1; then
    echo "✓ Frontend running on port 3000 (PID: $FRONTEND_PID)"
else
    echo "✗ Frontend failed to start on port 3000"
fi

echo ""
echo "📝 Logs available at:"
echo "  - backend/backend.log"
echo "  - frontend.log"
echo ""
echo "🧪 Test with:"
echo "  curl http://localhost:3000/api/health"
echo "  curl http://localhost:3002/api/v1/health"