#!/bin/bash
# Maya Voice Pay-Per-Use Setup Script
# Sets up the complete serverless GPU infrastructure

set -e

echo "🔮 Maya Voice - Pay-Per-Use Setup"
echo "================================="

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

echo "📋 GPU Options (pick one):"
echo ""
echo "1. Budget Option - RTX 5070 (12GB)"
echo "   • Offer ID: 25474740"
echo "   • Cost: ~$0.098/hr ($2.35/day)"
echo "   • Good for: Basic Maya voice synthesis"
echo ""
echo "2. Balanced Option - RTX 4090 (24GB)" 
echo "   • Offer ID: 8936960"
echo "   • Cost: ~$0.40/hr ($9.60/day)"
echo "   • Good for: Fast synthesis + headroom"
echo ""
echo "3. Premium Option - H100 SXM (80GB)"
echo "   • Offer ID: 19663399" 
echo "   • Cost: ~$1.87/hr ($45/day)"
echo "   • Good for: Ultra-low latency"
echo ""

# Get user choice
read -p "Choose option (1-3) [1]: " CHOICE
CHOICE=${CHOICE:-1}

case $CHOICE in
  1)
    OFFER_ID="25474740"
    MAX_PRICE="0.15"
    GPU_NAME="RTX 5070"
    ;;
  2)
    OFFER_ID="8936960"
    MAX_PRICE="0.50"
    GPU_NAME="RTX 4090"
    ;;
  3)
    OFFER_ID="19663399"
    MAX_PRICE="2.00"
    GPU_NAME="H100 SXM"
    ;;
  *)
    echo "Invalid choice, using RTX 5070"
    OFFER_ID="25474740"
    MAX_PRICE="0.15"
    GPU_NAME="RTX 5070"
    ;;
esac

echo ""
echo "✅ Selected: $GPU_NAME (Offer ID: $OFFER_ID, Max: \$$MAX_PRICE/hr)"

# Get API keys
echo ""
echo "🔑 API Configuration"
echo ""

if [ -f "$ENV_FILE" ]; then
  echo "Found existing .env file, loading..."
  source "$ENV_FILE"
fi

# Vast.ai API Key
if [ -z "${VAST_API_KEY:-}" ]; then
  echo "Get your Vast.ai API key: https://vast.ai/api/"
  read -p "Enter Vast.ai API Key: " VAST_API_KEY
fi

# Hugging Face Token
if [ -z "${HF_TOKEN:-}" ]; then
  echo "Get your HF token: https://huggingface.co/settings/tokens"
  read -p "Enter Hugging Face Token: " HF_TOKEN
fi

# Create .env file
echo "💾 Saving configuration..."
cat > "$ENV_FILE" << EOF
# Maya Voice Pay-Per-Use Configuration
VAST_API_KEY="$VAST_API_KEY"
HF_TOKEN="$HF_TOKEN"
HUGGINGFACE_TOKEN="$HF_TOKEN"

# Instance Configuration
OFFER_ID="$OFFER_ID"
IMAGE="soullab1/voice-agent:latest"
MAX_PRICE="$MAX_PRICE"
PORT="3000"

# Selected GPU
GPU_NAME="$GPU_NAME"
EOF

echo "✅ Configuration saved to .env"

# Make scripts executable
echo "🔧 Setting up scripts..."
chmod +x "$SCRIPT_DIR/start_instance.sh"
chmod +x "$SCRIPT_DIR/stop_instance.sh"
chmod +x "$SCRIPT_DIR/maya-serverless.mjs"

# Install dependencies if package.json exists
if [ -f "$SCRIPT_DIR/package.json" ]; then
  echo "📦 Installing Node.js dependencies..."
  cd "$SCRIPT_DIR"
  npm install
else
  echo "📦 Creating package.json..."
  cd "$SCRIPT_DIR"
  cat > package.json << 'EOF'
{
  "name": "maya-voice-serverless",
  "version": "1.0.0",
  "description": "Maya Voice Pay-Per-Use GPU System",
  "type": "module",
  "scripts": {
    "start": "node maya-serverless.mjs start",
    "stop": "node maya-serverless.mjs stop", 
    "status": "node maya-serverless.mjs status"
  },
  "dependencies": {
    "node-fetch": "^3.3.2"
  }
}
EOF
  npm install
fi

# Create helper scripts
echo "🛠️  Creating helper commands..."

cat > "$SCRIPT_DIR/maya" << 'EOF'
#!/bin/bash
# Maya Voice CLI Helper
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Load environment
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

