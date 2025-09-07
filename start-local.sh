#!/bin/bash

# SpiralogicOracleSystem Local Development Startup Script
echo "🚀 Starting SpiralogicOracleSystem for Local Beta Testing"
echo "======================================================"
echo ""

# Function to open new terminal tab (macOS)
open_new_tab() {
    osascript -e "tell application \"Terminal\" to do script \"$1\""
}

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

echo ""
echo "🔧 Starting services..."
echo ""

# Start backend in new terminal tab
echo "1️⃣ Starting Backend API (port 3002)..."
open_new_tab "cd \"$PWD/backend\" && export REDIS_ENABLED=false && npm run dev"

# Give backend time to start
sleep 3

# Start frontend in new terminal tab
echo "2️⃣ Starting Frontend (port 3000)..."
open_new_tab "cd \"$PWD\" && npm run dev"

echo ""
echo "✨ Services starting up!"
echo ""
echo "Wait about 10-15 seconds, then visit:"
echo "  🌐 Frontend: http://localhost:3000"
echo "  🔌 Backend Health: http://localhost:3002/api/v1/health"
echo ""
echo "📋 Beta Testing Checklist:"
echo "  ✓ Create an account / Sign in"
echo "  ✓ Complete onboarding flow"
echo "  ✓ Test Maya Oracle chat"
echo "  ✓ Upload a journal entry"
echo "  ✓ Check voice features"
echo "  ✓ Explore dashboard"
echo ""
echo "To stop all services: Press Ctrl+C in each terminal window"
echo ""