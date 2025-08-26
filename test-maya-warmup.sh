#!/bin/bash

# Maya voice warm-up test (longer timeout for model loading)
TEXT="${1:-Model warmup test}"
OUTPUT_FILE="maya-warmup.wav"

echo "Maya voice warm-up test (5min timeout) with text: '$TEXT'"
echo "This may take several minutes for first model load..."

# Load environment variables
source .env.local

REQ=$(curl -sS -X POST "https://api.runpod.ai/v2/$RUNPOD_ENDPOINT_ID/run" \
  -H "Authorization: Bearer $RUNPOD_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"input\":{\"text\":\"$TEXT\"}}")

echo "Job submitted:"
echo "$REQ" | jq .

JOB_ID=$(echo "$REQ" | jq -r '.id')
[ -z "$JOB_ID" ] || [ "$JOB_ID" = "null" ] && echo "No job ID received" && exit 1

echo "Polling job $JOB_ID (extended timeout for model loading)..."
for i in {1..100}; do
  STATUS_JSON=$(curl -sS "https://api.runpod.ai/v2/$RUNPOD_ENDPOINT_ID/status/$JOB_ID" \
    -H "Authorization: Bearer $RUNPOD_API_KEY")
  STATUS=$(echo "$STATUS_JSON" | jq -r '.status')
  
  # Show progress every 10 polls
  if [ $((i % 10)) -eq 0 ] || [ "$STATUS" != "IN_PROGRESS" ]; then
    echo "poll $i: $STATUS"
  else
    echo -n "."
  fi
  
  if [ "$STATUS" = "COMPLETED" ] || [ "$STATUS" = "FAILED" ]; then
    echo ""
    echo "Final response:"
    echo "$STATUS_JSON" | jq .
    break
  fi
  sleep 3
done

# Handle result
if [ "$STATUS" = "COMPLETED" ]; then
  echo "Success! Extracting audio..."
  
  B64=$(echo "$STATUS_JSON" | jq -r '.output.audio_b64 // empty')
  if [ -n "$B64" ]; then
    echo "Decoding base64 audio..."
    echo "$B64" | base64 -D > "$OUTPUT_FILE" 2>/dev/null || \
    echo "$B64" | base64 -d > "$OUTPUT_FILE" 2>/dev/null
    echo "Audio saved to: $OUTPUT_FILE"
    ls -lh "$OUTPUT_FILE"
    echo "✅ Model is now warm! Future requests should be much faster."
    exit 0
  fi
  
  URL=$(echo "$STATUS_JSON" | jq -r '.output.audio_url // empty')
  if [ -n "$URL" ]; then
    echo "Downloading from URL: $URL"
    curl -sS "$URL" -o "$OUTPUT_FILE"
    echo "Audio saved to: $OUTPUT_FILE"
    ls -lh "$OUTPUT_FILE"
    echo "✅ Model is now warm! Future requests should be much faster."
    exit 0
  fi
  
  echo "❌ Job completed but no audio found"
elif [ "$STATUS" = "FAILED" ]; then
  echo "❌ Job failed - check worker logs"
  exit 1
else
  echo "❌ Timed out after 5 minutes - check RunPod console for worker logs"
  exit 1
fi