#!/bin/bash

echo "🧪 Soul Memory Bridge - Edge Case Tests"
echo "======================================="

# Test 1: Sacred moment detector
echo ""
echo "Test 1: Sacred moment detection"
echo "-------------------------------"
echo "Testing sacred moment with spiritual content..."

curl -s -X POST http://localhost:3000/api/oracle/turn \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "text": "Woke at 3am, felt a quiet certainty, like something subtle clicked into place."
    },
    "userId": "u_sacred",
    "conversationId": "c_sacred"
  }' | jq '.response.text // "No response"' | head -2

echo "Expected: sacred=true, low shadow, Water-leaning hint"

# Test 2: Shadow scoring
echo ""
echo "Test 2: Shadow content detection"
echo "--------------------------------"
echo "Testing shadow content with emotional material..."

curl -s -X POST http://localhost:3000/api/oracle/turn \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "text": "I snapped at my partner, then justified it. Underneath I am ashamed."
    },
    "userId": "u_shadow",
    "conversationId": "c_shadow"
  }' | jq '.response.text // "No response"' | head -2

echo "Expected: shadow>0.6, gentle invite, one question"

# Test 3: Dream/archetype detection
echo ""
echo "Test 3: Archetypal pattern detection"
echo "------------------------------------"
echo "Testing archetypal content with flight/water imagery..."

curl -s -X POST http://localhost:3000/api/oracle/turn \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "text": "Recurring flight over water, no fear—just vastness."
    },
    "userId": "u_archetype",
    "conversationId": "c_archetype"
  }' | jq '.response.text // "No response"' | head -2

echo "Expected: light archetypal tag (without jargon), one question"

echo ""
echo "🎭 Edge case testing complete!"
echo "Check server logs for enrichment details (sacred/shadow/archetype scores)"