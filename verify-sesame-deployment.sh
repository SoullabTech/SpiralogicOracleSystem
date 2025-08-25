#!/bin/bash

# Sesame TTS RunPod Deployment Verification Script
# Run this after updating RunPod to verify the real model is loaded

echo "🎵 Sesame TTS Deployment Verification"
echo "===================================="
echo ""

# Load environment
if [ -f ".env.local" ]; then
    export $(cat .env.local | grep -E '^(HF_|RUNPOD_|SESAME_|NEXT_PUBLIC_)' | xargs)
fi

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verify environment
echo "📋 Pre-flight Check:"
echo ""

check_env() {
    if [ -z "${!1}" ]; then
        echo -e "${RED}❌ $1: Not set${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $1: Set${NC}"
        return 0
    fi
}

ENV_OK=true
check_env "HF_TOKEN" || ENV_OK=false
check_env "RUNPOD_API_KEY" || ENV_OK=false
check_env "RUNPOD_SESAME_ENDPOINT_ID" || ENV_OK=false

if [ "$ENV_OK" = false ]; then
    echo -e "\n${RED}⚠️  Missing required environment variables!${NC}"
    exit 1
fi

echo -e "\n${GREEN}✅ All environment variables present${NC}"
echo ""

# Test 1: Direct RunPod Test
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Direct RunPod API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🚀 Calling RunPod directly..."
ENDPOINT_ID="${RUNPOD_SESAME_ENDPOINT_ID}"
RP_ENDPOINT="https://api.runpod.ai/v2/${ENDPOINT_ID}/run"

