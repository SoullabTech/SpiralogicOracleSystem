#!/bin/bash
# 🚀 Spiralogic Oracle System - Bulletproof Beta Launcher
# Enhanced with force auto-start and retry logic for Sesame CSM

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
echo "═════════════════════════════════════════════════════"
echo -e "${BLUE}💡 Alternative: Use the unified stack with ./stack-manager.sh start${NC}"
echo ""

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
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
    while IFS='=' read -r key value; do
        [[ $key =~ ^[[:space:]]*# ]] && continue
        [[ -z "$key" ]] && continue
        export "$key=$value" 2>/dev/null || true
    done < .env.local
fi

# 🎤 BULLETPROOF SESAME CSM STARTUP
echo "🎤 Ensuring Sesame CSM Server is running..."

SESAME_CONTAINER="sesame-csm"
SESAME_HEALTH_URL="http://localhost:8000/health"
SESAME_STARTED_BY_SCRIPT=false
SESAME_AVAILABLE=false

# Function to check Sesame health with retries
check_sesame_health() {
    local max_retries="${1:-5}"
    local retry_delay="${2:-3}"
    local attempt=1
    
    echo "🔍 Checking Sesame health status..."
    while [ $attempt -le $max_retries ]; do
        local health_response=$(curl -s --max-time 5 $SESAME_HEALTH_URL 2>/dev/null || echo "")
        
        if [ -n "$health_response" ]; then
            if echo "$health_response" | grep -q '"model_loaded":[[:space:]]*true'; then
                echo -e "${GREEN}✅ Sesame model loaded and ready (attempt $attempt)${NC}"
                if echo "$health_response" | grep -q "Mock Sesame"; then
                    echo -e "${BLUE}ℹ️  Running in mock mode for testing${NC}"
                fi
                return 0
            else
                echo -e "${YELLOW}⚠️  Sesame responding but model not ready (attempt $attempt/$max_retries)${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  Sesame not responding (attempt $attempt/$max_retries)${NC}"
        fi
        
        if [ $attempt -lt $max_retries ]; then
            echo "   Retrying in $retry_delay seconds..."
            sleep $retry_delay
        fi
        attempt=$((attempt + 1))
    done
    
    return 1
}

# Function to start Sesame container
start_sesame_container() {
    # Auto-detect mode
    if [ -f "backend/Dockerfile.sesame" ] && [ -f "configs/sesame-server-config.yaml" ]; then
        SESAME_MODE="offline"
        COMPOSE_FILE="backend/docker-compose.sesame-offline.yml"
        echo "🔍 Offline setup detected, using offline mode"
    else
        SESAME_MODE="online"
        COMPOSE_FILE="backend/docker-compose.sesame.yml"
        echo "🔍 Using online mode (HuggingFace API)"
    fi
    
    # Check if compose file exists
    if [ ! -f "$COMPOSE_FILE" ]; then
        echo -e "${YELLOW}⚠️  Compose file not found: $COMPOSE_FILE${NC}"
        echo "   Falling back to mock server"
        return 1
    fi
    
    echo "🚀 Starting Sesame CSM container..."
    if docker compose -f "$COMPOSE_FILE" up -d 2>/dev/null; then
        echo -e "${GREEN}✅ Sesame container started${NC}"
        SESAME_STARTED_BY_SCRIPT=true
        
        # Wait for container to be healthy
        local wait_time=60
        if [ "$SESAME_MODE" = "offline" ]; then
            wait_time=120
            echo "   Waiting for offline model to load (up to 2 minutes)..."
        else
            echo "   Waiting for model to load (up to 1 minute)..."
        fi
        
        # Give container time to initialize
        sleep 5
        
        # Check health with extended retries for container startup
        if check_sesame_health 20 3; then
            return 0
        else
            echo -e "${RED}❌ Container started but health check failed${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Failed to start container${NC}"
        return 1
    fi
}

# Main Sesame startup logic
echo ""

# Step 1: Try initial health check
if check_sesame_health 3 2; then
    echo -e "${GREEN}✅ Sesame already healthy and running${NC}"
    SESAME_AVAILABLE=true
else
    # Step 2: Check if Docker is available
    if ! command -v docker >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Docker not available, starting mock server${NC}"
        
        # Start mock server
        if [ -f "./scripts/start-mock-sesame.sh" ]; then
            ./scripts/start-mock-sesame.sh &
            SESAME_STARTED_BY_SCRIPT=true
            sleep 3
            
            if check_sesame_health 5 2; then
                echo -e "${GREEN}✅ Mock Sesame server running${NC}"
                SESAME_AVAILABLE=true
            else
                echo -e "${RED}❌ Failed to start mock server${NC}"
            fi
        else
            echo -e "${RED}❌ Mock server script not found${NC}"
        fi
    else
        # Step 3: Check if container exists
        CONTAINER_EXISTS=$(docker ps -a --format '{{.Names}}' 2>/dev/null | grep -c "^${SESAME_CONTAINER}$" || echo "0")
        # Ensure CONTAINER_EXISTS is a single numeric value
        CONTAINER_EXISTS=$(echo "$CONTAINER_EXISTS" | tr -d '[:space:]' | head -1)
        [ -z "$CONTAINER_EXISTS" ] && CONTAINER_EXISTS="0"
        
        if [ "$CONTAINER_EXISTS" -eq "0" ]; then
            # No container exists, create and start it
            echo "🔄 No Sesame container found, creating..."
            if start_sesame_container; then
                SESAME_AVAILABLE=true
            else
                echo -e "${YELLOW}⚠️  Container startup failed, trying mock server${NC}"
                if [ -f "./scripts/start-mock-sesame.sh" ]; then
                    ./scripts/start-mock-sesame.sh &
                    SESAME_STARTED_BY_SCRIPT=true
                    sleep 3
                    
                    if check_sesame_health 5 2; then
                        echo -e "${GREEN}✅ Mock Sesame server running${NC}"
                        SESAME_AVAILABLE=true
                    fi
                fi
            fi
        else
            # Container exists, check if it's running
            CONTAINER_RUNNING=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -c "^${SESAME_CONTAINER}$" || echo "0")
            # Ensure CONTAINER_RUNNING is a single numeric value
            CONTAINER_RUNNING=$(echo "$CONTAINER_RUNNING" | tr -d '[:space:]' | head -1)
            [ -z "$CONTAINER_RUNNING" ] && CONTAINER_RUNNING="0"
            
            if [ "$CONTAINER_RUNNING" -eq "0" ]; then
                echo "🔄 Sesame container exists but not running, starting..."
                docker start "$SESAME_CONTAINER" 2>/dev/null
                sleep 5
                
                if check_sesame_health 10 3; then
                    echo -e "${GREEN}✅ Sesame container restarted successfully${NC}"
                    SESAME_AVAILABLE=true
                else
                    echo -e "${YELLOW}⚠️  Container restart failed, recreating...${NC}"
                    docker rm -f "$SESAME_CONTAINER" 2>/dev/null || true
                    if start_sesame_container; then
                        SESAME_AVAILABLE=true
                    fi
                fi
            else
                echo "🔄 Sesame container running but unhealthy, restarting..."
                docker restart "$SESAME_CONTAINER" 2>/dev/null
                sleep 5
                
                if check_sesame_health 10 3; then
                    echo -e "${GREEN}✅ Sesame container restarted successfully${NC}"
                    SESAME_AVAILABLE=true
                else
                    echo -e "${RED}❌ Container restart didn't help${NC}"
                fi
            fi
        fi
    fi
fi

# Final status
echo ""
if [ "$SESAME_AVAILABLE" = "true" ]; then
    echo -e "${GREEN}✅ Sesame CSM is available for voice synthesis${NC}"
    # Force enable Sesame in environment
    export SESAME_ENABLED=true
else
    echo -e "${YELLOW}⚠️  Sesame CSM not available, will use fallback engines${NC}"
    echo "   Fallback chain: HuggingFace → ElevenLabs"
fi

echo ""
echo "═════════════════════════════════════════════════════"

# Kill existing processes on our ports
echo "🔍 Checking for existing processes..."
# Backend will auto-detect available port if 3002 is busy
BACKEND_PORT=3002

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
    
    # Stop Sesame if we started it
    if [ "$SESAME_STARTED_BY_SCRIPT" = "true" ]; then
        if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${SESAME_CONTAINER}$"; then
            echo "   Stopping Sesame container..."
            docker stop "$SESAME_CONTAINER" >/dev/null 2>&1 || true
        fi
        
        # Kill mock server if running
        pkill -f "start-mock-sesame" 2>/dev/null || true
    fi
    exit
}
trap cleanup EXIT INT TERM

