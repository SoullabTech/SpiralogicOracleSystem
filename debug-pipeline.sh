#!/bin/bash
# Debug Pipeline - Check which path Oracle is using

echo "🔍 DEBUGGING ORACLE PIPELINE PATH"
echo "================================="
echo ""

echo "Step 1: Testing current Oracle response path..."
RESPONSE=$(curl -s -X POST "http://localhost:3000/api/oracle/turn" \
  -H "content-type: application/json" \
  -d @- <<'JSON'
{
  "input": { "text": "quick stack check" },
  "conversationId": "c-debug"
}
JSON
)

echo "Oracle Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

echo "Step 2: Checking backend environment variables..."
docker compose -f docker-compose.development.yml exec backend \
  /bin/sh -c 'printenv | egrep "DEMO_PIPELINE_DISABLED|USE_CLAUDE|ATTENDING|MAYA_GREETING|MAYA_MODE_DEFAULT|START_SERVER" || echo "No relevant env vars found"'

echo ""
echo "Step 3: Checking backend container logs (last 50 lines)..."
docker compose -f docker-compose.development.yml logs --tail=50 backend

echo ""
echo "Analysis:"
if echo "$RESPONSE" | grep -q "Consider diving into"; then
    echo "❌ DEMO MODE DETECTED - Using fast path"
else
    echo "✅ CONVERSATIONAL MODE - Full pipeline active"
fi