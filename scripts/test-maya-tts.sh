#!/bin/bash

# Maya TTS Pipeline Diagnostic Script
# Tests the complete TTS flow from backend to audio generation

set -e

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔮 Maya TTS Pipeline Diagnostic${NC}"
echo "================================="
echo ""

# Step 1: Check if backend is running
echo -e "${CYAN}1. Checking backend health...${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:3002/api/health 2>/dev/null || echo "FAILED")

if [[ "$HEALTH_RESPONSE" == "FAILED" ]]; then
    echo -e "${RED}❌ Backend not running on port 3002${NC}"
    echo "Start backend with: cd backend && PORT=3002 npm start"
    exit 1
fi

echo -e "${GREEN}✅ Backend is healthy${NC}"
echo "Response: $HEALTH_RESPONSE"
echo ""

# Step 2: Check TTS service configuration
echo -e "${CYAN}2. Checking TTS service configuration...${NC}"
TTS_CONFIG=$(curl -s http://localhost:3002/api/v1/health 2>/dev/null | grep -o '"tts":"[^"]*"' || echo "NOT_FOUND")

if [[ "$TTS_CONFIG" == "NOT_FOUND" ]]; then
    echo -e "${YELLOW}⚠️  TTS service not configured in health endpoint${NC}"
else
    echo -e "${GREEN}✅ TTS Config: $TTS_CONFIG${NC}"
fi
echo ""

# Step 3: Test direct TTS generation
echo -e "${CYAN}3. Testing TTS audio generation...${NC}"
echo "Sending test message to Maya's TTS..."

TTS_RESPONSE=$(curl -s -X POST http://localhost:3002/api/tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is Maya speaking. I can hear you clearly and Im ready to help.",
    "voice": "maya",
    "engine": "elevenlabs"
  }' 2>/dev/null)

# Check if response contains audio data or URL
if echo "$TTS_RESPONSE" | grep -q "audioUrl\|audioData\|url"; then
    echo -e "${GREEN}✅ TTS returned audio data${NC}"
    
    # Extract audio URL if present
    AUDIO_URL=$(echo "$TTS_RESPONSE" | grep -o '"audioUrl":"[^"]*"' | cut -d'"' -f4)
    if [[ ! -z "$AUDIO_URL" ]]; then
        echo "Audio URL: $AUDIO_URL"
    fi
elif echo "$TTS_RESPONSE" | grep -q "error"; then
    echo -e "${RED}❌ TTS Error:${NC}"
    echo "$TTS_RESPONSE" | jq '.' 2>/dev/null || echo "$TTS_RESPONSE"
    echo ""
    echo -e "${YELLOW}Common fixes:${NC}"
    echo "1. Check ELEVENLABS_API_KEY in backend/.env"
    echo "2. Check SESAME_URL in backend/.env"
    echo "3. Ensure Sesame CSM is running (docker ps | grep sesame)"
else
    echo -e "${YELLOW}⚠️  Unexpected TTS response:${NC}"
    echo "$TTS_RESPONSE" | head -c 200
fi
echo ""

# Step 4: Test the full oracle pipeline with voice
echo -e "${CYAN}4. Testing full Oracle pipeline with TTS...${NC}"
ORACLE_RESPONSE=$(curl -s -X POST http://localhost:3002/api/oracle/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello Maya, can you hear me?",
    "userId": "test-user",
    "element": "aether",
    "oracle": "Maya",
    "enableVoice": true,
    "voiceEngine": "auto",
    "useCSM": true,
    "fallbackEnabled": true
  }' 2>/dev/null)

# Check for audio in response
if echo "$ORACLE_RESPONSE" | grep -q "audioUrl\|ttsService"; then
    echo -e "${GREEN}✅ Oracle returned audio response${NC}"
    
    # Extract TTS service used
    TTS_SERVICE=$(echo "$ORACLE_RESPONSE" | grep -o '"ttsService":"[^"]*"' | cut -d'"' -f4)
    if [[ ! -z "$TTS_SERVICE" ]]; then
        echo "TTS Service: $TTS_SERVICE"
    fi
    
    # Extract audio URL
    AUDIO_URL=$(echo "$ORACLE_RESPONSE" | grep -o '"audioUrl":"[^"]*"' | cut -d'"' -f4)
    if [[ ! -z "$AUDIO_URL" ]]; then
        echo "Audio URL: $AUDIO_URL"
        
        # Try to download the audio
        if [[ "$AUDIO_URL" == /* ]]; then
            # Relative URL, prepend host
            FULL_URL="http://localhost:3002$AUDIO_URL"
        else
            FULL_URL="$AUDIO_URL"
        fi
        
        echo ""
        echo -e "${CYAN}5. Attempting to download audio...${NC}"
        curl -s -o maya-test-audio.mp3 "$FULL_URL" 2>/dev/null
        
        if [[ -f maya-test-audio.mp3 ]]; then
            FILE_SIZE=$(ls -lh maya-test-audio.mp3 | awk '{print $5}')
            echo -e "${GREEN}✅ Audio downloaded successfully (size: $FILE_SIZE)${NC}"
            echo "File saved as: maya-test-audio.mp3"
            echo ""
            echo -e "${YELLOW}To play the audio:${NC}"
            echo "  macOS: afplay maya-test-audio.mp3"
            echo "  Linux: mpg123 maya-test-audio.mp3"
        else
            echo -e "${RED}❌ Failed to download audio${NC}"
        fi
    fi
else
    echo -e "${RED}❌ No audio in Oracle response${NC}"
    echo "Response preview:"
    echo "$ORACLE_RESPONSE" | head -c 500
    echo ""
    echo -e "${YELLOW}Debug info:${NC}"
    echo "$ORACLE_RESPONSE" | grep -o '"debug":{[^}]*}' || echo "No debug info found"
fi

echo ""
echo -e "${YELLOW}=================================${NC}"
echo -e "${CYAN}Diagnostic Summary:${NC}"
echo ""

# Summary
if [[ -f maya-test-audio.mp3 ]]; then
    echo -e "${GREEN}✅ TTS Pipeline is WORKING${NC}"
    echo "Maya can generate and return audio successfully!"
else
    echo -e "${RED}❌ TTS Pipeline has issues${NC}"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Check backend logs: cd backend && npm start"
    echo "2. Verify environment variables:"
    echo "   - ELEVENLABS_API_KEY"
    echo "   - SESAME_URL"
    echo "   - HUGGING_FACE_API_KEY"
    echo "3. Check if Sesame CSM is running:"
    echo "   docker ps | grep sesame"
    echo "4. Test with fallback TTS:"
    echo "   Set USE_FALLBACK_TTS=true in backend/.env"
fi

echo ""
echo -e "${YELLOW}Check frontend console for any playback errors.${NC}"