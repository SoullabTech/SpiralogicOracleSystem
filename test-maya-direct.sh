#!/bin/bash

# Test Maya's conversation endpoint directly

echo "🔮 Testing Maya Conversation API Directly"
echo "========================================"

# Test 1: Direct question
echo -e "\n📝 Test 1: Direct Question"
curl -N -H "Accept: text/event-stream" \
  "http://localhost:3002/api/v1/converse/stream?element=aether&userId=test&lang=en-US&q=What%20is%202%20plus%202" \
  2>/dev/null | grep "data:" | head -5

# Test 2: Personal question
echo -e "\n\n📝 Test 2: Personal Question"
curl -N -H "Accept: text/event-stream" \
  "http://localhost:3002/api/v1/converse/stream?element=aether&userId=test&lang=en-US&q=What%20color%20is%20my%20car" \
  2>/dev/null | grep "data:" | head -5

# Test 3: Consciousness question
echo -e "\n\n📝 Test 3: Consciousness Question"
curl -N -H "Accept: text/event-stream" \
  "http://localhost:3002/api/v1/converse/stream?element=air&userId=test&lang=en-US&q=Are%20you%20conscious%20and%20aware" \
  2>/dev/null | grep "data:" | head -5

# Test 4: Simple greeting
echo -e "\n\n📝 Test 4: Simple Greeting"
curl -N -H "Accept: text/event-stream" \
  "http://localhost:3002/api/v1/converse/stream?element=fire&userId=test&lang=en-US&q=Hello%20Maya" \
  2>/dev/null | grep "data:" | head -5

echo -e "\n\n✅ Tests complete. If you see generic responses above, the issue is in the system prompt or refinement."