# Start backend
echo -e "${GREEN}▶  Starting backend...${NC}"
cd "$PROJECT_ROOT/backend"
npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
echo "   PID: $BACKEND_PID"
echo "   Waiting for port detection..."
sleep 3

# Read the actual port used
if [ -f "$PROJECT_ROOT/backend/.port" ]; then
    BACKEND_PORT=$(cat "$PROJECT_ROOT/backend/.port")
    echo -e "   ${GREEN}✓ Backend using port: $BACKEND_PORT${NC}"
else
    echo -e "   ${YELLOW}⚠️  Using default port: $BACKEND_PORT${NC}"
fi

# Start frontend
echo -e "${GREEN}▶  Starting frontend...${NC}"
cd "$PROJECT_ROOT"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   PID: $FRONTEND_PID"

# Wait for services to be ready
echo ""
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"

# Wait for backend
echo -n "   Backend (http://localhost:$BACKEND_PORT): "
for i in {1..30}; do
    if curl -s http://localhost:$BACKEND_PORT/api/v1/health >/dev/null 2>&1; then
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

# Run health checks
echo ""
echo "═════════════════════════════════════════════════════"
echo "   🏥 Running Health Checks"
echo "═════════════════════════════════════════════════════"
echo ""

# Backend health
echo -n "🔍 Backend API Health: "
if curl -s http://localhost:$BACKEND_PORT/api/v1/health | grep -q "healthy"; then
    echo -e "${GREEN}✓ Healthy${NC}"
