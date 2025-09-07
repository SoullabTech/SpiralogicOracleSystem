#!/bin/bash
# 🚀 Enhanced Beta Launcher with Smart Sesame Auto-Start
# Automatically starts Sesame Docker container if missing

set -e

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "═════════════════════════════════════════════════════"
echo "   🌟 Starting Spiralogic Oracle System Beta"
echo "       (Enhanced with Smart Auto-Start)"
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

# 🎤 SMART SESAME AUTO-START
echo "🎤 Checking Sesame CSM Server..."
echo "   Testing localhost:8000 (5 second timeout)..."

# Check if any Sesame server is running
SESAME_HEALTH=""
if command -v timeout >/dev/null 2>&1; then
    SESAME_HEALTH=$(timeout 5 curl -s http://localhost:8000/health 2>/dev/null || echo "")
else
    SESAME_HEALTH=$(curl -s --max-time 5 http://localhost:8000/health 2>/dev/null || echo "")
fi

# Determine what to do based on Sesame status
if [ -n "$SESAME_HEALTH" ]; then
    echo -e "${GREEN}✅ Sesame server already running${NC}"
    if echo "$SESAME_HEALTH" | grep -q '"model_loaded":true'; then
        echo -e "${GREEN}✅ Model loaded and ready${NC}"
        if echo "$SESAME_HEALTH" | grep -q "Mock Sesame"; then
            echo -e "${BLUE}ℹ️  Running in mock mode${NC}"
            
            # Ask if user wants to switch to real Sesame
            if [ -f "backend/docker-compose.sesame-offline.yml" ] && command -v docker >/dev/null 2>&1; then
                echo ""
                echo -e "${YELLOW}💡 Real Sesame Docker setup detected!${NC}"
                echo "   Would you like to switch from mock to real Sesame?"
                echo -n "   Start real Sesame Docker container? [y/N] "
                read -t 10 SWITCH_TO_REAL || SWITCH_TO_REAL="n"
                
                if [[ "$SWITCH_TO_REAL" =~ ^[Yy]$ ]]; then
                    echo "   Stopping mock server..."
                    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
                    sleep 2
                    SESAME_HEALTH=""  # Force container start below
                fi
            fi
        fi
    fi
else
    echo -e "${YELLOW}⚠️  No Sesame server detected${NC}"
fi

# If no Sesame running and Docker is available, try to start container
if [ -z "$SESAME_HEALTH" ] && command -v docker >/dev/null 2>&1; then
    echo ""
    echo "🐳 Checking Docker setup..."
    
    # Check if Docker daemon is running
    if ! docker ps >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Docker daemon not running${NC}"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo "   Attempting to start Docker Desktop..."
            open -a Docker 2>/dev/null || echo "   Please start Docker Desktop manually"
            
            # Wait for Docker to start
            echo -n "   Waiting for Docker daemon"
            for i in {1..30}; do
                if docker ps >/dev/null 2>&1; then
                    echo -e " ${GREEN}✓${NC}"
                    break
                fi
                echo -n "."
                sleep 1
            done
        fi
    fi
    
    # If Docker is now available
    if docker ps >/dev/null 2>&1; then
        # Check if offline setup exists
        if [ -f "backend/docker-compose.sesame-offline.yml" ]; then
            echo ""
            echo "🚀 Auto-starting Sesame Docker container..."
            
            # Stop any existing Sesame containers
            docker compose -f backend/docker-compose.sesame-offline.yml down >/dev/null 2>&1 || true
            
            # Start the container
            if docker compose -f backend/docker-compose.sesame-offline.yml up -d; then
                echo -e "${GREEN}✅ Sesame container started${NC}"
                echo "   Waiting for model to load (60-90 seconds)..."
                
                # Wait for service with progress indicator
                SESAME_STARTED_BY_SCRIPT=true
                for i in {1..90}; do
                    if curl -s --max-time 2 http://localhost:8000/health >/dev/null 2>&1; then
                        HEALTH_CHECK=$(curl -s --max-time 2 http://localhost:8000/health)
                        if echo "$HEALTH_CHECK" | grep -q '"model_loaded":true'; then
                            echo -e "\n${GREEN}✅ Sesame model loaded and ready!${NC}"
                            break
                        fi
                    fi
                    
                    # Progress indicator
                    if [ $((i % 10)) -eq 0 ]; then
                        echo -n " ${i}s"
                    else
                        echo -n "."
                    fi
                    sleep 1
                    
                    if [ $i -eq 90 ]; then
                        echo -e "\n${YELLOW}⚠️  Model loading taking longer than expected${NC}"
                        echo "   Check logs: docker logs sesame-csm"
                    fi
                done
            else
                echo -e "${RED}❌ Failed to start Sesame container${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  Sesame offline setup not found${NC}"
            echo "   Run: ${YELLOW}./backend/scripts/setup-sesame-offline.sh${NC}"
        fi
    fi
fi

# Final Sesame status check
echo ""
echo "📊 Final Sesame Status:"
SESAME_FINAL=$(curl -s --max-time 5 http://localhost:8000/health 2>/dev/null || echo "")
if [ -n "$SESAME_FINAL" ]; then
    if echo "$SESAME_FINAL" | grep -q "Mock Sesame"; then
        echo -e "   ${YELLOW}Mock server active (for testing)${NC}"
    elif echo "$SESAME_FINAL" | grep -q '"model_loaded":true'; then
        echo -e "   ${GREEN}Real Sesame CSM active${NC}"
    else
        echo -e "   ${YELLOW}Sesame running but model not ready${NC}"
    fi
else
    echo -e "   ${RED}No Sesame server available${NC}"
    echo "   Voice will use fallback engines (HuggingFace/ElevenLabs)"
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
    
    # Stop Sesame container if we started it
    if [ "$SESAME_STARTED_BY_SCRIPT" = "true" ]; then
        echo "   Stopping Sesame Docker container..."
        docker compose -f backend/docker-compose.sesame-offline.yml down >/dev/null 2>&1 || true
    fi
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

# Voice test
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
echo "   📊 Voice Logs: http://localhost:3000/oracle?showVoiceLogs=true"
echo ""
echo "   📝 Logs:"
echo "      - Backend:  ./backend/backend.log"
echo "      - Frontend: ./frontend.log"
if [ "$SESAME_STARTED_BY_SCRIPT" = "true" ]; then
echo "      - Sesame:   docker logs sesame-csm"
fi
echo ""
echo -e "   ${YELLOW}Press Ctrl+C to stop all services${NC}"
echo "═════════════════════════════════════════════════════"
echo ""

# Keep running
echo -e "${BLUE}📡 Services running (Ctrl+C to exit)...${NC}"
wait $BACKEND_PID $FRONTEND_PID