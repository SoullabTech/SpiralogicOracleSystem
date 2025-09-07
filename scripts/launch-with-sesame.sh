#!/bin/bash
# 🚀 Complete Sesame-Primary Launch Script
# This script sets up and runs the entire stack with Sesame as primary voice

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}🚀 Sesame-Primary Oracle System Launcher${NC}"
echo "========================================"
echo ""

# Check if setup is needed
if ! docker images sesame-csm:local -q | grep -q .; then
    echo -e "${YELLOW}🔧 First-time setup required${NC}"
    echo "Running Sesame CSM setup..."
    echo ""
    
    ./scripts/setup-sesame-local.sh
    
    echo ""
    echo -e "${GREEN}✅ Setup complete!${NC}"
    echo ""
fi

# Function to check if a process is running
check_process() {
    local name=$1
    local port=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✓ $name running on port $port${NC}"
        return 0
    else
        return 1
    fi
}

# Check if Sesame is already running
if check_process "Sesame CSM" 8000; then
    echo -e "${GREEN}✓ Sesame CSM server already running${NC}"
else
    echo -e "${YELLOW}🎤 Starting Sesame CSM server...${NC}"
    echo "This will run in the background and may take 1-2 minutes for model loading"
    echo ""
    
    # Start Sesame in background
    ./scripts/run-sesame-server.sh &
    SESAME_PID=$!
    
    echo "Sesame CSM starting (PID: $SESAME_PID)"
    echo "Waiting for server to be ready..."
    
    # Wait for Sesame to be ready (up to 3 minutes)
    for i in {1..180}; do
        if curl -s http://localhost:8000/health >/dev/null 2>&1; then
            SESAME_HEALTH=$(curl -s http://localhost:8000/health)
            if echo "$SESAME_HEALTH" | grep -q '"model_loaded":true'; then
                echo -e "\n${GREEN}✅ Sesame CSM ready and model loaded!${NC}"
                break
            fi
        fi
        echo -n "."
        sleep 1
        
        if [ $i -eq 180 ]; then
            echo -e "\n${RED}❌ Sesame CSM failed to start within 3 minutes${NC}"
            echo "Check Docker logs: docker logs sesame-csm-server"
            kill $SESAME_PID 2>/dev/null || true
            exit 1
        fi
    done
fi

echo ""
echo -e "${CYAN}🎉 Ready to launch with Sesame as primary voice!${NC}"
echo ""
echo -e "${YELLOW}Now starting the full Oracle system...${NC}"
echo ""

# Launch the beta system (which now includes audible voice verification)
cd backend
./scripts/start-beta.sh

# Clean up function
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down all services...${NC}"
    # Kill Sesame if we started it
    if [ -n "$SESAME_PID" ]; then
        kill $SESAME_PID 2>/dev/null || true
        docker stop sesame-csm-server 2>/dev/null || true
    fi
}

# Set up cleanup on exit
trap cleanup EXIT INT TERM

# Keep running (the start-beta.sh script will handle the main loop)
wait