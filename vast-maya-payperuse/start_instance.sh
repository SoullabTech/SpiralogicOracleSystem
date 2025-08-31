#!/bin/bash
# Maya Voice - On-Demand Vast.ai Instance Starter
# Spins up GPU only when needed, auto-shuts down when idle

set -euo pipefail

# Required environment variables
: "${VAST_API_KEY?Need VAST_API_KEY}"
: "${OFFER_ID?Need OFFER_ID}" 
: "${IMAGE?Need IMAGE}"
: "${MAX_PRICE?Need MAX_PRICE}"
: "${PORT?Need PORT}"

API="https://vast.ai/api/v0"

echo "🚀 Starting Maya Voice on Vast.ai..."
echo "  Offer ID: $OFFER_ID"
echo "  Max Price: $MAX_PRICE/hr"
echo "  Image: $IMAGE"

# 1) Create and rent the instance
echo "⏳ Creating instance..."
CREATE_PAYLOAD=$(jq -n \
  --arg id "$OFFER_ID" \
  --arg mp "$MAX_PRICE" \
  --arg img "$IMAGE" \
  '{
    image: $img,
    disk: 25,
    machine: ($id | tonumber),
    price: ($mp | tonumber),
    onstart: "",
    label: "maya-voice-auto"
  }')

CREATE_RESPONSE=$(curl -s -H "Accept: application/json" \
  -H "Authorization: Bearer $VAST_API_KEY" \
  -X POST "$API/instances" \
  -d "$CREATE_PAYLOAD")

INSTANCE_ID=$(echo "$CREATE_RESPONSE" | jq -r '.new_contract')

if [ "$INSTANCE_ID" = "null" ] || [ -z "$INSTANCE_ID" ]; then
  echo "❌ Failed to create instance:"
  echo "$CREATE_RESPONSE" | jq .
  exit 1
fi

echo "✅ Instance $INSTANCE_ID created, waiting for startup..."

# 2) Wait for instance to be running
TIMEOUT=300  # 5 minutes max wait
ELAPSED=0

while [ $ELAPSED -lt $TIMEOUT ]; do
  sleep 5
  ELAPSED=$((ELAPSED + 5))
  
  INFO=$(curl -s -H "Authorization: Bearer $VAST_API_KEY" \
    "$API/instances/$INSTANCE_ID" 2>/dev/null || echo '{"state_str":"error"}')
  
  STATUS=$(echo "$INFO" | jq -r '.state_str')
  
  case $STATUS in
    "running")
      echo "🎉 Instance is running!"
      break
      ;;
    "starting"|"loading")
      echo "⏳ Status: $STATUS (${ELAPSED}s elapsed)"
      ;;
    "error"|"null")
      echo "❌ Instance failed to start"
      echo "$INFO" | jq .
      exit 1
      ;;
    *)
      echo "⏳ Status: $STATUS (${ELAPSED}s elapsed)"
      ;;
  esac
done

if [ $ELAPSED -ge $TIMEOUT ]; then
  echo "❌ Timeout waiting for instance to start"
  exit 1
fi

# 3) Get connection details
PUBLIC_IP=$(echo "$INFO" | jq -r '.public_ipaddr')
SSH_HOST=$(echo "$INFO" | jq -r '.ssh_host')
SSH_PORT=$(echo "$INFO" | jq -r '.ssh_port')

echo "🌐 Instance ready:"
echo "  Public IP: $PUBLIC_IP"
echo "  SSH: $SSH_HOST:$SSH_PORT"

# 4) Setup SSH and start Maya container
echo "🔧 Starting Maya container..."

SSH_CMD="ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p $SSH_PORT root@$SSH_HOST"

# Start Maya container with auto-restart
$SSH_CMD "docker run -d \
  --name maya-voice \
  --restart unless-stopped \
  -p $PORT:$PORT \
  -e HF_TOKEN=\"$HF_TOKEN\" \
  -e HUGGINGFACE_TOKEN=\"$HF_TOKEN\" \
  -e SESAME_MODEL=\"sesame/csm-1b\" \
  -e SESAME_VOICE=\"maya\" \
  -e PORT=\"$PORT\" \
  -e LOG_LEVEL=\"info\" \
  $IMAGE"

