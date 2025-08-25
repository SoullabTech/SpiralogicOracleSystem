#!/bin/bash

# Comprehensive Sesame TTS audio testing script
# Tests both direct RunPod API and Next.js route

echo "🎵 Sesame TTS Audio Debugging Tool"
echo "=================================="

# Load environment variables
if [ -f ".env.local" ]; then
    export $(cat .env.local | grep -E '^(RUNPOD_|RP_|NEXT_PUBLIC_)' | xargs)
fi

# Check required variables
RP_ENDPOINT="${RUNPOD_ENDPOINT_URL:-$RP_ENDPOINT}"
RP_KEY="${RUNPOD_API_KEY:-$RP_KEY}"
ENDPOINT_ID="${RUNPOD_SESAME_ENDPOINT_ID:-$RUNPOD_ENDPOINT_ID}"

if [ -z "$RP_KEY" ] || [ -z "$ENDPOINT_ID" ]; then
    echo "❌ Missing required environment variables:"
    echo "   RUNPOD_API_KEY: ${RP_KEY:+[SET]}"
    echo "   RUNPOD_SESAME_ENDPOINT_ID: ${ENDPOINT_ID:+[SET]}"
    exit 1
fi

# Construct full endpoint URL if needed
if [ -z "$RP_ENDPOINT" ]; then
    RP_ENDPOINT="https://api.runpod.ai/v2/${ENDPOINT_ID}/run"
fi

echo "✅ Configuration:"
echo "   Endpoint: $RP_ENDPOINT"
echo "   Has API Key: Yes"
echo ""

# Test 1: Direct RunPod API call
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 TEST 1: Direct RunPod API Call"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -e "\n🚀 Calling RunPod endpoint..."
RESPONSE=$(curl -s -X POST "$RP_ENDPOINT" \
  -H "Authorization: Bearer $RP_KEY" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"Testing Sesame TTS from direct RunPod call"}}')

echo "📋 Raw response:"
echo "$RESPONSE" | jq . || echo "$RESPONSE"

# Extract request ID for status polling
REQUEST_ID=$(echo "$RESPONSE" | jq -r '.id // empty')
if [ -z "$REQUEST_ID" ]; then
    echo "❌ No request ID in response. Full response above."
    exit 1
fi

echo -e "\n⏳ Got request ID: $REQUEST_ID"
echo "Polling for completion..."

# Poll for status
STATUS_URL="https://api.runpod.ai/v2/${ENDPOINT_ID}/status/${REQUEST_ID}"
MAX_POLLS=40  # 40 * 3 seconds = 2 minutes max
POLL_COUNT=0

while [ $POLL_COUNT -lt $MAX_POLLS ]; do
    STATUS_RESPONSE=$(curl -s -X GET "$STATUS_URL" \
      -H "Authorization: Bearer $RP_KEY")
    
    STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.status // empty')
    
    if [ "$STATUS" = "COMPLETED" ]; then
        echo "✅ Job completed!"
        break
    elif [ "$STATUS" = "FAILED" ] || [ "$STATUS" = "CANCELLED" ] || [ "$STATUS" = "TIMED_OUT" ]; then
        echo "❌ Job failed with status: $STATUS"
        echo "$STATUS_RESPONSE" | jq .
        exit 1
    fi
    
    echo -n "."
    sleep 3
    ((POLL_COUNT++))
done

if [ $POLL_COUNT -eq $MAX_POLLS ]; then
    echo -e "\n❌ Timeout waiting for job completion"
    exit 1
fi

echo -e "\n\n📦 Completed response:"
echo "$STATUS_RESPONSE" | jq .

# Extract audio
AUDIO_B64=$(echo "$STATUS_RESPONSE" | jq -r '.output.audio_base64 // .output.audio_b64 // empty')

if [ -z "$AUDIO_B64" ]; then
    echo -e "\n❌ No audio_base64 field found!"
    echo "Available output keys:"
    echo "$STATUS_RESPONSE" | jq -r '.output | keys[]' 2>/dev/null || echo "No output object"
else
    echo -e "\n✅ Found base64 audio (${#AUDIO_B64} chars)"
    
    # Decode and save
    echo "$AUDIO_B64" | base64 --decode > test-direct.wav
    
    # Analyze file
    FILE_SIZE=$(stat -f%z test-direct.wav 2>/dev/null || stat -c%s test-direct.wav 2>/dev/null)
    echo "📏 File size: $FILE_SIZE bytes ($(( FILE_SIZE / 1024 )) KB)"
    
    if [ "$FILE_SIZE" -lt 10000 ]; then
        echo "⚠️  WARNING: File is tiny (< 10KB) - likely a stub!"
    fi
    
    file test-direct.wav
    echo -e "\n💾 Saved as: test-direct.wav"
fi

# Test 2: Next.js route with debug
echo -e "\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 TEST 2: Next.js Route (Debug Mode)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

NEXTJS_URL="${NEXT_PUBLIC_API_URL:-http://localhost:3001}/api/voice/sesame?debug=1"
echo -e "\n🚀 Calling: $NEXTJS_URL"

DEBUG_RESPONSE=$(curl -s -X POST "$NEXTJS_URL" \
  -H "Content-Type: application/json" \
  -d '{"text":"Testing Sesame TTS through Next.js debug mode"}')

echo -e "\n📋 Debug response:"
echo "$DEBUG_RESPONSE" | jq . || echo "$DEBUG_RESPONSE"

# Test 3: Next.js route actual audio
echo -e "\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎤 TEST 3: Next.js Route (Audio Output)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

AUDIO_URL="${NEXT_PUBLIC_API_URL:-http://localhost:3001}/api/voice/sesame"
echo -e "\n🚀 Calling: $AUDIO_URL"

curl -s -X POST "$AUDIO_URL" \
  -H "Content-Type: application/json" \
  -d '{"text":"Maya speaking through Sesame TTS"}' \
  --output test-nextjs.wav

if [ -f test-nextjs.wav ]; then
    FILE_SIZE=$(stat -f%z test-nextjs.wav 2>/dev/null || stat -c%s test-nextjs.wav 2>/dev/null)
    echo "✅ Received file: test-nextjs.wav"
    echo "📏 File size: $FILE_SIZE bytes ($(( FILE_SIZE / 1024 )) KB)"
    file test-nextjs.wav
    
    # Check if it's a valid WAV
    if head -c 4 test-nextjs.wav | grep -q "RIFF"; then
        echo "✅ Valid WAV header detected"
    else
        echo "⚠️  File doesn't start with RIFF header"
        echo "First 20 bytes (hex):"
        xxd -l 20 test-nextjs.wav
    fi
else
    echo "❌ No file received from Next.js route"
fi

# Summary
echo -e "\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f test-direct.wav ]; then
    echo "✅ test-direct.wav: $(stat -f%z test-direct.wav 2>/dev/null || stat -c%s test-direct.wav) bytes"
else
    echo "❌ test-direct.wav: Not created"
fi

if [ -f test-nextjs.wav ]; then
    echo "✅ test-nextjs.wav: $(stat -f%z test-nextjs.wav 2>/dev/null || stat -c%s test-nextjs.wav) bytes"
else
    echo "❌ test-nextjs.wav: Not created"
fi

echo -e "\n🎵 To play audio files:"
echo "   afplay test-direct.wav"
echo "   afplay test-nextjs.wav"

echo -e "\n✨ Test complete!"