# Make the request
RESPONSE=$(curl -s -X POST "$RP_ENDPOINT" \
  -H "Authorization: Bearer ${RUNPOD_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"Testing real Sesame model on RunPod"}}')

REQUEST_ID=$(echo "$RESPONSE" | jq -r '.id // empty')
if [ -z "$REQUEST_ID" ]; then
    echo -e "${RED}❌ Failed to get request ID${NC}"
    echo "Response: $RESPONSE"
    exit 1
fi

echo "✅ Request ID: $REQUEST_ID"
echo -n "⏳ Waiting for completion"

# Poll for result
STATUS_URL="https://api.runpod.ai/v2/${ENDPOINT_ID}/status/${REQUEST_ID}"
MAX_WAIT=120  # 2 minutes
ELAPSED=0

while [ $ELAPSED -lt $MAX_WAIT ]; do
    STATUS_RESPONSE=$(curl -s -X GET "$STATUS_URL" \
      -H "Authorization: Bearer ${RUNPOD_API_KEY}")
    
    STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.status // empty')
    
    if [ "$STATUS" = "COMPLETED" ]; then
        echo -e " ${GREEN}✅${NC}"
        break
    elif [ "$STATUS" = "FAILED" ] || [ "$STATUS" = "CANCELLED" ] || [ "$STATUS" = "TIMED_OUT" ]; then
        echo -e " ${RED}❌${NC}"
        echo "Job failed with status: $STATUS"
        echo "$STATUS_RESPONSE" | jq .
        exit 1
    fi
    
    echo -n "."
    sleep 2
    ((ELAPSED+=2))
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
    echo -e " ${RED}❌ Timeout${NC}"
    exit 1
fi

# Analyze response
echo ""
echo "📊 Analyzing RunPod response..."

# Extract audio
AUDIO_B64=$(echo "$STATUS_RESPONSE" | jq -r '.output.audio_base64 // empty')
if [ -z "$AUDIO_B64" ]; then
    echo -e "${RED}❌ No audio_base64 in response!${NC}"
    echo "Available fields:"
    echo "$STATUS_RESPONSE" | jq '.output | keys'
    exit 1
fi

# Decode and analyze
echo "$AUDIO_B64" | base64 --decode > verify-direct.wav
SIZE=$(stat -f%z verify-direct.wav 2>/dev/null || stat -c%s verify-direct.wav 2>/dev/null)

echo ""
echo "📈 Audio Analysis:"
echo "   Size: $SIZE bytes ($(( SIZE / 1024 )) KB)"
echo -n "   Type: "
file verify-direct.wav

# Determine if it's real or stub
if [ $SIZE -lt 15000 ]; then
    echo -e "   ${RED}❌ STUB DETECTED! File is only $(( SIZE / 1024 ))KB${NC}"
    echo ""
    echo "   🔍 This is the fallback tone, not real TTS"
    echo "   📋 Check RunPod worker logs for errors:"
    echo "      - Model loading failed?"
    echo "      - Missing HF_TOKEN?"
    echo "      - CUDA/memory issues?"
    STUB_DETECTED=true
else
    echo -e "   ${GREEN}✅ Real audio detected! ($(( SIZE / 1024 ))KB)${NC}"
    STUB_DETECTED=false
fi

# Test 2: Next.js Route
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Next.js Route"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

NEXTJS_URL="${NEXT_PUBLIC_API_URL:-http://localhost:3001}"

# Debug mode first
echo "🔍 Testing debug mode..."
DEBUG_RESPONSE=$(curl -s -X POST "${NEXTJS_URL}/api/voice/sesame?provider=sesame-runpod&debug=1" \
  -H "Content-Type: application/json" \
  -d '{"text":"Debug mode test"}')

echo "$DEBUG_RESPONSE" | jq . || echo "$DEBUG_RESPONSE"

# Real audio test
echo ""
echo "🎤 Testing audio output..."
curl -s -X POST "${NEXTJS_URL}/api/voice/sesame?provider=sesame-runpod" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello! I am Maya, speaking through RunPod!"}' \
  --output verify-maya.wav

if [ -f verify-maya.wav ]; then
    SIZE2=$(stat -f%z verify-maya.wav 2>/dev/null || stat -c%s verify-maya.wav 2>/dev/null)
    echo "   Size: $SIZE2 bytes ($(( SIZE2 / 1024 )) KB)"
    
    if [ $SIZE2 -eq 33 ]; then
        echo -e "   ${RED}❌ Got error response (33 bytes)${NC}"
        echo "   Content: $(cat verify-maya.wav)"
    elif [ $SIZE2 -lt 15000 ]; then
        echo -e "   ${YELLOW}⚠️  Small file - possible stub${NC}"
    else
        echo -e "   ${GREEN}✅ Real audio through Next.js!${NC}"
    fi
fi

# Summary and recommendations
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 DEPLOYMENT STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$STUB_DETECTED" = true ]; then
    echo -e "${RED}🚨 STUB AUDIO DETECTED${NC}"
    echo ""
    echo "The worker is returning fallback audio (880Hz tone)."
    echo ""
    echo "📋 Troubleshooting Steps:"
    echo ""
    echo "1. Check RunPod worker logs:"
    echo "   - Go to RunPod → Your endpoint → Workers → (...) → Logs"
    echo "   - Look for error messages after '🔄 Loading Sesame model...'"
    echo ""
    echo "2. Verify environment variables in RunPod:"
    echo "   - HF_TOKEN (as Secret)"
    echo "   - SESAME_MODEL=sesame/csm-1b"
    echo "   - SESAME_FP16=1"
    echo ""
    echo "3. Common issues:"
    echo "   - Missing HF token → 401 error"
    echo "   - Wrong model ID → 404 error"
    echo "   - CUDA OOM → Try SESAME_FP16=0"
    echo "   - Missing deps → Check Dockerfile"
    echo ""
    echo "4. Force rebuild:"
    echo "   - Change any setting and Save"
    echo "   - Or add a comment to Dockerfile"
else
    echo -e "${GREEN}✅ REAL MODEL LOADED!${NC}"
    echo ""
    echo "Maya is speaking through Sesame TTS!"
    echo ""
    echo "🎵 Play the audio:"
    echo "   afplay verify-direct.wav  # Direct from RunPod"
    echo "   afplay verify-maya.wav    # Through Next.js"
fi

echo ""
echo "📝 Quick model check - handler.py loads:"
grep -A 2 "MODEL_ID" services/sesame-tts/handler.py | head -3

echo ""
echo "📦 Dockerfile installs:"
grep "RUN pip3 install" services/sesame-tts/Dockerfile.runpod | head -5

echo ""
echo "✨ Verification complete!"