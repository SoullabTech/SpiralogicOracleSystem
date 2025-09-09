#!/bin/bash

# 🚀 SpiralogicOracleSystem Local Launch Script
# This script starts all services needed for local development

echo "🌟 Starting SpiralogicOracleSystem Local Environment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local file not found!${NC}"
    echo "Please create .env.local with your environment variables"
    exit 1
fi

# Check if node_modules exists in root
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing root dependencies...${NC}"
    npm install
fi

# Check if backend node_modules exists
if [ ! -d "apps/api/backend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    cd apps/api/backend && npm install && cd ../../..
fi

# Check if frontend node_modules exists  
if [ ! -d "apps/web/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    cd apps/web && npm install && cd ../..
fi

# Build backend TypeScript
echo -e "${YELLOW}🔨 Building backend...${NC}"
cd apps/api/backend
npm run build 2>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Backend build had warnings, continuing...${NC}"
fi
cd ../../..

# Function to open new terminal tab (macOS)
open_new_tab() {
    osascript -e "tell application \"Terminal\" to do script \"$1\""
}

echo ""
echo -e "${GREEN}🚀 Starting services in new terminal tabs...${NC}"
echo ""

# Start Backend API Server in new tab
echo -e "${BLUE}1️⃣  Starting Backend API Server (port 3002)...${NC}"
open_new_tab "cd \"$PWD/apps/api/backend\" && PORT=3002 npm run dev"

# Give backend time to start
echo -e "${YELLOW}⏳ Waiting for backend to initialize...${NC}"
sleep 5

# Start Frontend Next.js Server in new tab
echo -e "${BLUE}2️⃣  Starting Frontend Next.js Server (port 3000)...${NC}"
open_new_tab "cd \"$PWD\" && npm run dev"

echo ""
echo -e "${GREEN}✨ SpiralogicOracleSystem is starting up!${NC}"
echo "=================================================="
echo ""
echo -e "${GREEN}🌐 Frontend:${NC} http://localhost:3000"
echo -e "${GREEN}🔧 Backend API:${NC} http://localhost:3002"
echo -e "${GREEN}🤖 Maya Chat:${NC} http://localhost:3000/maya/chat"
echo -e "${GREEN}❤️  Health Check:${NC} http://localhost:3002/api/v1/health"
echo ""
echo "=================================================="
echo -e "${BLUE}📋 Testing Checklist:${NC}"
echo "  ✓ Visit Maya Chat interface"
echo "  ✓ Test conversation with memory recall"
echo "  ✓ Try voice journaling (if microphone available)"
echo "  ✓ Check safety systems with various inputs"
echo "  ✓ Test orchestration routing"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "  • Backend logs appear in first Terminal tab"
echo "  • Frontend logs appear in second Terminal tab"
echo "  • Press Ctrl+C in each tab to stop services"
echo ""
echo -e "${GREEN}🎉 Happy testing!${NC}"