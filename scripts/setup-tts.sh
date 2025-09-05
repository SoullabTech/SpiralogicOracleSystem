#!/bin/bash

# TTS Setup and Testing Script for Soullab
# Tests Sesame and ElevenLabs configurations

echo "🎙️  Soullab TTS Setup & Testing"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local not found${NC}"
    echo "Creating from template..."
    cp .env.example .env.local
    echo -e "${GREEN}✓ Created .env.local - please configure your API keys${NC}"
    exit 1
fi

# Source environment variables
source .env.local

echo ""
echo "📋 Current Configuration:"
echo "------------------------"

# Check Sesame
if [ -n "$SESAME_TTS_URL" ] || [ -n "$NORTHFLANK_SESAME_URL" ]; then
    SESAME_URL="${SESAME_TTS_URL:-$NORTHFLANK_SESAME_URL}"
    echo -e "${GREEN}✓ Sesame URL:${NC} $SESAME_URL"
    
    # Test Sesame health
    echo -n "  Testing connection... "
    if curl -s -f -m 5 "$SESAME_URL/health" > /dev/null 2>&1; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${RED}FAILED${NC}"
    fi
else
    echo -e "${YELLOW}○ Sesame:${NC} Not configured"
fi

# Check ElevenLabs
if [ -n "$ELEVENLABS_API_KEY" ]; then
    echo -e "${GREEN}✓ ElevenLabs:${NC} API key configured (${#ELEVENLABS_API_KEY} chars)"
    
    # Test ElevenLabs
    echo -n "  Testing API key... "
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "xi-api-key: $ELEVENLABS_API_KEY" \
        "https://api.elevenlabs.io/v1/voices")
    
    if [ "$RESPONSE" = "200" ]; then
        echo -e "${GREEN}OK${NC}"
    elif [ "$RESPONSE" = "401" ]; then
        echo -e "${RED}INVALID KEY${NC}"
    else
        echo -e "${RED}FAILED (HTTP $RESPONSE)${NC}"
    fi
else
    echo -e "${YELLOW}○ ElevenLabs:${NC} Not configured"
fi

# Check mock mode
if [ "$TTS_MOCK_MODE" = "true" ]; then
    echo -e "${YELLOW}⚠ Mock mode:${NC} ENABLED (using placeholder audio)"
fi

echo ""
echo "🔧 TTS Settings:"
echo "---------------"
echo "Fallback enabled: ${TTS_ENABLE_FALLBACK:-true}"
echo "Cache enabled: ${TTS_ENABLE_CACHE:-true}"
echo "Debug mode: ${MAYA_DEBUG_VOICE:-false}"

echo ""
echo "🧪 Testing TTS Generation:"
echo "-------------------------"

# Test with curl
echo "Testing Maya voice generation..."

# Start backend if not running
BACKEND_PORT="${BACKEND_PORT:-3002}"
if ! lsof -i:$BACKEND_PORT > /dev/null 2>&1; then
    echo -e "${YELLOW}Backend not running on port $BACKEND_PORT${NC}"
    echo "Start it with: cd backend && npm run dev"
else
    # Test the actual TTS endpoint
    echo "Sending test request to backend..."
    
    RESPONSE=$(curl -s -X POST "http://localhost:$BACKEND_PORT/api/tts/generate" \
        -H "Content-Type: application/json" \
        -d '{
            "text": "Hello, this is Maya speaking. Your voice system is working correctly.",
            "voice": "maya"
        }')
    
    if echo "$RESPONSE" | grep -q "audioUrl"; then
        echo -e "${GREEN}✅ TTS generation successful!${NC}"
        echo "Response: $RESPONSE" | head -c 200
    else
        echo -e "${RED}❌ TTS generation failed${NC}"
        echo "Response: $RESPONSE"
    fi
fi

echo ""
echo "📊 Health Check:"
echo "---------------"

# Check health endpoint
HEALTH=$(curl -s "http://localhost:3000/api/tts/health" 2>/dev/null)

if [ -n "$HEALTH" ]; then
    echo "$HEALTH" | python3 -m json.tool 2>/dev/null || echo "$HEALTH"
else
    echo -e "${YELLOW}Health endpoint not available${NC}"
fi

echo ""
echo "🚀 Quick Setup Commands:"
echo "-----------------------"

if [ -z "$SESAME_TTS_URL" ] && [ -z "$NORTHFLANK_SESAME_URL" ]; then
    echo "1. Deploy Sesame CSM:"
    echo "   docker run -p 8080:8080 sesame-csm:latest"
    echo "   Then set: SESAME_TTS_URL=http://localhost:8080"
    echo ""
fi

if [ -z "$ELEVENLABS_API_KEY" ]; then
    echo "2. Get ElevenLabs API key:"
    echo "   Visit: https://elevenlabs.io/api"
    echo "   Then set: ELEVENLABS_API_KEY=your-key-here"
    echo ""
fi

echo "3. For development without TTS:"
echo "   Set: TTS_MOCK_MODE=true"
echo ""
echo "4. Test with:"
echo "   curl http://localhost:3000/api/tts/health"

echo ""
echo "✨ Setup complete!"