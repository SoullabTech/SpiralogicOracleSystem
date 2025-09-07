#!/bin/bash

# Verify Sesame-Primary Configuration
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Verifying Sesame-Primary Configuration${NC}"
echo "=========================================="

# Check environment variables
echo -e "\n${YELLOW}📋 Checking environment variables...${NC}"

check_env() {
    local var=$1
    local expected=$2
    local value=$(grep "^$var=" .env.local | cut -d'=' -f2 || echo "NOT_SET")
    
    if [ "$value" = "$expected" ]; then
        echo -e "${GREEN}✓ $var=$value${NC}"
    else
        echo -e "${RED}❌ $var=$value (expected: $expected)${NC}"
    fi
}

check_env "VOICE_PRIMARY" "sesame"
check_env "SESAME_PRIMARY_MODE" "true"
check_env "SESAME_FALLBACK_ENABLED" "false"
check_env "ELEVENLABS_FALLBACK_ONLY" "true"

# Check file existence
echo -e "\n${YELLOW}📁 Checking created files...${NC}"

check_file() {
    local file=$1
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file exists${NC}"
    else
        echo -e "${RED}❌ $file missing${NC}"
    fi
}

check_file "backend/src/services/VoiceRouter.ts"
check_file "app/api/voice/unified/route.ts"

# Check if Sesame server is running
echo -e "\n${YELLOW}🖥️  Checking Sesame server status...${NC}"
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Sesame server is running on localhost:8000${NC}"
else
    echo -e "${YELLOW}⚠️  Sesame server not running - start with: ./scripts/run-sesame-server.sh${NC}"
fi

# Check backend server
echo -e "\n${YELLOW}🖥️  Checking backend server status...${NC}"
if curl -s http://localhost:3002/api/v1/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend server is running on localhost:3002${NC}"
else
    echo -e "${YELLOW}⚠️  Backend server not running - start with: cd backend && npm run dev${NC}"
fi

echo -e "\n${BLUE}📝 Next Steps:${NC}"
echo "1. Start Sesame server: ${YELLOW}./scripts/run-sesame-server.sh${NC}"
echo "2. Start backend server: ${YELLOW}cd backend && npm run dev${NC}"
echo "3. Test voice synthesis: ${YELLOW}curl -X POST localhost:3000/api/voice/unified -H 'Content-Type: application/json' -d '{\"text\":\"Hello from Sesame!\", \"voiceEngine\":\"auto\"}'${NC}"
echo "4. Monitor logs for Sesame-first behavior"

echo -e "\n${GREEN}🎉 Configuration verification complete!${NC}"
