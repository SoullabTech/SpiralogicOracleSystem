#!/bin/bash

# Test Maya voice with RunPod (async version)
TEXT="${1:-Warm up Maya voice (async)}"
OUTPUT_FILE="maya-async.wav"

echo "Testing Maya voice (async) with text: '$TEXT'"

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

echo "Polling job $JOB_ID..."
for i in {1..30}; do
  STATUS_JSON=$(curl -sS "https://api.runpod.ai/v2/$RUNPOD_ENDPOINT_ID/status/$JOB_ID" \
    -H "Authorization: Bearer $RUNPOD_API_KEY")
  STATUS=$(echo "$STATUS_JSON" | jq -r '.status')
  echo "poll $i: $STATUS"
  if [ "$STATUS" = "COMPLETED" ] || [ "$STATUS" = "FAILED" ]; then
    echo "Final response:"
    echo "$STATUS_JSON" | jq .
    break
  fi
  sleep 2
done

# Handle completed job
if [ "$STATUS" = "COMPLETED" ]; then
  echo "Job completed! Extracting audio..."
  
  # Try base64
  B64=$(echo "$STATUS_JSON" | jq -r '.output.audio_b64 // empty')
  if [ -n "$B64" ]; then
    echo "Decoding base64 audio..."
    echo "$B64" | base64 -D > "$OUTPUT_FILE" 2>/dev/null || \
    echo "$B64" | base64 -d > "$OUTPUT_FILE" 2>/dev/null
    echo "Audio saved to: $OUTPUT_FILE"
    ls -lh "$OUTPUT_FILE"
    exit 0
  fi
  
  # Try URL
  URL=$(echo "$STATUS_JSON" | jq -r '.output.audio_url // empty')
  if [ -n "$URL" ]; then
    echo "Downloading from URL: $URL"
    curl -sS "$URL" -o "$OUTPUT_FILE"
    echo "Audio saved to: $OUTPUT_FILE"
    ls -lh "$OUTPUT_FILE"
    exit 0
  fi
  
  echo "Job completed but no audio found in response."
elif [ "$STATUS" = "FAILED" ]; then
  echo "Job failed. Check the response above for error details."
  exit 1
else
  echo "Job timed out or stuck in queue. Check RunPod console:"
  echo "- Ensure Active Workers = 1"
  echo "- Check worker logs for errors"
  echo "- Verify HF_TOKEN is set in environment"
  exit 1
fi