else
    echo -e "${RED}✗ Unhealthy${NC}"
fi

# Voice system test with audio
echo ""
echo "🎤 VOICE ENGINE TEST:"

# Determine voice message based on availability
if [ "$SESAME_AVAILABLE" = "true" ]; then
    VOICE_TEST_TEXT="Maya here. Sesame voice system is active and ready."
else
    VOICE_TEST_TEXT="Maya here. Voice system operational with fallback engines."
fi

# Test voice synthesis
VOICE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/voice/unified \
  -H "Content-Type: application/json" \
  -d "{
    \"text\": \"$VOICE_TEST_TEXT\",
    \"voiceEngine\": \"auto\",
    \"fallbackEnabled\": true
  }" 2>/dev/null || echo "{}")

if echo "$VOICE_RESPONSE" | grep -q '"success":true'; then
    VOICE_ENGINE=$(echo "$VOICE_RESPONSE" | grep -o '"engine":"[^"]*"' | cut -d'"' -f4)
    echo -e "   ${GREEN}✅ Voice generated via $VOICE_ENGINE${NC}"
    
    # Play audio on macOS
    if [ "$(uname)" = "Darwin" ]; then
        AUDIO_DATA=$(echo "$VOICE_RESPONSE" | grep -o '"audioData":"[^"]*"' | cut -d'"' -f4)
        if [ -n "$AUDIO_DATA" ] && [ "$AUDIO_DATA" != "null" ]; then
            echo "$AUDIO_DATA" | base64 -d > /tmp/maya_startup.wav 2>/dev/null && {
                ( afplay /tmp/maya_startup.wav && rm -f /tmp/maya_startup.wav ) &
                echo -e "   ${GREEN}✨ You should hear Maya's voice now!${NC}"
            }
        fi
    fi
else
    echo -e "   ${RED}❌ Voice test failed${NC}"
fi

# Final status
echo ""
echo "═════════════════════════════════════════════════════"
echo -e "   ${GREEN}✅ Spiralogic Oracle Beta is READY!${NC}"
echo "═════════════════════════════════════════════════════"
echo ""
echo "   🌐 Backend:  http://localhost:$BACKEND_PORT"
echo "   🎨 Frontend: http://localhost:3000/oracle"
echo "   📊 Health:   http://localhost:$BACKEND_PORT/api/v1/health"
echo ""
echo -e "   ${YELLOW}Press Ctrl+C to stop all services${NC}"
echo "═════════════════════════════════════════════════════"
echo ""

# Tail logs
echo -e "${BLUE}📡 Tailing logs (Ctrl+C to exit)...${NC}"
echo ""

tail -f backend/backend.log frontend.log 2>/dev/null || wait $BACKEND_PID $FRONTEND_PID