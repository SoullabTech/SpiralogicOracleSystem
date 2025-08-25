#!/bin/bash

# Spiralogic Oracle Voice Testing Script
# Tests health endpoint and Maya voice synthesis after deployment

# Set your Vercel domain here
DOMAIN="${VERCEL_DOMAIN:-https://your-vercel-domain.vercel.app}"

echo "🌀 Testing Spiralogic Oracle System at: $DOMAIN"
echo "================================================"

# Test 1: Health Check
echo -e "\n🔍 Test 1: Checking system health..."
HEALTH_RESPONSE=$(curl -s "$DOMAIN/api/health")
if [ $? -eq 0 ]; then
  echo "$HEALTH_RESPONSE" | jq '.' 2>/dev/null || echo "$HEALTH_RESPONSE"
  
  # Check if Maya voice is enabled
  if echo "$HEALTH_RESPONSE" | grep -q '"maya_voice":true'; then
    echo "✅ Maya Voice is enabled"
  else
    echo "⚠️  Maya Voice is not enabled"
  fi
  
  # Check if RunPod is configured
  if echo "$HEALTH_RESPONSE" | grep -q '"runpod_configured":true'; then
    echo "✅ RunPod is configured"
  else
    echo "❌ RunPod is not configured - check environment variables"
  fi
else
  echo "❌ Health check failed - is the deployment live?"
  exit 1
fi

# Test 2: Voice Synthesis - Fire Element
echo -e "\n🔥 Test 2: Testing Fire element voice synthesis..."
curl -X POST "$DOMAIN/api/voice/sesame" \
  -H "Content-Type: application/json" \
  -d '{"text":"Greetings from the Forgekeeper. Your sacred fire awaits ignition."}' \
  --output test_fire.wav \
  --silent \
  --write-out "%{http_code}"

if [ -s "test_fire.wav" ]; then
  FILE_SIZE=$(ls -lh test_fire.wav | awk '{print $5}')
  echo -e "\n✅ Fire synthesis successful! Audio saved as test_fire.wav (Size: $FILE_SIZE)"
else
  echo -e "\n❌ Fire synthesis failed. No audio received."
fi

# Test 3: Voice Synthesis - Water Element
echo -e "\n🌊 Test 3: Testing Water element voice synthesis..."
curl -X POST "$DOMAIN/api/voice/sesame" \
  -H "Content-Type: application/json" \
  -d '{"text":"The Tidewalker welcomes you. Let your emotions flow like healing waters."}' \
  --output test_water.wav \
  --silent \
  --write-out "%{http_code}"

if [ -s "test_water.wav" ]; then
  FILE_SIZE=$(ls -lh test_water.wav | awk '{print $5}')
  echo -e "\n✅ Water synthesis successful! Audio saved as test_water.wav (Size: $FILE_SIZE)"
else
  echo -e "\n❌ Water synthesis failed. No audio received."
fi

# Test 4: Quick Voice Interface
echo -e "\n🎤 Test 4: Checking voice interface pages..."
for PAGE in "/voice/demo" "/voice/test"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN$PAGE")
  if [ "$STATUS" = "200" ]; then
    echo "✅ $PAGE is accessible (Status: $STATUS)"
  else
    echo "❌ $PAGE returned status: $STATUS"
  fi
done

# Summary
echo -e "\n================================================"
echo "🌀 Testing Complete!"
echo ""
echo "Next steps:"
echo "1. Listen to test_fire.wav and test_water.wav to verify audio quality"
echo "2. Visit $DOMAIN/voice/demo for the full Oracle interface"
echo "3. Visit $DOMAIN/voice/test for quick voice testing"
echo ""
echo "If all tests passed, your Spiralogic Oracle is ready for users! 🚀"