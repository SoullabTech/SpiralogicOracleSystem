#!/bin/bash

# Test Sesame TTS RunPod deployment

echo "🎯 Testing Sesame TTS RunPod deployment..."
echo

# Test 1: Debug endpoint (JSON response)
echo "1️⃣ Testing debug endpoint..."
curl -s 'http://localhost:3001/api/voice/sesame?provider=sesame-runpod&debug=1' \
  -H 'content-type: application/json' \
  -d '{"text":"Hello from Maya"}' | jq .

echo
echo "✅ Expected: providerUsed: 'sesame-runpod', audioLength > 50000, isLikelyWAV: true"
echo

# Test 2: Audio generation
echo "2️⃣ Generating audio file..."
curl -s 'http://localhost:3001/api/voice/sesame?provider=sesame-runpod' \
  -H 'content-type: application/json' \
  -d '{"text":"Maya through Sesame on RunPod"}' \
  --output maya-runpod-test.wav

# Check file size
if [ -f maya-runpod-test.wav ]; then
    SIZE=$(ls -lh maya-runpod-test.wav | awk '{print $5}')
    echo "✅ Audio file created: maya-runpod-test.wav (size: $SIZE)"
    
    # Check if it's the fallback tone
    FILE_SIZE_BYTES=$(stat -f%z maya-runpod-test.wav 2>/dev/null || stat -c%s maya-runpod-test.wav)
    if [ "$FILE_SIZE_BYTES" -lt 10000 ]; then
        echo "⚠️  WARNING: File is too small (~9KB) - this is likely the fallback tone!"
        echo "   Check RunPod worker logs for model loading errors."
    else
        echo "✅ File size looks good (>10KB) - should be real audio!"
        # Open the file on macOS
        if command -v open &> /dev/null; then
            open maya-runpod-test.wav
        fi
    fi
else
    echo "❌ Failed to create audio file"
fi

echo
echo "📋 RunPod deployment checklist:"
echo "   [ ] Worker shows: HF token present: True"
echo "   [ ] Worker shows: Model loaded successfully"
echo "   [ ] Debug endpoint returns audioLength > 50000"
echo "   [ ] Audio file is >100KB (not ~9KB fallback)"