case "${1:-help}" in
  start)
    echo "🚀 Starting Maya on $GPU_NAME..."
    node maya-serverless.mjs start
    ;;
  stop)
    echo "🛑 Stopping Maya..."
    node maya-serverless.mjs stop
    ;;
  status)
    node maya-serverless.mjs status
    ;;
  test)
    if [ -f .maya_endpoint ]; then
      ENDPOINT=$(cat .maya_endpoint)
      echo "🧪 Testing Maya at $ENDPOINT..."
      curl -X POST "$ENDPOINT/synthesize" \
        -H "Content-Type: application/json" \
        -d '{"text": "Greetings, seeker. I am Maya, your mystical oracle guide."}' \
        -o maya_test.wav
      echo "✅ Test audio saved to maya_test.wav"
    else
      echo "❌ No active Maya instance. Run './maya start' first."
    fi
    ;;
  logs)
    if [ -f .vast_instance_id ]; then
      INSTANCE_ID=$(cat .vast_instance_id)
      echo "📋 Instance $INSTANCE_ID logs:"
      # Note: Vast.ai doesn't have direct log API, would need SSH
      echo "To view logs, SSH into the instance and check /var/log/maya-idle.log"
    else
      echo "❌ No active instance"
    fi
    ;;
  cost)
    if [ -f .vast_instance_id ]; then
      node maya-serverless.mjs status | grep -E "(Cost|Uptime)"
    else
      echo "💰 No active instance (cost: $0/hr)"
    fi
    ;;
  *)
    echo "🔮 Maya Voice Pay-Per-Use Controller"
    echo ""
    echo "Usage:"
    echo "  ./maya start    # Start Maya (spins up GPU)"
    echo "  ./maya stop     # Stop Maya (halts billing)"  
    echo "  ./maya status   # Check current status"
    echo "  ./maya test     # Test voice synthesis"
    echo "  ./maya cost     # Show current costs"
    echo ""
    echo "Configuration:"
    echo "  GPU: $GPU_NAME"
    echo "  Max Cost: \$${MAX_PRICE}/hr"
    echo ""
    ;;
esac
EOF

chmod +x "$SCRIPT_DIR/maya"

# Create README
cat > "$SCRIPT_DIR/README.md" << EOF
# 🔮 Maya Voice - Pay-Per-Use GPU System

Cost-effective serverless GPU for Maya's voice synthesis using Vast.ai.

## Quick Start

\`\`\`bash
# Start Maya (spins up GPU on-demand)
./maya start

# Test Maya's voice
./maya test

# Check status and costs
./maya status
./maya cost

# Stop Maya (halts billing)
./maya stop
\`\`\`

## Configuration

- **GPU:** $GPU_NAME
- **Cost:** ~\$$MAX_PRICE/hr maximum
- **Auto-shutdown:** 10 minutes idle
- **Image:** \`soullab1/voice-agent:latest\`

## Cost Estimates

- **10 minutes use:** ~\$$(echo "scale=3; $MAX_PRICE * 10 / 60" | bc)
- **1 hour continuous:** ~\$$MAX_PRICE
- **Daily (8hrs active):** ~\$$(echo "scale=2; $MAX_PRICE * 8" | bc)

## API Integration

Use the Node.js controller for serverless integration:

\`\`\`javascript
import MayaServerless from './maya-serverless.mjs';

const maya = new MayaServerless();

// Start on-demand
const instance = await maya.ensureMayaAvailable();
console.log('Maya ready:', instance.endpoint);

// Use Maya
const response = await fetch(\`\${instance.endpoint}/synthesize\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Hello from Maya' })
});
\`\`\`

## Safety Features

- ✅ **Price ceiling:** Max \$$MAX_PRICE/hr (prevents runaway costs)
- ✅ **Auto-shutdown:** Powers off after 10 minutes idle
- ✅ **Manual stop:** Immediate billing halt with \`./maya stop\`
- ✅ **Status monitoring:** Real-time cost and health tracking

## Files

- \`maya\` - Main CLI command
- \`start_instance.sh\` - Vast.ai instance launcher
- \`stop_instance.sh\` - Instance terminator
- \`maya-serverless.mjs\` - Node.js serverless controller
- \`.env\` - Configuration (API keys, offer ID)
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "📂 Files created:"
echo "  • ./maya               (main command)"
echo "  • ./start_instance.sh  (instance starter)"
echo "  • ./stop_instance.sh   (instance stopper)" 
echo "  • ./maya-serverless.mjs (Node.js controller)"
echo "  • ./.env               (configuration)"
echo "  • ./README.md          (documentation)"
echo ""
echo "🎯 Next steps:"
echo "1. Test the system:"
echo "   ./maya start"
echo "   ./maya test"
echo "   ./maya stop"
echo ""
echo "2. Integration options:"
echo "   • CLI: Use ./maya commands directly"
echo "   • Node.js: Import maya-serverless.mjs"  
echo "   • HTTP API: Deploy maya-serverless.mjs to Vercel/Netlify"
echo ""
echo "💰 Your Maya will cost ~\$$MAX_PRICE/hr only when actively running"
echo "⏰ Auto-shuts down after 10 minutes idle to save money"
echo ""
echo "🔗 Vast.ai dashboard: https://vast.ai/instances/"