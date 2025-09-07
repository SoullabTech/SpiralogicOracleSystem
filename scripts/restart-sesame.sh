#!/bin/bash

# Sesame CSM Restart Script for Soullab
# Restarts Docker containers and validates TTS service

echo "🔄 Restarting Sesame CSM for Soullab"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default ports
SESAME_PORT="${SESAME_PORT:-5000}"
BACKEND_PORT="${BACKEND_PORT:-3002}"

echo ""
echo -e "${BLUE}📋 Configuration:${NC}"
echo "Sesame Port: $SESAME_PORT"
echo "Backend Port: $BACKEND_PORT"

# Step 1: Check if containers exist
echo ""
echo -e "${BLUE}🔍 Checking existing containers...${NC}"

SESAME_CONTAINER=$(docker ps -a -q -f name=sesame)
if [ -n "$SESAME_CONTAINER" ]; then
    echo -e "${YELLOW}Found existing Sesame container: $SESAME_CONTAINER${NC}"
    echo "Stopping and removing..."
    docker stop $SESAME_CONTAINER > /dev/null 2>&1
    docker rm $SESAME_CONTAINER > /dev/null 2>&1
    echo -e "${GREEN}✓ Cleaned up old container${NC}"
else
    echo -e "${GREEN}✓ No existing containers found${NC}"
fi

# Step 2: Check for docker-compose files
echo ""
echo -e "${BLUE}🐳 Starting Sesame service...${NC}"

if [ -f "docker-compose.yml" ]; then
    echo "Using docker-compose.yml"
    
    # Start sesame service specifically
    docker-compose up -d sesame
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Docker compose started successfully${NC}"
    else
        echo -e "${RED}❌ Docker compose failed${NC}"
        exit 1
    fi
    
elif [ -f "backend/docker-compose.sesame-offline.yml" ]; then
    echo "Using offline Sesame configuration"
    cd backend
    docker-compose -f docker-compose.sesame-offline.yml up -d
    cd ..
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Offline Sesame started successfully${NC}"
    else
        echo -e "${RED}❌ Offline Sesame failed to start${NC}"
        exit 1
    fi
    
else
    echo -e "${YELLOW}No docker-compose file found. Starting with direct Docker run...${NC}"
    
    # Try to pull/run the sesame image directly
    if docker images | grep -q "sesame-csm"; then
        echo "Running local Sesame CSM image"
        docker run -d \
            --name sesame-csm \
            -p $SESAME_PORT:5000 \
            -e PORT=5000 \
            sesame-csm:latest
    else
        echo -e "${RED}❌ No Sesame image found${NC}"
        echo "Try building the image first or check Docker configuration"
        exit 1
    fi
fi

# Step 3: Wait for container to be ready
echo ""
echo -e "${BLUE}⏳ Waiting for Sesame to be ready...${NC}"

# Wait up to 30 seconds
for i in {1..30}; do
    if curl -s -f "http://localhost:$SESAME_PORT/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Sesame is ready!${NC}"
        break
    fi
    
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Sesame failed to start within 30 seconds${NC}"
        echo "Checking container logs..."
        docker logs sesame-csm 2>/dev/null || docker logs sesame 2>/dev/null
        exit 1
    fi
    
    echo -n "."
    sleep 1
done

# Step 4: Validate TTS endpoint
echo ""
echo -e "${BLUE}🧪 Testing TTS endpoint...${NC}"

TEST_RESPONSE=$(curl -s -X POST "http://localhost:$SESAME_PORT/api/tts" \
    -H "Content-Type: application/json" \
    -d '{"text":"Testing Sesame TTS","voice":"maya"}' 2>/dev/null)

if echo "$TEST_RESPONSE" | grep -q "audioUrl\|url"; then
    echo -e "${GREEN}✅ TTS endpoint working${NC}"
else
    echo -e "${YELLOW}⚠️ TTS endpoint may not be fully ready${NC}"
    echo "Response: $TEST_RESPONSE"
fi

# Step 5: Update environment variables
echo ""
echo -e "${BLUE}🔧 Updating environment configuration...${NC}"

SESAME_URL="http://localhost:$SESAME_PORT"

# Update .env.local if it exists
if [ -f .env.local ]; then
    # Remove old SESAME_TTS_URL line
    grep -v "^SESAME_TTS_URL=" .env.local > .env.local.tmp
    
    # Add new SESAME_TTS_URL
    echo "SESAME_TTS_URL=$SESAME_URL" >> .env.local.tmp
    
    mv .env.local.tmp .env.local
    echo -e "${GREEN}✓ Updated .env.local with Sesame URL${NC}"
else
    echo -e "${YELLOW}⚠️ .env.local not found - create it manually${NC}"
    echo "Add: SESAME_TTS_URL=$SESAME_URL"
fi

# Step 6: Test integration with backend
echo ""
echo -e "${BLUE}🔗 Testing backend integration...${NC}"

if lsof -i:$BACKEND_PORT > /dev/null 2>&1; then
    echo "Backend running on port $BACKEND_PORT"
    
    # Test TTS health endpoint
    HEALTH_RESPONSE=$(curl -s "http://localhost:3000/api/tts/health" 2>/dev/null)
    
    if echo "$HEALTH_RESPONSE" | grep -q '"healthy":true'; then
        echo -e "${GREEN}✅ Backend TTS integration working${NC}"
    else
        echo -e "${YELLOW}⚠️ Backend TTS integration needs restart${NC}"
        echo "Restart your backend: cd backend && npm run dev"
    fi
else
    echo -e "${YELLOW}⚠️ Backend not running${NC}"
    echo "Start it: cd backend && npm run dev"
fi

# Step 7: Show status summary
echo ""
echo -e "${GREEN}🎉 Sesame Restart Complete!${NC}"
echo "================================"

echo "📊 Service Status:"
echo "- Sesame CSM: http://localhost:$SESAME_PORT"
echo "- Health Check: http://localhost:$SESAME_PORT/health"
echo "- TTS API: http://localhost:$SESAME_PORT/api/tts"

echo ""
echo "🧪 Quick Tests:"
echo "curl http://localhost:$SESAME_PORT/health"
echo "curl http://localhost:3000/api/tts/health"

echo ""
echo "🔧 Environment:"
echo "SESAME_TTS_URL=$SESAME_URL"

echo ""
echo "📝 Next Steps:"
if ! lsof -i:$BACKEND_PORT > /dev/null 2>&1; then
    echo "1. Start backend: cd backend && npm run dev"
fi
echo "2. Test voice in browser at: http://localhost:3000/oracle"
echo "3. Check memory integration with: MAYA_DEBUG_MEMORY=true"

echo ""
echo -e "${GREEN}✨ Sesame is ready for Maya voice responses!${NC}"