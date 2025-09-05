#!/bin/bash
# ==============================================
# SPIRALOGIC ORACLE SYSTEM - SACRED START
# ==============================================
# One-click startup script that ensures clean ports and proper service order

set -e

echo "🌀 Starting Spiralogic Oracle System..."
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# ==============================================
# Step 1: Clean up any stuck ports
# ==============================================
echo -e "${YELLOW}🧹 Cleaning up ports 3000-3003...${NC}"
for port in 3000 3001 3002 3003; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "   Killing process on port $port"
        kill -9 $(lsof -ti:$port) 2>/dev/null || true
    fi
done
echo -e "${GREEN}✅ Ports cleared${NC}"
echo ""

# ==============================================
# Step 2: Check and install backend dependencies
# ==============================================
echo -e "${YELLOW}📦 Checking backend dependencies...${NC}"
cd backend

# Check for critical dependencies
if [ ! -d "node_modules" ] || [ ! -d "node_modules/express" ] || [ ! -d "node_modules/nodemon" ]; then
    echo -e "${YELLOW}⚠️  Missing backend dependencies. Installing...${NC}"
    echo "   Installing runtime dependencies..."
    npm install express cors helmet morgan compression jsonwebtoken express-rate-limit ioredis rate-limit-redis multer concurrently wait-on nodemon --save
    echo "   Installing dev dependencies..."
    npm install @types/express @types/cors @types/helmet @types/morgan @types/compression @types/jsonwebtoken @types/multer -D
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Backend dependencies already installed${NC}"
fi

cd ..
echo ""

# ==============================================
# Step 3: Start backend service (port 3002)
# ==============================================
echo -e "${YELLOW}🚀 Starting backend on port 3002...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "   Waiting for backend to initialize..."
for i in {1..30}; do
    if curl -s http://localhost:3002/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend running on http://localhost:3002${NC}"
        break
    elif [ $i -eq 30 ]; then
        echo -e "${RED}❌ Backend failed to start after 30 seconds${NC}"
        echo "Check backend logs for errors"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done
echo ""

# ==============================================
# Step 4: Start frontend service (port 3000)
# ==============================================
echo -e "${YELLOW}🎨 Starting frontend on port 3000...${NC}"
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to be ready
echo "   Waiting for frontend to initialize..."
for i in {1..40}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend running on http://localhost:3000${NC}"
        break
    elif [ $i -eq 40 ]; then
        echo -e "${RED}❌ Frontend failed to start after 40 seconds${NC}"
        echo "Check frontend logs for errors"
        kill $FRONTEND_PID 2>/dev/null || true
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done
echo ""

# ==============================================
# Success message
# ==============================================
echo "=================================="
echo -e "${GREEN}🌟 Spiralogic Oracle System Ready!${NC}"
echo "=================================="
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend:  http://localhost:3002"
echo "📍 Maya API: http://localhost:3002/api/oracle/chat"
echo "📊 Health:   http://localhost:3002/health"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Function to handle cleanup
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down services...${NC}"
    kill $FRONTEND_PID 2>/dev/null || true
    kill $BACKEND_PID 2>/dev/null || true
    # Clean up any orphaned processes
    for port in 3000 3002; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            kill -9 $(lsof -ti:$port) 2>/dev/null || true
        fi
    done
    echo -e "${GREEN}✅ Shutdown complete${NC}"
    exit 0
}

# Keep script running and handle cleanup on exit
trap cleanup INT TERM

# Wait for both processes
wait $FRONTEND_PID $BACKEND_PID