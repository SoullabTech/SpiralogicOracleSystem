#!/bin/bash
# Maya Voice - Instance Stopper
# Immediately stops Vast.ai instance to halt billing

set -euo pipefail

: "${VAST_API_KEY?Need VAST_API_KEY}"

API="https://vast.ai/api/v0"

# Get instance ID from saved file
INSTANCE_ID=""
if [ -f ".vast_instance_id" ]; then
  INSTANCE_ID=$(cat .vast_instance_id 2>/dev/null | tr -d '\n' || echo "")
fi

if [ -z "$INSTANCE_ID" ]; then
  echo "ℹ️  No active instance found (.vast_instance_id missing or empty)"
  exit 0
fi

echo "🛑 Stopping Maya Voice instance $INSTANCE_ID..."

# Get instance info before deletion
INFO=$(curl -s -H "Authorization: Bearer $VAST_API_KEY" \
  "$API/instances/$INSTANCE_ID" 2>/dev/null || echo '{}')

STATUS=$(echo "$INFO" | jq -r '.state_str // "unknown"')
COST=$(echo "$INFO" | jq -r '.dph_base // "unknown"')

echo "   Status: $STATUS"
echo "   Cost: \$${COST}/hr"

# Delete the instance
DELETE_RESPONSE=$(curl -s -H "Authorization: Bearer $VAST_API_KEY" \
  -X DELETE "$API/instances/$INSTANCE_ID" 2>/dev/null || echo '{"success": false}')

SUCCESS=$(echo "$DELETE_RESPONSE" | jq -r '.success // false')

if [ "$SUCCESS" = "true" ]; then
  echo "✅ Instance $INSTANCE_ID stopped - billing halted"
  
  # Calculate approximate session cost if we have runtime info
  if [ "$STATUS" = "running" ] && [ "$COST" != "unknown" ]; then
    CREATED=$(echo "$INFO" | jq -r '.create_time // 0')
    NOW=$(date +%s)
    
    if [ "$CREATED" -gt 0 ]; then
      RUNTIME_HOURS=$(echo "scale=2; ($NOW - $CREATED) / 3600" | bc 2>/dev/null || echo "unknown")
      if [ "$RUNTIME_HOURS" != "unknown" ]; then
        SESSION_COST=$(echo "scale=2; $RUNTIME_HOURS * $COST" | bc 2>/dev/null || echo "unknown")
        echo "💰 Session cost: ~\$${SESSION_COST} (${RUNTIME_HOURS}h at \$${COST}/hr)"
      fi
    fi
  fi
else
  echo "⚠️  Stop request sent, but response unclear:"
  echo "$DELETE_RESPONSE" | jq .
fi

# Clean up local state files
rm -f .vast_instance_id .vast_public_ip .maya_endpoint

echo "🧹 Local state cleaned up"
echo ""
echo "💡 To restart Maya, run: ./start_instance.sh"