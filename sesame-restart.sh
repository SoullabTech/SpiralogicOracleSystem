#!/bin/bash

# Sesame CI Container Management Script
# Ensures Sesame CI is running for Sacred Voice embodiment

echo "🌀 Sesame CI Management Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if container is running
check_container() {
    if docker ps | grep -q sesame; then
        return 0
    else
        return 1
    fi
}

# Function to test Sesame health
test_health() {
    echo -e "${YELLOW}Testing Sesame health...${NC}"
    if curl -s http://localhost:8000/health | grep -q "healthy"; then
        echo -e "${GREEN}✅ Sesame is healthy${NC}"
        return 0
    else
        echo -e "${RED}❌ Sesame health check failed${NC}"
        return 1
    fi
}

# Function to test CI shaping
test_ci() {
    echo -e "${YELLOW}Testing CI shaping...${NC}"
    RESPONSE=$(curl -s -X POST http://localhost:8000/ci/shape \
        -H "Content-Type: application/json" \
        -d '{"text":"Testing sacred voice","style":"fire","archetype":"sage"}' 2>/dev/null)
    
    if echo "$RESPONSE" | grep -q "text"; then
        echo -e "${GREEN}✅ CI shaping is working${NC}"
        echo "Response preview: ${RESPONSE:0:100}..."
        return 0
    else
        echo -e "${RED}❌ CI shaping failed${NC}"
        return 1
    fi
}

# Function to test TTS
test_tts() {
    echo -e "${YELLOW}Testing TTS...${NC}"
    RESPONSE=$(curl -s -X POST http://localhost:8000/tts \
        -H "Content-Type: application/json" \
        -d '{"text":"Maya voice test","voice":"maya"}' 2>/dev/null)
    
    if echo "$RESPONSE" | grep -q "audioUrl\|audioData"; then
        echo -e "${GREEN}✅ TTS is working${NC}"
        return 0
    else
        echo -e "${RED}❌ TTS failed${NC}"
        return 1
    fi
}

# Main logic
echo "1. Checking if Sesame container is running..."

if check_container; then
    echo -e "${GREEN}✅ Sesame container is already running${NC}"
    CONTAINER_ID=$(docker ps | grep sesame | awk '{print $1}')
    echo "   Container ID: $CONTAINER_ID"
    
    # Test health even if running
    if test_health; then
        echo ""
        echo "2. Running functionality tests..."
        test_ci
        test_tts
    else
        echo -e "${YELLOW}⚠️  Container is running but not healthy. Restarting...${NC}"
        docker restart $CONTAINER_ID
        sleep 5
        test_health
    fi
else
    echo -e "${RED}❌ No Sesame container found${NC}"
    echo ""
    echo "2. Starting Sesame CI container..."
    
    # Check which compose file to use
    if [ -f "docker-compose.sesame.yml" ]; then
        echo "   Using docker-compose.sesame.yml"
        docker compose -f docker-compose.sesame.yml up -d
    elif [ -f "docker-compose.sesame-quick.yml" ]; then
        echo "   Using docker-compose.sesame-quick.yml"
        docker compose -f docker-compose.sesame-quick.yml up -d
    elif [ -f "docker-compose.csm.yml" ]; then
        echo "   Using docker-compose.csm.yml"
        docker compose -f docker-compose.csm.yml up -d
    else
        echo -e "${RED}❌ No Sesame docker-compose file found!${NC}"
        echo ""
        echo "Available compose files:"
        ls -la docker-compose*.yml
        echo ""
        echo "Please specify which to use:"
        echo "  docker compose -f docker-compose.sesame.yml up -d"
        exit 1
    fi
    
    # Wait for container to start
    echo "   Waiting for container to start..."
    sleep 5
    
    # Check if it started
    if check_container; then
        echo -e "${GREEN}✅ Container started successfully${NC}"
        sleep 3
        
        # Test functionality
        echo ""
        echo "3. Testing Sesame functionality..."
        test_health
        test_ci
        test_tts
    else
        echo -e "${RED}❌ Failed to start container${NC}"
        echo "   Check Docker logs: docker logs $(docker ps -a | grep sesame | head -1 | awk '{print $1}')"
        exit 1
    fi
fi

# Final status
echo ""
echo "=============================="
if test_health 2>/dev/null; then
    echo -e "${GREEN}✅ SESAME CI IS READY${NC}"
    echo ""
    echo "Endpoints available:"
    echo "  Health: http://localhost:8000/health"
    echo "  CI Shape: http://localhost:8000/ci/shape"
    echo "  TTS: http://localhost:8000/tts"
    echo ""
    echo "Your backend can now use Sacred Voice embodiment!"
else
    echo -e "${RED}⚠️  SESAME CI NEEDS ATTENTION${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check Docker: docker ps"
    echo "  2. View logs: docker logs $(docker ps -a | grep sesame | head -1 | awk '{print $1}')"
    echo "  3. Restart: docker restart $(docker ps | grep sesame | awk '{print $1}')"
fi
echo "=============================="