# 5) Install idle shutdown watchdog
echo "⏰ Installing auto-shutdown watchdog..."

$SSH_CMD "cat > /usr/local/bin/maya-idle-shutdown.sh << 'EOF'
#!/bin/bash
# Maya Voice Idle Shutdown - Powers off after 10 minutes of no activity

PORT=$PORT
IDLE_LIMIT=600  # 10 minutes in seconds
CHECK_INTERVAL=30

idle_seconds=0
last_connection=0

echo \"🔮 Maya idle watchdog started (port $PORT, limit ${IDLE_LIMIT}s)\"

while true; do
  # Check if Maya container is running
  if ! docker ps --format '{{.Names}}' | grep -q '^maya-voice$'; then
    echo \"⚠️  Maya container not running, shutting down\"
    poweroff
    exit 0
  fi
  
  # Check for active connections on Maya port
  connections=\$(ss -tn state established '( dport = :$PORT or sport = :$PORT )' | wc -l)
  current_time=\$(date +%s)
  
  if [ \"\$connections\" -gt 0 ]; then
    echo \"🎤 Active connections: \$connections (resetting idle timer)\"
    idle_seconds=0
    last_connection=\$current_time
  else
    idle_seconds=\$((idle_seconds + CHECK_INTERVAL))
    
    if [ \$idle_seconds -ge \$IDLE_LIMIT ]; then
      echo \"💤 Maya idle for \${IDLE_LIMIT}s - shutting down to save costs\"
      echo \"Last connection: \$(date -d @\$last_connection 2>/dev/null || echo 'never')\"
      
      # Graceful container stop
      docker stop maya-voice 2>/dev/null || true
      
      # Power off instance (stops billing)
      poweroff
      exit 0
    fi
  fi
  
  # Log status every 5 minutes when idle
  if [ \$((idle_seconds % 300)) -eq 0 ] && [ \$idle_seconds -gt 0 ]; then
    echo \"⏳ Maya idle for \${idle_seconds}s (shutdown in \$((IDLE_LIMIT - idle_seconds))s)\"
  fi
  
  sleep \$CHECK_INTERVAL
done
EOF

chmod +x /usr/local/bin/maya-idle-shutdown.sh

# Start watchdog in background
nohup /usr/local/bin/maya-idle-shutdown.sh > /var/log/maya-idle.log 2>&1 &

echo \"✅ Auto-shutdown watchdog installed\""

# 6) Wait for Maya to be ready
echo "🎵 Waiting for Maya to be ready..."
MAYA_URL="http://$PUBLIC_IP:$PORT"

for i in {1..30}; do
  if curl -f -s "$MAYA_URL/health" >/dev/null 2>&1; then
    echo "✅ Maya is ready!"
    break
  fi
  
  if [ $i -eq 30 ]; then
    echo "⚠️  Maya not responding after 150s, but instance is running"
    echo "   Check manually: $MAYA_URL"
  else
    echo "⏳ Waiting for Maya... ($i/30)"
    sleep 5
  fi
done

# 7) Save instance info for cleanup
echo "$INSTANCE_ID" > .vast_instance_id
echo "$PUBLIC_IP" > .vast_public_ip
echo "$MAYA_URL" > .maya_endpoint

echo ""
echo "🎉 Maya Voice is LIVE!"
echo ""
echo "🔗 Endpoint: $MAYA_URL"
echo "🏥 Health:   $MAYA_URL/health"
echo "🎤 Test:     $MAYA_URL/test"
echo ""
echo "💡 Instance will auto-shutdown after 10 minutes of inactivity"
echo "💰 Current cost: \$$(echo "$INFO" | jq -r '.dph_base') per hour"
echo ""
echo "🧪 Test Maya:"
echo "curl -X POST $MAYA_URL/synthesize \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"text\": \"Greetings, seeker. I am Maya.\"}' \\"
echo "  -o maya_test.wav"
echo ""