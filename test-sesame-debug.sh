#!/bin/bash

# Sesame TTS Debug Script - Pinpoint audio chain issues
# Run this to identify exactly where audio is lost

echo "🎵 Sesame TTS Audio Chain Debugger"
echo "=================================="
echo ""

# Load environment variables
if [ -f ".env.local" ]; then
    export $(cat .env.local | grep -E '^(RUNPOD_|RP_|NEXT_PUBLIC_)' | xargs)
fi

# Setup variables
RP_KEY="${RUNPOD_API_KEY:-$RP_KEY}"
ENDPOINT_ID="${RUNPOD_SESAME_ENDPOINT_ID:-$RUNPOD_ENDPOINT_ID}"
RP_ENDPOINT="https://api.runpod.ai/v2/${ENDPOINT_ID}/run"

if [ -z "$RP_KEY" ] || [ -z "$ENDPOINT_ID" ]; then
    echo "❌ Missing environment variables:"
    echo "   RUNPOD_API_KEY: ${RP_KEY:+[SET]}"
    echo "   RUNPOD_SESAME_ENDPOINT_ID: ${ENDPOINT_ID:+[SET]}"
    exit 1
fi

echo "✅ Config loaded successfully"
echo ""

# Test 1: Direct RunPod
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Direct RunPod API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🚀 Calling RunPod directly..."
RESPONSE=$(curl -s -X POST "$RP_ENDPOINT" \
  -H "Authorization: Bearer $RP_KEY" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"Hello from RunPod direct"}}')

# Check if we got a request ID
REQUEST_ID=$(echo "$RESPONSE" | jq -r '.id // empty')
if [ -z "$REQUEST_ID" ]; then
    echo "❌ No request ID received. Response:"
    echo "$RESPONSE" | jq . || echo "$RESPONSE"
    exit 1
fi

echo "✅ Got request ID: $REQUEST_ID"
echo -n "⏳ Polling for completion"

# Poll for completion
STATUS_URL="https://api.runpod.ai/v2/${ENDPOINT_ID}/status/${REQUEST_ID}"
for i in {1..40}; do
    STATUS_RESPONSE=$(curl -s -X GET "$STATUS_URL" \
      -H "Authorization: Bearer $RP_KEY")
    
    STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.status // empty')
    
    if [ "$STATUS" = "COMPLETED" ]; then
        echo " ✅"
        break
    elif [ "$STATUS" = "FAILED" ] || [ "$STATUS" = "CANCELLED" ] || [ "$STATUS" = "TIMED_OUT" ]; then
        echo " ❌"
        echo "Job failed with status: $STATUS"
        echo "$STATUS_RESPONSE" | jq .
        exit 1
    fi
    
    echo -n "."
    sleep 3
done

echo ""
echo "📦 RunPod response structure:"
echo "$STATUS_RESPONSE" | jq '{
  status: .status,
  output_keys: (.output | keys),
  has_audio_base64: (.output.audio_base64 != null),
  has_audio_b64: (.output.audio_b64 != null),
  has_ok: (.output.ok != null),
  has_mime: (.output.mime != null)
}'

# Try to extract audio with multiple possible field names
AUDIO_B64=$(echo "$STATUS_RESPONSE" | jq -r '.output.audio_base64 // .output.audio_b64 // empty')

if [ -z "$AUDIO_B64" ]; then
    echo "❌ No audio_base64 or audio_b64 field found!"
    echo "Full output object:"
    echo "$STATUS_RESPONSE" | jq '.output'
else
    echo "✅ Found base64 audio (${#AUDIO_B64} chars)"
    
    # Decode and analyze
    echo "$AUDIO_B64" | base64 --decode > direct.wav
    SIZE=$(stat -f%z direct.wav 2>/dev/null || stat -c%s direct.wav 2>/dev/null)
    
    echo ""
    echo "📊 Direct RunPod Audio Analysis:"
    echo "   File size: $SIZE bytes ($(( SIZE / 1024 )) KB)"
    echo -n "   File info: "
    file direct.wav
    
    if [ "$SIZE" -lt 10000 ]; then
        echo "   ⚠️  WARNING: File < 10KB - likely a stub!"
    elif [ "$SIZE" -lt 50000 ]; then
        echo "   ⚠️  File < 50KB - very short audio"
    else
        echo "   ✅ File size looks good for speech"
    fi
