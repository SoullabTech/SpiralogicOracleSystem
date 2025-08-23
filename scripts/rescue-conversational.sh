#!/bin/bash
# Rescue Script - Fix Demo Mode and Enable Full Conversational Pipeline
set -e

echo "🚑 RESCUING CONVERSATIONAL PIPELINE"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Step 1: Stopping services...${NC}"
docker compose -f docker-compose.development.yml down -v

echo ""
echo -e "${BLUE}Step 2: Checking critical environment variables...${NC}"

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local found${NC}"
    
    # Check for critical flags
    if grep -q "DEMO_PIPELINE_DISABLED=true" .env.local; then
        echo -e "${GREEN}✅ DEMO_PIPELINE_DISABLED=true${NC}"
    else
        echo -e "${RED}❌ Adding DEMO_PIPELINE_DISABLED=true to .env.local${NC}"
        echo "DEMO_PIPELINE_DISABLED=true" >> .env.local
    fi
    
    if grep -q "USE_CLAUDE=true" .env.local; then
        echo -e "${GREEN}✅ USE_CLAUDE=true${NC}"
    else
        echo -e "${RED}❌ Adding USE_CLAUDE=true to .env.local${NC}"
        echo "USE_CLAUDE=true" >> .env.local
    fi
    
    if grep -q "ATTENDING_ENFORCEMENT_MODE=relaxed" .env.local; then
        echo -e "${GREEN}✅ ATTENDING_ENFORCEMENT_MODE=relaxed${NC}"
    else
        echo -e "${RED}❌ Adding ATTENDING_ENFORCEMENT_MODE=relaxed to .env.local${NC}"
        echo "ATTENDING_ENFORCEMENT_MODE=relaxed" >> .env.local
    fi
else
    echo -e "${RED}❌ .env.local not found - creating with conversational flags${NC}"
    cat > .env.local << 'EOF'
# Conversational Pipeline (CRITICAL)
DEMO_PIPELINE_DISABLED=true
USE_CLAUDE=true
ATTENDING_ENFORCEMENT_MODE=relaxed
MAYA_GREETING_ENABLED=true
MAYA_MODE_DEFAULT=conversational
START_SERVER=full

# Multimodal Features
UPLOADS_ENABLED=true
BETA_BADGES_ENABLED=true
EMBEDDINGS_MODEL=text-embedding-3-large
VISION_MODEL=gpt-4o-mini

# Add your API keys here:
# OPENAI_API_KEY=sk-your-key-here
# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# SUPABASE_SERVICE_ROLE_KEY=your-service-key
EOF
    echo -e "${YELLOW}⚠️ Please add your API keys to .env.local${NC}"
fi

echo ""
echo -e "${BLUE}Step 3: Installing dependencies...${NC}"
npm install pdf-parse

echo ""
echo -e "${BLUE}Step 4: Rebuilding with conversational flags...${NC}"
docker compose -f docker-compose.development.yml up --build -d

echo ""
echo -e "${BLUE}Step 5: Waiting for services to start...${NC}"
sleep 20

echo ""
echo -e "${BLUE}Step 6: Testing conversational pipeline...${NC}"

RESPONSE=$(curl -s -X POST "http://localhost:3000/api/oracle/turn" \
  -H "content-type: application/json" \
  -d @- <<'JSON'
{
  "input": { "text": "Hello Oracle, test the conversational pipeline" },
  "conversationId": "c-rescue-test"
}
JSON
)

echo "Oracle Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

if echo "$RESPONSE" | grep -q "Consider diving into"; then
    echo ""
    echo -e "${RED}❌ STILL IN DEMO MODE${NC}"
    echo ""
    echo "Checking container environment variables..."
    docker compose -f docker-compose.development.yml exec frontend \
      /bin/sh -c 'printenv | grep -E "DEMO_PIPELINE_DISABLED|USE_CLAUDE|ATTENDING" || echo "Variables not found"'
else
    echo ""
    echo -e "${GREEN}🎉 CONVERSATIONAL PIPELINE ACTIVE!${NC}"
    echo ""
    echo -e "${GREEN}✅ Services ready at:${NC}"
    echo "   🖥️  Frontend: http://localhost:3000"
    echo "   📊 Admin: http://localhost:3000/admin/overview"
    echo "   🏅 Badges: http://localhost:3000/beta/badges"
    echo ""
    echo -e "${BLUE}🎯 Ready for multimodal testing!${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"