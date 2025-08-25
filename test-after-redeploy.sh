#!/bin/bash

echo "🎵 Testing Maya after RunPod redeploy"
echo "====================================="
echo ""

# Test the new worker
echo "🚀 Testing with real model..."
curl -s 'http://localhost:3001/api/voice/sesame?provider=sesame-runpod' \
  -H 'content-type: application/json' \
  -d '{"text":"Maya is speaking from the real Sesame model"}' \
  --output maya-real-test.wav

if [ -f "maya-real-test.wav" ]; then
    SIZE=$(stat -f%z maya-real-test.wav 2>/dev/null || stat -c%s maya-real-test.wav 2>/dev/null)
    echo ""
    echo "📊 Results:"
    echo "   File size: $SIZE bytes ($(( SIZE / 1024 )) KB)"
    
    if [ $SIZE -gt 50000 ]; then
        echo "   🎉 SUCCESS! Real audio detected!"
        echo "   🎵 Play: afplay maya-real-test.wav"
    else
        echo "   ❌ Still getting stub ($SIZE bytes)"
        echo "   Check worker logs for error after '🔄 Loading Sesame TTS model...'"
    fi
    
    file maya-real-test.wav
else
    echo "❌ No file created"
fi

echo ""
echo "Debug info:"
curl -s 'http://localhost:3001/api/voice/sesame?provider=sesame-runpod&debug=1' \
  -H 'content-type: application/json' \
  -d '{"text":"Debug after redeploy"}' | jq .