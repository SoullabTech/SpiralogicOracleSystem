#!/usr/bin/env bash
set -euo pipefail
: "${RUNPOD_ENDPOINT_ID:?Set RUNPOD_ENDPOINT_ID}"
: "${RUNPOD_API_KEY:?Set RUNPOD_API_KEY}"

echo "Warming up endpoint: $RUNPOD_ENDPOINT_ID"
curl -sS -X POST "https://api.runpod.ai/v2/$RUNPOD_ENDPOINT_ID/runsync" \
  -H "Authorization: Bearer $RUNPOD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"Maya voice system warming up."}}' | jq .