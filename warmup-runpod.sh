#!/bin/bash

# RunPod Maya voice warmup script
echo "🔥 Warming up RunPod Maya voice endpoint..."

# Load environment
source .env.local

# Submit warmup job
echo "Submitting warmup job..."
RESP=$(curl -sS -X POST "https://api.runpod.ai/v2/$RUNPOD_ENDPOINT_ID/run" \
  -H "Authorization: Bearer $RUNPOD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"Maya voice system warming up. Ready to provide wisdom and guidance."}}')

JOB_ID=$(echo "$RESP" | jq -r '.id // empty')

if [ -z "$JOB_ID" ]; then
  echo "❌ Failed to submit job"
  echo "$RESP" | jq .
  exit 1
fi

echo "✅ Job submitted: $JOB_ID"
echo "Polling for completion (this may take 2-5 minutes for first load)..."

# Poll for completion
for i in {1..120}; do
  STATUS_JSON=$(curl -sS "https://api.runpod.ai/v2/$RUNPOD_ENDPOINT_ID/status/$JOB_ID" \
    -H "Authorization: Bearer $RUNPOD_API_KEY")
  STATUS=$(echo "$STATUS_JSON" | jq -r '.status // empty')
  
  if [ "$STATUS" = "COMPLETED" ]; then
    echo "✅ Model warmed up successfully!"
    echo "Response:"
    echo "$STATUS_JSON" | jq .
    
    # Extract audio if available
    B64=$(echo "$STATUS_JSON" | jq -r '.output.audio_b64 // empty')
    if [ -n "$B64" ]; then
      echo "$B64" | base64 -D > warmup-test.wav 2>/dev/null || \
      echo "$B64" | base64 -d > warmup-test.wav 2>/dev/null
      echo "Audio saved to warmup-test.wav"
      ls -lh warmup-test.wav
    fi
    
    echo ""
    echo "🚀 RunPod endpoint is now warm and ready for fast responses!"
    exit 0
  elif [ "$STATUS" = "FAILED" ]; then
    echo "❌ Job failed"
    echo "$STATUS_JSON" | jq .
    exit 1
  fi
  
  # Progress indicator
  if [ $((i % 10)) -eq 0 ]; then
    echo "Status after ${i} polls: $STATUS"
  else
    echo -n "."
  fi
  
  sleep 3
done

echo ""
echo "⏱️ Warmup timed out after 6 minutes"
echo "Check RunPod console for worker status"
exit 1