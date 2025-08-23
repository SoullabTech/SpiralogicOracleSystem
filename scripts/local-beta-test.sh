#!/bin/bash
# Local Beta Testing Script - Run this to test as a first-time user
set -e

echo "🧪 SPIRALOGIC MULTIMODAL BETA - LOCAL TESTING"
echo "============================================="
echo ""

# Configuration
BASE_URL="http://localhost:3000"
BACKEND_URL="http://localhost:8080"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Checking if services are running...${NC}"

# Check if frontend is responding
if curl -s "$BASE_URL" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend running at $BASE_URL${NC}"
else
    echo -e "${RED}❌ Frontend not responding at $BASE_URL${NC}"
    echo "Run: docker compose -f docker-compose.development.yml up --build"
    exit 1
fi

# Quick health check
echo ""
echo -e "${BLUE}🏥 Running health checks...${NC}"

HEALTH=$(curl -s "$BASE_URL/api/admin/metrics?metric=overview" 2>/dev/null || echo '{"error": "unavailable"}')
if echo "$HEALTH" | jq -e '.error' >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️ Admin metrics require authentication${NC}"
else
    echo -e "${GREEN}✅ Admin metrics responding${NC}"
fi

# Test Oracle endpoint
ORACLE_TEST=$(curl -s -X POST "$BASE_URL/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"Hello Oracle, are you ready for beta testing?"},"conversationId":"local-beta-test"}' \
  2>/dev/null || echo '{"error": "failed"}')

if echo "$ORACLE_TEST" | jq -e '.response.text' >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Oracle responding${NC}"
    ORACLE_RESPONSE=$(echo "$ORACLE_TEST" | jq -r '.response.text')
    echo "   Sample response: $(echo "$ORACLE_RESPONSE" | head -c 80)..."
else
    echo -e "${YELLOW}⚠️ Oracle may require authentication${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎯 READY FOR BETA TESTING!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}📱 Testing Interface:${NC}"
echo "   Open: $BASE_URL"
echo "   Sign in with your beta tester email"
echo ""
echo -e "${BLUE}🎯 Golden Path Test Flow:${NC}"
echo "   1. 🎵 Voice memo → ask about content → Voice Voyager badge"
echo "   2. 📄 PDF upload → ask for key points → Scholar badge"  
echo "   3. 🖼️ Image drop → ask about themes → Visionary badge"
echo "   4. 🧵 Multi-modal → ask how they connect → Thread Weaver"
echo ""
echo -e "${BLUE}📊 Monitoring Panels:${NC}"
echo "   • $BASE_URL/admin/overview → Live metrics"
echo "   • $BASE_URL/admin/beta → Badge progress"
echo "   • $BASE_URL/debug/bridge → System health"
echo "   • $BASE_URL/beta/badges → Your badge collection"
echo ""
echo -e "${BLUE}🧪 Test Upload Types:${NC}"
echo "   • Audio: .wav, .mp3, .m4a (voice memos work great)"
echo "   • Documents: .pdf, .txt, .md (articles, notes, papers)"
echo "   • Images: .jpg, .png, .gif (photos, screenshots, artwork)"
echo ""
echo -e "${BLUE}💡 Natural Questions to Try:${NC}"
echo '   • "What did I say about forgiveness in my recording?"'
echo '   • "What are the strongest arguments in this document?"'
echo '   • "What symbols do you notice in this image?"'
echo '   • "How do my uploads connect to show my growth patterns?"'
echo ""
echo -e "${BLUE}🏅 Watch for Badge Unlocks:${NC}"
echo "   Toast notifications appear when you earn new badges"
echo "   Each upload type has its own achievement path"
echo "   Cross-modal synthesis unlocks special thread badges"
echo ""
echo -e "${BLUE}🆘 Troubleshooting:${NC}"
echo "   • Upload stuck? Wait for 'ready' status before asking"
echo "   • Oracle not mentioning files? Ask more directly"
echo "   • Missing badges? Check that uploads processed successfully"
echo ""
echo -e "${GREEN}✨ Start beta testing at: $BASE_URL${NC}"
echo ""
echo "Happy testing! 🚀"