fi

# Test 2: Next.js Debug Mode
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Next.js Route (Debug Mode)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

NEXTJS_URL="${NEXT_PUBLIC_API_URL:-http://localhost:3001}"
echo "🚀 Calling Next.js debug endpoint..."

DEBUG_RESPONSE=$(curl -s -X POST "${NEXTJS_URL}/api/voice/sesame?provider=sesame-runpod&debug=1" \
  -H "Content-Type: application/json" \
  -d '{"text":"Debug test"}')

echo "📦 Next.js debug response:"
echo "$DEBUG_RESPONSE" | jq . || echo "$DEBUG_RESPONSE"

# Test 3: Next.js Audio Output
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Next.js Route (Audio Output)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🚀 Fetching audio from Next.js..."
curl -s -X POST "${NEXTJS_URL}/api/voice/sesame?provider=sesame-runpod" \
  -H "Content-Type: application/json" \
  -d '{"text":"Maya test"}' \
  --output maya-test.wav

if [ -f maya-test.wav ]; then
    SIZE=$(stat -f%z maya-test.wav 2>/dev/null || stat -c%s maya-test.wav 2>/dev/null)
    
    echo "📊 Next.js Audio Analysis:"
    echo -n "   Size: "
    du -h maya-test.wav
    echo -n "   Type: "
    file maya-test.wav
    echo "   Bytes: $SIZE"
    
    if [ "$SIZE" -eq 33 ]; then
        echo "   ❌ File is 33 bytes - JSON error response!"
        echo "   Content: $(cat maya-test.wav)"
    elif [ "$SIZE" -lt 10000 ]; then
        echo "   ⚠️  File < 10KB - likely a stub!"
    else
        echo "   ✅ File size looks good"
    fi
    
    # Check RIFF header
    if head -c 4 maya-test.wav | grep -q "RIFF"; then
        echo "   ✅ Valid WAV header (RIFF)"
    else
        echo "   ❌ No RIFF header - not a valid WAV"
        echo "   First 20 bytes (hex):"
        xxd -l 20 maya-test.wav
    fi
else
    echo "❌ No file created"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 DECISION TREE ANALYSIS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f direct.wav ] && [ -f maya-test.wav ]; then
    DIRECT_SIZE=$(stat -f%z direct.wav 2>/dev/null || stat -c%s direct.wav 2>/dev/null)
    MAYA_SIZE=$(stat -f%z maya-test.wav 2>/dev/null || stat -c%s maya-test.wav 2>/dev/null)
    
    if [ "$DIRECT_SIZE" -gt 50000 ] && [ "$MAYA_SIZE" -lt 1000 ]; then
        echo "🔍 Pattern A: Direct RunPod OK, Next.js failing"
        echo "   → Route not decoding base64 properly"
        echo "   → Check Buffer.from(rp.audio_b64, 'base64')"
    elif [ "$DIRECT_SIZE" -gt 50000 ] && [ "$MAYA_SIZE" -eq 33 ]; then
        echo "🔍 Pattern A+: Direct OK, Next.js returning JSON error"
        echo "   → Route hitting an error, check logs"
    elif [ "$DIRECT_SIZE" -lt 10000 ]; then
        echo "🔍 Pattern C/D: Direct RunPod returning stub"
        echo "   → Worker not loading real model"
        echo "   → Check worker logs for model loading"
    else
        echo "🔍 Audio chain appears functional"
        echo "   Direct: $DIRECT_SIZE bytes"
        echo "   Next.js: $MAYA_SIZE bytes"
    fi
fi

echo ""
echo "🎵 To play audio:"
if [ -f direct.wav ] && [ $(stat -f%z direct.wav 2>/dev/null || stat -c%s direct.wav) -gt 10000 ]; then
    echo "   afplay direct.wav    # Direct from RunPod"
fi
if [ -f maya-test.wav ] && [ $(stat -f%z maya-test.wav 2>/dev/null || stat -c%s maya-test.wav) -gt 10000 ]; then
    echo "   afplay maya-test.wav  # Through Next.js"
fi

echo ""
echo "📋 To check worker logs:"
echo "   Go to RunPod dashboard → Your endpoint → Logs"
echo "   Look for: 'Booting...', 'Model...', 'Synthesizing...'"
echo ""
echo "✨ Debug complete!"