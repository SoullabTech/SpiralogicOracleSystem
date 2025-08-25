#!/bin/bash

# Direct RunPod API test script
# Tests the Sesame TTS endpoint directly without going through Next.js

# Check if .env.local exists and source it
if [ -f ".env.local" ]; then
    export $(cat .env.local | grep -E '^(RUNPOD_|RP_)' | xargs)
fi

# Use environment variables or prompt for values
RP_ENDPOINT="${RUNPOD_ENDPOINT_URL:-$RP_ENDPOINT}"
RP_KEY="${RUNPOD_API_KEY:-$RP_KEY}"

if [ -z "$RP_ENDPOINT" ] || [ -z "$RP_KEY" ]; then
    echo "❌ Missing RUNPOD_ENDPOINT_URL or RUNPOD_API_KEY"
    echo "Set these in .env.local or as environment variables"
    exit 1
fi

echo "🔍 Testing RunPod endpoint directly..."
echo "Endpoint: $RP_ENDPOINT"

# Test 1: Basic connectivity and response structure
echo -e "\n📡 Test 1: Basic API call..."
RESPONSE=$(curl -s -X POST "$RP_ENDPOINT" \
  -H "Authorization: Bearer $RP_KEY" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"Hello from RunPod direct test"}}')

echo "Response:"
echo "$RESPONSE" | jq .

# Test 2: Extract and decode audio
echo -e "\n🎵 Test 2: Extracting audio..."
AUDIO_B64=$(echo "$RESPONSE" | jq -r '.output.audio_base64 // .output.audio_b64 // empty')

if [ -z "$AUDIO_B64" ]; then
    echo "❌ No audio_base64 field found in response"
    echo "Keys found: $(echo "$RESPONSE" | jq -r '.output | keys[]' 2>/dev/null)"
    exit 1
fi

echo "✅ Found audio data (length: ${#AUDIO_B64} chars)"

# Decode and save
echo "$AUDIO_B64" | base64 --decode > runpod-direct.wav

# Check file size
FILE_SIZE=$(stat -f%z runpod-direct.wav 2>/dev/null || stat -c%s runpod-direct.wav 2>/dev/null)
echo "📏 WAV file size: $FILE_SIZE bytes"

if [ "$FILE_SIZE" -lt 10000 ]; then
    echo "⚠️  WARNING: File seems too small (< 10KB) - might be a stub!"
elif [ "$FILE_SIZE" -lt 50000 ]; then
    echo "⚠️  File is small (< 50KB) - short audio or potential issue"
else
    echo "✅ File size looks reasonable for speech audio"
fi

# Show file info
echo -e "\n📋 File info:"
file runpod-direct.wav
ls -lh runpod-direct.wav

# Play if possible
if command -v afplay &> /dev/null; then
    echo -e "\n🔊 Playing audio..."
    afplay runpod-direct.wav
elif command -v play &> /dev/null; then
    echo -e "\n🔊 Playing audio..."
    play runpod-direct.wav
else
    echo -e "\n💡 To play: afplay runpod-direct.wav"
fi

echo -e "\n✨ Test complete! Check runpod-direct.wav"