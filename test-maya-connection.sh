#!/bin/bash

# Test Maya Oracle Connection
echo "🔮 Testing Maya Oracle Backend Connection..."
echo "Backend running on port 3003"
echo ""

# 1. Health Check
echo "1. Health Check:"
curl -s http://localhost:3003/api/v1/health | jq '.'
echo ""

# 2. Test Converse Message Endpoint
echo "2. Testing /api/v1/converse/message endpoint:"
curl -X POST http://localhost:3003/api/v1/converse/message \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user" \
  -H "x-session-id: test_session" \
  -H "x-thread-id: test_thread" \
  -d '{
    "userText": "Hello Maya, can you hear me?",
    "element": "aether",
    "userId": "test_user",
    "enableVoice": false,
    "useCSM": true,
    "metadata": {
      "oracle": "Maya",
      "sessionId": "test_session",
      "threadId": "test_thread",
      "personality": "adaptive mystical guide",
      "voiceProfile": "maya_oracle_v1"
    }
  }' 2>/dev/null | jq '.' || echo "Failed to connect"
echo ""

# 3. Test Voice Health
echo "3. Voice/TTS Health Check:"
curl -s http://localhost:3003/api/v1/voice/health/tts 2>/dev/null | jq '.' || echo "Voice endpoint not found"
echo ""

echo "✅ Test complete. Check results above."