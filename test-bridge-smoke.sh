#!/bin/bash

echo "🔗 Soul Memory AIN Bridge - Smoke Tests"
echo "======================================"

# Test A: Basic dual-write functionality
echo ""
echo "Test A: Basic dual-write functionality"
echo "--------------------------------------"
echo "Testing turn with dream content..."

RESPONSE=$(curl -s -X POST http://localhost:3000/api/oracle/turn \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "text": "Had a steady, quiet day, but a dream about the ocean felt important."
    },
    "userId": "u_demo",
    "conversationId": "c_demo"
  }')

echo "✅ Oracle response received"
echo "$RESPONSE" | jq -r '.response.text // "No response text"' | head -2
echo ""

# Test B: Check Soul Memory for ain_id cross-linking
echo "Test B: Soul Memory cross-linking verification"
echo "---------------------------------------------"
echo "Checking for Soul Memory record with ain_id..."

SOUL_RESPONSE=$(curl -s http://localhost:3001/api/soul-memory/memories)
LATEST_MEMORY=$(echo "$SOUL_RESPONSE" | jq 'map(select(.conversation_id=="c_demo")) | .[-1] | {id,conversation_id,metadata}')

if echo "$LATEST_MEMORY" | jq -e '.metadata.ain_id' > /dev/null; then
  echo "✅ Soul Memory record found with ain_id cross-reference"
  echo "$LATEST_MEMORY" | jq '.'
else
  echo "❌ No ain_id found in Soul Memory metadata"
  echo "$LATEST_MEMORY" | jq '.'
fi

echo ""

# Test C: Idempotency check
echo "Test C: Idempotency verification"
echo "--------------------------------"
echo "Sending same turn again to test idempotency..."

REPEAT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/oracle/turn \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "text": "Had a steady, quiet day, but a dream about the ocean felt important."
    },
    "userId": "u_demo",
    "conversationId": "c_demo"
  }')

echo "✅ Repeat turn completed"

# Check if duplicate was avoided
MEMORY_COUNT=$(curl -s http://localhost:3001/api/soul-memory/memories | jq 'map(select(.conversation_id=="c_demo")) | length')
echo "Soul Memory count for conversation: $MEMORY_COUNT"

if [ "$MEMORY_COUNT" -eq 1 ]; then
  echo "✅ Idempotency working - no duplicate records"
else
  echo "⚠️  Multiple records found - check idempotency logic"
fi

echo ""
echo "🎯 Smoke test complete!"
echo "Expected: 1 AIN memory + 1 Soul Memory record with ain_id cross-reference"