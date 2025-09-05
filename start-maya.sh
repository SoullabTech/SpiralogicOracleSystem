#!/bin/bash

# Maya Oracle System - Clean Start Script
echo "🔮 Starting Maya Oracle System (Clean Build)"
echo "=========================================="
echo ""

# Ensure we're in the right directory
cd "/Volumes/T7 Shield/Projects/SpiralogicOracleSystem"

# Kill any running processes
echo "🛑 Stopping any running processes..."
killall node 2>/dev/null || true
sleep 2

# Clean caches
echo "🧹 Cleaning caches..."
rm -rf .next
rm -rf backend/dist

# Start backend first
echo ""
echo "1️⃣ Starting Backend (port 3002)..."
osascript -e 'tell application "Terminal" to do script "cd \"'$PWD'/backend\" && export REDIS_ENABLED=false && npm run dev"'

# Wait for backend
echo "⏳ Waiting for backend to start..."
sleep 5

# Start frontend
echo "2️⃣ Starting Frontend (port 3000)..."
osascript -e 'tell application "Terminal" to do script "cd \"'$PWD'\" && npm run dev"'

echo ""
echo "✨ Maya Oracle System starting!"
echo ""
echo "Wait 10-15 seconds, then visit:"
echo "  🌐 http://localhost:3000"
echo ""
echo "You should see:"
echo "  ✓ Maya (not Oralia)"
echo "  ✓ Modern UI (not purple)"
echo "  ✓ Working journal upload"
echo "  ✓ Functional voice input"
echo ""