#!/bin/bash

# Test Maya voice with RunPod (sync version)
TEXT="${1:-Hello from Maya}"
OUTPUT_FILE="maya-test.wav"

echo "Testing Maya voice (sync) with text: '$TEXT'"

# Load environment variables
source .env.local

# Test sync endpoint
echo "Testing sync endpoint..."
RESP=$(curl -sS -X POST "https://api.runpod.ai/v2/$RUNPOD_ENDPOINT_ID/runsync" \
  -H "Authorization: Bearer $RUNPOD_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"input\":{\"text\":\"$TEXT\"}}")

echo "Response:"
echo "$RESP" | jq .

# Check if we got actual output
OUTPUT_EXISTS=$(echo "$RESP" | jq -r '.output // empty')
if [ -n "$OUTPUT_EXISTS" ]; then
  echo "Got output section, checking for audio..."
  
  # Try base64 first
  B64=$(echo "$RESP" | jq -r '.output.audio_b64 // empty')
  if [ -n "$B64" ]; then
    echo "Decoding base64 audio..."
    echo "$B64" | base64 -D > "$OUTPUT_FILE" 2>/dev/null || \
    echo "$B64" | base64 -d > "$OUTPUT_FILE" 2>/dev/null
    echo "Audio saved to: $OUTPUT_FILE"
    ls -lh "$OUTPUT_FILE"
    exit 0
  fi
  
  # Try URL
  URL=$(echo "$RESP" | jq -r '.output.audio_url // empty')
  if [ -n "$URL" ]; then
    echo "Downloading from URL: $URL"
    curl -sS "$URL" -o "$OUTPUT_FILE"
    echo "Audio saved to: $OUTPUT_FILE"
    ls -lh "$OUTPUT_FILE"
    exit 0
  fi
  
  echo "Output section exists but no audio_b64 or audio_url found."
else
  echo "No output section - job may still be processing or failed."
  STATUS=$(echo "$RESP" | jq -r '.status // empty')
  if [ "$STATUS" = "IN_PROGRESS" ]; then
    echo "Job is still IN_PROGRESS. Try the async version or check RunPod console."
  fi
fi