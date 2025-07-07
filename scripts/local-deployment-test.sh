#!/bin/bash

echo "🔮 SPIRALOGIC ORACLE LOCAL DEPLOYMENT TEST"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Load environment variables
if [ -f .env ]; then
    echo "📋 Loading environment variables..."
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✅ Environment loaded${NC}"
else
    echo -e "${RED}❌ .env file not found${NC}"
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker available${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js available${NC}"

echo ""
echo -e "${YELLOW}🐳 Building local Docker containers...${NC}"

# Build backend
echo "Building backend container..."
cd backend
docker build -t spiralogic-oracle-backend:local .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend container built${NC}"
else
    echo -e "${RED}❌ Backend container build failed${NC}"
    exit 1
fi

cd ..

# Build frontend
echo "Building frontend container..."
docker build -t spiralogic-oracle-frontend:local .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend container built${NC}"
else
    echo -e "${RED}❌ Frontend container build failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🚀 Starting local services...${NC}"

# Start with docker-compose
docker-compose up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Services started${NC}"
else
    echo -e "${RED}❌ Failed to start services${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}⏳ Waiting for services to initialize...${NC}"
sleep 10

# Test services
echo ""
echo -e "${YELLOW}🧪 Testing services...${NC}"

# Test frontend
if curl -s http://localhost:3000 >/dev/null; then
    echo -e "${GREEN}✅ Frontend: http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Frontend not responding${NC}"
fi

# Test backend
if curl -s http://localhost:8080/api/health >/dev/null; then
    echo -e "${GREEN}✅ Backend API: http://localhost:8080${NC}"
else
    echo -e "${RED}❌ Backend API not responding${NC}"
fi

# Test voice integration (if keys are set)
if [ ! -z "$ELEVENLABS_API_KEY" ] && [ "$ELEVENLABS_API_KEY" != "your-elevenlabs-key-here" ]; then
    echo ""
    echo -e "${YELLOW}🎤 Testing voice integration...${NC}"
    cd backend
    if [ -f "test-voice-integration.js" ]; then
        timeout 30s node test-voice-integration.js
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Voice integration working${NC}"
        else
            echo -e "${YELLOW}⚠️  Voice integration test incomplete${NC}"
        fi
    fi
    cd ..
else
    echo -e "${YELLOW}⚠️  Skipping voice test (no API key configured)${NC}"
fi

echo ""
echo -e "${BLUE}📊 LOCAL DEPLOYMENT STATUS${NC}"
echo "=========================="
echo ""
echo "🌐 Access Points:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:8080"
echo "  - Health Check: http://localhost:8080/api/health"
echo ""
echo "🔧 Container Status:"
docker-compose ps

echo ""
echo "📝 Next Steps:"
echo "1. Test the Oracle interface at http://localhost:3000"
echo "2. Configure your API keys in .env file"
echo "3. Install snet-cli and akash for full deployment"
echo ""
echo -e "${GREEN}🎉 Local deployment test complete!${NC}"
echo ""
echo "To stop services: docker-compose down"