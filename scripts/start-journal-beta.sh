#!/bin/bash

# Spiralogic Journal System - Beta Startup Script
# Starts both frontend and backend with journal features enabled

echo "🔮 Starting Spiralogic Oracle Journal System (Beta)"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if node_modules exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd backend && npm install && cd ..
fi

# Create necessary directories
echo -e "${BLUE}Creating necessary directories...${NC}"
mkdir -p tmp
mkdir -p backend/audio_archive

# Set environment variables
export NODE_ENV=development
export ENABLE_JOURNAL=true
export ENABLE_VOICE_JOURNAL=true
export JOURNAL_STORAGE_PATH=./tmp/journal

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Stopping services...${NC}"
    pkill -f "npm run dev"
    pkill -f "npm run start:minimal"
    exit 0
}

# Set trap for cleanup
trap cleanup INT TERM

# Start backend
echo -e "\n${GREEN}Starting backend server...${NC}"
cd backend
APP_PORT=3002 npm run start:minimal &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo -e "${YELLOW}Waiting for backend to initialize...${NC}"
sleep 5

# Check if backend is running
if curl -s http://localhost:3002/health > /dev/null; then
    echo -e "${GREEN}✅ Backend running on port 3002${NC}"
else
    echo -e "${YELLOW}⚠️  Backend might be starting slowly, continuing...${NC}"
fi

# Start frontend
echo -e "\n${GREEN}Starting frontend...${NC}"
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo -e "${YELLOW}Waiting for frontend to initialize...${NC}"
sleep 5

# Display status
echo -e "\n${GREEN}=================================================="
echo "🎉 Spiralogic Journal System is Running!"
echo "=================================================="
echo -e "${NC}"
echo "📝 Frontend (Journal UI): http://localhost:3000/journal"
echo "🔮 Oracle Interface: http://localhost:3000/oracle"
echo "🏠 Home: http://localhost:3000"
echo ""
echo "📡 Backend API: http://localhost:3002"
echo "❤️  Backend Health: http://localhost:3002/health"
echo "📚 API Docs: http://localhost:3002/api"
echo ""
echo -e "${BLUE}Journal Features:${NC}"
echo "✅ Text journaling with sentiment analysis"
echo "✅ Elemental resonance tracking"
echo "✅ Pattern recognition"
echo "✅ Voice journaling (requires OPENAI_API_KEY)"
echo "✅ Weekly assessments"
echo "✅ Sacred Mirror reflections"
echo ""
echo -e "${YELLOW}Quick Test Commands:${NC}"
echo "1. Create entry: ./scripts/test-journal.sh"
echo "2. View logs: tail -f backend/logs/*.log"
echo "3. Check storage: ls -la tmp/"
echo ""
echo -e "${GREEN}Press Ctrl+C to stop all services${NC}"

# Keep script running
wait $FRONTEND_PID $BACKEND_PID