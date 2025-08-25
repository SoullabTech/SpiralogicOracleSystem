#!/bin/bash

# Final Sesame TTS Verification Script
# Run this after deploying to RunPod to verify real audio

echo "🎵 Sesame TTS Final Verification"
echo "================================"
echo ""

# Load environment
if [ -f ".env.local" ]; then
    export $(cat .env.local | grep -E '^(HF_|RUNPOD_|SESAME_|NEXT_PUBLIC_)' | xargs)
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check environment
if [ -z "$RUNPOD_API_KEY" ] || [ -z "$RUNPOD_SESAME_ENDPOINT_ID" ]; then
    echo -e "${RED}❌ Missing environment variables${NC}"
    echo "Required: RUNPOD_API_KEY, RUNPOD_SESAME_ENDPOINT_ID"
    exit 1
fi

echo -e "${GREEN}✅ Environment configured${NC}"
echo ""

# Test A: Direct RunPod
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}TEST A: Direct RunPod API${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "🚀 Running test-runpod-direct.sh..."
./test-runpod-direct.sh > /tmp/runpod-test.log 2>&1

if [ -f "runpod-direct.wav" ]; then
    SIZE=$(stat -f%z runpod-direct.wav 2>/dev/null || stat -c%s runpod-direct.wav 2>/dev/null)
    echo -e "📊 Direct RunPod result: ${GREEN}$SIZE bytes${NC} ($(( SIZE / 1024 )) KB)"
    
    if [ $SIZE -gt 100000 ]; then
        echo -e "   ${GREEN}✅ Real audio detected!${NC}"
        file runpod-direct.wav
    else
        echo -e "   ${RED}❌ Stub detected (< 100KB)${NC}"
        echo -e "   ${YELLOW}Check worker logs for errors${NC}"
    fi
else
    echo -e "${RED}❌ No audio file created${NC}"
    echo "Check logs: cat /tmp/runpod-test.log"
fi

# Test B: Next.js forced RunPod
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}TEST B: Next.js Route (RunPod)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

NEXTJS_URL="${NEXT_PUBLIC_API_URL:-http://localhost:3001}"

echo "🚀 Calling Next.js route..."
curl -s "${NEXTJS_URL}/api/voice/sesame?provider=sesame-runpod" \
  -H "Content-Type: application/json" \
  -d '{"text":"Maya is speaking via Sesame on RunPod"}' \
  --output maya-real.wav

if [ -f "maya-real.wav" ]; then
    SIZE=$(stat -f%z maya-real.wav 2>/dev/null || stat -c%s maya-real.wav 2>/dev/null)
    echo -e "📊 Next.js result: ${GREEN}$SIZE bytes${NC} ($(( SIZE / 1024 )) KB)"
    
    if [ $SIZE -gt 100000 ]; then
        echo -e "   ${GREEN}✅ Real audio through Next.js!${NC}"
        file maya-real.wav
    elif [ $SIZE -eq 33 ]; then
        echo -e "   ${RED}❌ Error response (33 bytes)${NC}"
        echo "   Content: $(cat maya-real.wav)"
    else
        echo -e "   ${YELLOW}⚠️  Small file - check if stub${NC}"
    fi
fi

# Test C: Debug JSON
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}TEST C: Debug Mode${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "🔍 Getting debug info..."
DEBUG=$(curl -s "${NEXTJS_URL}/api/voice/sesame?debug=1&provider=sesame-runpod" \
  -H "Content-Type: application/json" \
  -d '{"text":"Debug test"}')

echo "$DEBUG" | jq . 2>/dev/null || echo "$DEBUG"

# Extract key values
PROVIDER=$(echo "$DEBUG" | jq -r '.providerUsed // "unknown"')
AUDIO_LEN=$(echo "$DEBUG" | jq -r '.audioLength // 0')
IS_WAV=$(echo "$DEBUG" | jq -r '.isLikelyWAV // false')

echo ""
echo "📊 Analysis:"
echo "   Provider: $PROVIDER"
echo "   Audio length: $AUDIO_LEN bytes"
echo "   Valid WAV: $IS_WAV"

# Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

SUCCESS=true

if [ -f "runpod-direct.wav" ] && [ $(stat -f%z runpod-direct.wav 2>/dev/null || stat -c%s runpod-direct.wav 2>/dev/null) -gt 100000 ]; then
    echo -e "✅ Direct RunPod: ${GREEN}Working${NC}"
else
    echo -e "❌ Direct RunPod: ${RED}Stub/Failed${NC}"
    SUCCESS=false
fi

if [ -f "maya-real.wav" ] && [ $(stat -f%z maya-real.wav 2>/dev/null || stat -c%s maya-real.wav 2>/dev/null) -gt 100000 ]; then
    echo -e "✅ Next.js Route: ${GREEN}Working${NC}"
else
    echo -e "❌ Next.js Route: ${RED}Stub/Failed${NC}"
    SUCCESS=false
fi

if [ "$AUDIO_LEN" -gt 100000 ] && [ "$IS_WAV" = "true" ]; then
    echo -e "✅ Debug Mode: ${GREEN}Correct${NC}"
else
    echo -e "❌ Debug Mode: ${RED}Issues${NC}"
    SUCCESS=false
fi

echo ""

if [ "$SUCCESS" = true ]; then
    echo -e "${GREEN}🎉 MAYA IS SPEAKING!${NC}"
    echo ""
    echo "🎵 Play the audio:"
    echo "   afplay maya-real.wav"
else
    echo -e "${RED}🔧 TROUBLESHOOTING NEEDED${NC}"
    echo ""
    echo "1. Check RunPod worker logs for errors"
    echo "2. Verify HF_TOKEN is set as Secret"
    echo "3. Confirm model ID: sesame/csm-1b"
    echo "4. Look for import/API errors in logs"
    echo ""
    echo "Common fixes:"
    echo "- Missing deps → add to Dockerfile"
    echo "- Wrong API → update handler.py inference"
    echo "- OOM → set SESAME_FP16=0"
fi

echo ""
echo "✨ Test complete!"