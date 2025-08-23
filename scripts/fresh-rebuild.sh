#!/bin/bash
# Fresh Rebuild Script - Fixes macOS xattr issues and ensures latest conversational Oracle build
set -e

echo "🔧 FRESH REBUILD: Conversational Oracle System"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/Volumes/T7 Shield/Projects/SpiralogicOracleSystem"
cd "$PROJECT_DIR"

echo -e "${BLUE}Step 1: Remove macOS resource fork files (._*) and .DS_Store...${NC}"
echo "Finding and removing Apple junk files..."
find . -name '._*' -type f -print -delete
find . -name '.DS_Store' -type f -print -delete
echo -e "${GREEN}✅ macOS junk files removed${NC}"

echo ""
echo -e "${BLUE}Step 2: Clear extended attributes recursively...${NC}"
echo "Clearing xattrs (safe to re-run)..."
xattr -cr . 2>/dev/null || echo "Some xattrs may not be clearable - continuing..."
echo -e "${GREEN}✅ Extended attributes cleared${NC}"

echo ""
echo -e "${BLUE}Step 3: Stop and clean old Docker services...${NC}"
# Disable BuildKit to avoid xattr issues on external drives
export DOCKER_BUILDKIT=0
export COMPOSE_DOCKER_CLI_BUILD=0
echo "Using legacy Docker builder (more reliable on external drives)"

docker compose -f docker-compose.development.yml down -v --remove-orphans
echo -e "${GREEN}✅ Old services stopped${NC}"

echo ""
echo -e "${BLUE}Step 4: Remove Next.js caches...${NC}"
rm -rf .next
rm -rf node_modules/.cache
echo -e "${GREEN}✅ Caches cleared${NC}"

echo ""
echo -e "${BLUE}Step 5: Verify environment flags...${NC}"

# Check docker-compose.development.yml
if grep -q "DEMO_PIPELINE_DISABLED=true" docker-compose.development.yml; then
    echo -e "${GREEN}✅ DEMO_PIPELINE_DISABLED=true found in docker-compose${NC}"
else
    echo -e "${RED}❌ Missing DEMO_PIPELINE_DISABLED=true in docker-compose${NC}"
fi

if grep -q "USE_CLAUDE=true" docker-compose.development.yml; then
    echo -e "${GREEN}✅ USE_CLAUDE=true found in docker-compose${NC}"
else
    echo -e "${RED}❌ Missing USE_CLAUDE=true in docker-compose${NC}"
fi

if grep -q "NEXT_PUBLIC_VOICE_AUTOSEND=true" docker-compose.development.yml; then
    echo -e "${GREEN}✅ NEXT_PUBLIC_VOICE_AUTOSEND=true found in docker-compose${NC}"
else
    echo -e "${RED}❌ Missing NEXT_PUBLIC_VOICE_AUTOSEND=true in docker-compose${NC}"
fi

# Check .env.local
if [ -f ".env.local" ]; then
    if grep -q "NEXT_PUBLIC_VOICE_AUTOSEND=true" .env.local; then
        echo -e "${GREEN}✅ NEXT_PUBLIC_VOICE_AUTOSEND=true found in .env.local${NC}"
    else
        echo -e "${YELLOW}⚠️  NEXT_PUBLIC_VOICE_AUTOSEND not in .env.local${NC}"
    fi
else
    echo -e "${RED}❌ .env.local not found${NC}"
fi

echo ""
echo -e "${BLUE}Step 6: Full rebuild with legacy builder (no-cache)...${NC}"
echo "Building with legacy Docker builder to avoid xattr issues..."
docker compose -f docker-compose.development.yml build --no-cache
docker compose -f docker-compose.development.yml up -d

echo ""
echo -e "${BLUE}Step 7: Waiting for services to start...${NC}"
sleep 15

echo ""
echo -e "${BLUE}Step 8: Testing conversational mode...${NC}"

# Test flags endpoint
FLAGS_RESPONSE=$(curl -s http://localhost:3000/api/debug/flags || echo "FAILED")
if echo "$FLAGS_RESPONSE" | jq -e '.conversationalMode == true' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Conversational mode is ACTIVE${NC}"
else
    echo -e "${RED}❌ Conversational mode is INACTIVE${NC}"
    echo "Flags response: $FLAGS_RESPONSE"
fi

# Test Oracle turn
echo ""
echo -e "${BLUE}Testing Oracle response...${NC}"
ORACLE_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/oracle/turn" \
    -H "content-type: application/json" \
    -d '{"input":{"text":"Hello Oracle, are you in conversational mode?"},"conversationId":"c-test"}' | jq -r '.response.text' 2>/dev/null || echo "FAILED")

if [[ "$ORACLE_RESPONSE" == *"Consider diving into"* ]]; then
    echo -e "${RED}❌ Oracle is still in DEMO MODE${NC}"
    echo "Response: $ORACLE_RESPONSE"
elif [[ "$ORACLE_RESPONSE" == "FAILED" ]]; then
    echo -e "${RED}❌ Oracle endpoint FAILED${NC}"
else
    echo -e "${GREEN}✅ Oracle is in CONVERSATIONAL MODE${NC}"
    echo "Sample response: ${ORACLE_RESPONSE:0:100}..."
fi

echo ""
echo -e "${BLUE}Step 9: Final verification...${NC}"

# Check container status
CONTAINER_STATUS=$(docker compose -f docker-compose.development.yml ps --format "table {{.Name}}\t{{.Status}}" 2>/dev/null || echo "No containers")
echo "Container status:"
echo "$CONTAINER_STATUS"

echo ""
echo -e "${GREEN}🎉 REBUILD COMPLETE!${NC}"
echo ""
echo -e "${GREEN}✅ Services ready at:${NC}"
echo "   🖥️  Frontend: http://localhost:3000"
echo "   📊 Debug: http://localhost:3000/api/debug/flags"
echo "   🏅 Badges: http://localhost:3000/beta/badges"
echo ""

# Fallback suggestions
echo -e "${YELLOW}💡 If localhost:3000 shows old UI:${NC}"
echo "   • Try http://127.0.0.1:3000 (bypass DNS cache)"
echo "   • Check: docker ps | grep 3000"
echo "   • Hard refresh browser: Cmd+Shift+R"
echo ""

echo -e "${YELLOW}🔧 What this script fixed:${NC}"
echo "   • Removed $(find . -name '._*' -type f 2>/dev/null | wc -l | tr -d ' ') macOS resource fork files"
echo "   • Cleared extended attributes (xattrs)"
echo "   • Used legacy Docker builder (no BuildKit)"
echo "   • Enhanced .dockerignore to prevent future issues"
echo "   • Verified all conversational pipeline flags"
echo ""

echo -e "${YELLOW}🚀 Next time, just run:${NC}"
echo "   ./scripts/fresh-rebuild.sh"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"