#!/bin/bash

# Test Maya voice with RunPod
TEXT="${1:-Hello from Maya}"
OUTPUT_FILE="maya-test.wav"

echo "Testing Maya voice with text: '$TEXT'"

# Load environment variables
source .env.local

# Submit job
REQ=$(curl -sS -X POST \
  "https://api.runpod.ai/v2/$RUNPOD_ENDPOINT_ID/run" \
  -H "Authorization: Bearer $RUNPOD_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"input\":{\"text\":\"$TEXT\",\"voice\":\"maya\"}}")

echo "Job submitted:"
echo "$REQ" | jq .
JOB_ID=$(echo "$REQ" | jq -r '.id // empty')
[ -z "$JOB_ID" ] && echo "No job id; response above shows the error." && exit 1

# Poll for completion
echo "Polling for completion..."
for i in {1..40}; do
  STATUS_JSON=$(curl -sS -X GET \
    "https://api.runpod.ai/v2/$RUNPOD_ENDPOINT_ID/status/$JOB_ID" \
    -H "Authorization: Bearer $RUNPOD_API_KEY")
  STATUS=$(echo "$STATUS_JSON" | jq -r '.status // empty')
  echo "poll $i: $STATUS"
  if [ "$STATUS" = "COMPLETED" ] || [ "$STATUS" = "FAILED" ]; then
    echo "Final response:"
    echo "$STATUS_JSON" | jq .
    break
  fi
  sleep 3
done

# Extract audio from final response
if [ "$STATUS" = "COMPLETED" ]; then
  URL=$(echo "$STATUS_JSON" | jq -r '.output.audio_url // empty')
  B64=$(echo "$STATUS_JSON" | jq -r '.output.audio_b64 // empty')

  if [ -n "$URL" ]; then
    echo "Downloading from URL..."
    curl -sS "$URL" -o "$OUTPUT_FILE"
  elif [ -n "$B64" ]; then
    echo "Decoding base64 audio..."
    (echo "$B64" | base64 -D 2>/dev/null) > "$OUTPUT_FILE" || \
    (echo "$B64" | base64 -d 2>/dev/null) > "$OUTPUT_FILE"
  else
    echo "No audio fields in completed response."
    exit 1
  fi

  echo "Audio saved to: $OUTPUT_FILE"
  ls -lh "$OUTPUT_FILE"
else
  echo "Job failed or timed out."
  exit 1
fi