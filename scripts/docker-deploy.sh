#!/bin/bash
# Docker Deployment Script for Multimodal Beta
set -e

echo "🐳 SPIRALOGIC MULTIMODAL BETA - DOCKER DEPLOYMENT"
echo "================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Clean start
echo -e "${BLUE}🧹 Cleaning previous containers...${NC}"
docker compose -f docker-compose.development.yml down -v

echo ""
echo -e "${BLUE}🔧 Building and starting services...${NC}"
docker compose -f docker-compose.development.yml up --build -d

echo ""
echo -e "${BLUE}⏳ Waiting for services to start...${NC}"
sleep 10

# Check service status
echo ""
echo -e "${BLUE}🔍 Checking service status...${NC}"
docker compose -f docker-compose.development.yml ps

echo ""
echo -e "${BLUE}🗄️ Running database migrations...${NC}"
if command -v supabase &> /dev/null; then
    supabase db push
    echo -e "${GREEN}✅ Migrations applied${NC}"
else
    echo -e "${YELLOW}⚠️ Supabase CLI not found - please run 'supabase db push' manually${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 DOCKER DEPLOYMENT COMPLETE!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ Services Available:${NC}"
echo "   🖥️  Frontend: http://localhost:3000"
echo "   🔧 Backend: http://localhost:8080"
echo "   📊 Admin: http://localhost:3000/admin/overview"
echo "   🏅 Badges: http://localhost:3000/beta/badges"
echo ""
echo -e "${BLUE}🧪 Quick Health Check:${NC}"
echo "   curl -s http://localhost:3000/api/admin/metrics?metric=overview | jq ."
echo ""
echo -e "${BLUE}🎯 Golden Path Test:${NC}"
echo "   1. Go to http://localhost:3000"
echo "   2. Sign in with admin email"
echo "   3. Drag PDF → ask about key arguments"
echo "   4. Drop voice memo → ask about content"
echo "   5. Upload image → ask about themes"
echo "   6. Watch badges unlock!"
echo ""
echo -e "${BLUE}📊 Monitor During Testing:${NC}"
echo "   • /admin/overview → Live metrics"
echo "   • /admin/beta → Badge progress"
echo "   • /debug/bridge → System health"
echo ""
echo -e "${BLUE}🛑 To Stop Services:${NC}"
echo "   docker compose -f docker-compose.development.yml down"
echo ""
echo "🚀 Ready for multimodal beta testing!"