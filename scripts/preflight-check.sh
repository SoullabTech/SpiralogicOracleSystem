#!/bin/bash
# Final Preflight Check - 2-3 minute validation before beta launch
set -e

echo "🛫 SPIRALOGIC MULTIMODAL BETA PREFLIGHT CHECK"
echo "============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PREFLIGHT_PASS=true

check_requirement() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        PREFLIGHT_PASS=false
    fi
}

echo -e "${BLUE}🐳 Docker & Ports${NC}"
echo "────────────────"

# Check if Docker is running
if docker info >/dev/null 2>&1; then
    check_requirement 0 "Docker daemon running"
else
    check_requirement 1 "Docker daemon not running"
fi

# Check critical ports
for port in 3000 8080 6379; do
    if lsof -i :$port >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $port in use${NC}"
    else
        echo -e "${GREEN}✅ Port $port available${NC}"
    fi
done

echo ""
echo -e "${BLUE}🔑 Environment Keys${NC}"
echo "──────────────────"

# Check environment variables
[ ! -z "$OPENAI_API_KEY" ] && check_requirement 0 "OPENAI_API_KEY set" || check_requirement 1 "OPENAI_API_KEY missing"
[ ! -z "$NEXT_PUBLIC_SUPABASE_URL" ] && check_requirement 0 "SUPABASE_URL set" || check_requirement 1 "SUPABASE_URL missing"
[ ! -z "$SUPABASE_SERVICE_ROLE_KEY" ] && check_requirement 0 "SERVICE_ROLE_KEY set" || check_requirement 1 "SERVICE_ROLE_KEY missing"

echo ""
echo -e "${BLUE}🚀 Feature Flags${NC}"
echo "───────────────"

# Check critical feature flags
[ "$USE_CLAUDE" = "true" ] && check_requirement 0 "USE_CLAUDE=true" || check_requirement 1 "USE_CLAUDE not enabled"
[ "$UPLOADS_ENABLED" = "true" ] && check_requirement 0 "UPLOADS_ENABLED=true" || check_requirement 1 "UPLOADS_ENABLED not enabled"
[ "$BETA_BADGES_ENABLED" = "true" ] && check_requirement 0 "BETA_BADGES_ENABLED=true" || check_requirement 1 "BETA_BADGES_ENABLED not enabled"
[ "$ATTENDING_ENFORCEMENT_MODE" = "relaxed" ] && check_requirement 0 "ATTENDING_ENFORCEMENT_MODE=relaxed" || check_requirement 1 "ATTENDING_ENFORCEMENT_MODE not relaxed"

echo ""
echo -e "${BLUE}🎵 FFmpeg Check${NC}"
echo "──────────────"

# Check ffmpeg for Whisper
if command -v ffmpeg >/dev/null 2>&1; then
    check_requirement 0 "ffmpeg installed"
else
    echo -e "${YELLOW}⚠️  ffmpeg not found - audio transcription may fail${NC}"
fi

echo ""
echo -e "${BLUE}📦 Dependencies${NC}"
echo "──────────────"

# Check Node dependencies
if [ -f "package.json" ]; then
    npm list pdf-parse >/dev/null 2>&1 && check_requirement 0 "pdf-parse installed" || check_requirement 1 "pdf-parse missing"
    npm list openai >/dev/null 2>&1 && check_requirement 0 "openai SDK installed" || check_requirement 1 "openai SDK missing"
    npm list @supabase/supabase-js >/dev/null 2>&1 && check_requirement 0 "Supabase client installed" || check_requirement 1 "Supabase client missing"
else
    check_requirement 1 "package.json not found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$PREFLIGHT_PASS" = true ]; then
    echo -e "${GREEN}🎉 PREFLIGHT CHECK PASSED!${NC}"
    echo ""
    echo -e "${GREEN}✅ Ready for launch sequence:${NC}"
    echo "   ./launch-multimodal-beta.sh"
    echo ""
else
    echo -e "${RED}🔧 PREFLIGHT CHECK FAILED${NC}"
    echo ""
    echo -e "${RED}❌ Issues to resolve:${NC}"
    echo "   • Install missing dependencies"
    echo "   • Set required environment variables"
    echo "   • Enable critical feature flags"
    echo ""
    echo -e "${BLUE}💡 Quick fixes:${NC}"
    echo "   npm install pdf-parse openai @supabase/supabase-js"
    echo "   Copy settings from .env.beta-launch to .env.local"
    echo "   Restart Docker if needed"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"