#!/bin/bash
# 🚀 Fixed Beta Launcher with timeout handling

set -e

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "═════════════════════════════════════════════════════"
echo "   🌟 Starting Spiralogic Oracle System Beta (Fixed)"
echo "═════════════════════════════════════════════════════"
echo ""

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo -e "${BLUE}📍 Project root: $PROJECT_ROOT${NC}"
echo ""

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Load environment variables
if [ -f ".env.local" ]; then
    echo "📋 Loading environment variables..."
    export $(grep -v '^#' .env.local | xargs) 2>/dev/null || true
fi

# 🎤 SESAME CHECK WITH TIMEOUT
echo "🎤 Checking Sesame CSM Server..."
echo "   Testing localhost:8000 (5 second timeout)..."

# Use timeout command with curl
SESAME_HEALTH=""
if command -v timeout >/dev/null 2>&1; then
    # Use timeout command if available
    SESAME_HEALTH=$(timeout 5 curl -s http://localhost:8000/health 2>/dev/null || echo "")
else
    # Use curl's built-in timeout
    SESAME_HEALTH=$(curl -s --max-time 5 http://localhost:8000/health 2>/dev/null || echo "")
fi

if [ -n "$SESAME_HEALTH" ]; then
    echo -e "${GREEN}✅ Sesame server responding${NC}"
    if echo "$SESAME_HEALTH" | grep -q '"model_loaded":true'; then
        echo -e "${GREEN}✅ Sesame model loaded and ready${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No Sesame server detected (continuing anyway)${NC}"
    echo "   To enable voice:"
    echo "   1. Run: ${YELLOW}./backend/scripts/setup-sesame-offline.sh${NC}"
    echo "   2. Or start mock: ${YELLOW}./scripts/start-mock-sesame.sh${NC}"
fi

echo ""

# Kill existing processes on our ports
echo "🔍 Checking for existing processes..."
if check_port 3002; then
    echo -e "${YELLOW}⚠️  Port 3002 is in use, killing existing process...${NC}"
    lsof -ti:3002 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

if check_port 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 is in use, killing existing process...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Trap to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit
}
trap cleanup EXIT INT TERM

# 1. Start backend
echo -e "${GREEN}▶  Starting backend...${NC}"
cd "$PROJECT_ROOT/backend"
npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
echo "   PID: $BACKEND_PID"

# 2. Start frontend
echo -e "${GREEN}▶  Starting frontend...${NC}"
cd "$PROJECT_ROOT"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   PID: $FRONTEND_PID"

# 3. Wait for services to be ready
echo ""
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"

# Wait for backend
echo -n "   Backend (http://localhost:3002): "
for i in {1..30}; do
    if curl -s http://localhost:3002/api/v1/health >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Wait for frontend
echo -n "   Frontend (http://localhost:3000): "
for i in {1..30}; do
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# 4. Quick health checks
echo ""
echo "═════════════════════════════════════════════════════"
echo "   🏥 Running Health Checks"
echo "═════════════════════════════════════════════════════"
echo ""

# Backend health
echo -n "🔍 Backend API Health: "
if curl -s http://localhost:3002/api/v1/health | grep -q "healthy"; then
    echo -e "${GREEN}✓ Healthy${NC}"
else
    echo -e "${RED}✗ Unhealthy${NC}"
fi

# Supabase connection
echo -n "🔍 Supabase Connection: "
SUPABASE_CHECK=$(curl -s http://localhost:3002/api/v1/health | grep -o '"supabase":"[^"]*"' | cut -d'"' -f4)
if [ "$SUPABASE_CHECK" = "connected" ]; then
    echo -e "${GREEN}✓ Connected${NC}"
else
    echo -e "${YELLOW}⚠️  Not connected (running in limited mode)${NC}"
fi

# Voice test (with timeout)
echo -n "🔍 Voice System: "
VOICE_RESPONSE=$(curl -s --max-time 5 -X POST http://localhost:3000/api/voice/unified \
  -H "Content-Type: application/json" \
  -d '{"text":"Test","voiceEngine":"auto","testMode":true}' 2>/dev/null || echo "{}")

if echo "$VOICE_RESPONSE" | grep -q '"success":true'; then
    VOICE_ENGINE=$(echo "$VOICE_RESPONSE" | grep -o '"engine":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✓ Active (${VOICE_ENGINE})${NC}"
else
    echo -e "${YELLOW}⚠️  Voice unavailable${NC}"
fi

echo ""

# Final status
echo "═════════════════════════════════════════════════════"
echo -e "   ${GREEN}✅ Spiralogic Oracle Beta is READY!${NC}"
echo "═════════════════════════════════════════════════════"
echo ""
echo "   🌐 Backend:  http://localhost:3002"
echo "   🎨 Frontend: http://localhost:3000/oracle"
echo "   📊 Health:   http://localhost:3002/api/v1/health"
echo ""
echo "   📝 Logs:"
echo "      - Backend:  ./backend/backend.log"
echo "      - Frontend: ./frontend.log"
echo ""
echo -e "   ${YELLOW}Press Ctrl+C to stop all services${NC}"
echo "═════════════════════════════════════════════════════"
echo ""

# Keep running
echo -e "${BLUE}📡 Services running (Ctrl+C to exit)...${NC}"
wait $BACKEND_PID $FRONTEND_PID