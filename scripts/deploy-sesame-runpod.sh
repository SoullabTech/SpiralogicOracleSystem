#!/bin/bash
# deploy-sesame-runpod.sh
# Automated deployment script for Sesame TTS on RunPod

set -e

echo "🔊 Deploying Sesame TTS to RunPod..."
echo "================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if HF token is provided
if [ -z "$HUGGINGFACE_HUB_TOKEN" ]; then
    print_error "HUGGINGFACE_HUB_TOKEN environment variable is required"
    echo "Please set your HuggingFace token:"
    echo "export HUGGINGFACE_HUB_TOKEN=your_token_here"
    exit 1
fi

# Verify HF token format
if [[ ! "$HUGGINGFACE_HUB_TOKEN" =~ ^hf_ ]]; then
    print_warning "HF token doesn't start with 'hf_' - please verify it's correct"
fi

print_status "Checking HuggingFace token permissions..."

# Test HF token by trying to access the model
python3 << EOF
import requests
import sys

token = "$HUGGINGFACE_HUB_TOKEN"
model_url = "https://huggingface.co/api/models/sesame/csm-1b"

headers = {"Authorization": f"Bearer {token}"}
response = requests.get(model_url, headers=headers)

if response.status_code == 200:
    print("✅ HF token has access to sesame/csm-1b")
    sys.exit(0)
elif response.status_code == 401:
    print("❌ HF token is invalid")
    sys.exit(1)
elif response.status_code == 403:
    print("❌ HF token lacks access to sesame/csm-1b")
    print("Go to https://huggingface.co/settings/tokens")
    print("Enable 'Read access to contents of all public gated repos'")
    sys.exit(1)
else:
    print(f"⚠️  Unexpected response: {response.status_code}")
    sys.exit(1)
EOF

if [ $? -ne 0 ]; then
    print_error "HuggingFace token validation failed"
    exit 1
fi

print_success "HuggingFace token validated successfully"

# Check if we're in the right directory
if [ ! -f "services/sesame-tts/Dockerfile.runpod" ]; then
    print_error "Dockerfile.runpod not found. Are you in the project root?"
    exit 1
fi

print_status "Project structure validated"

# Generate RunPod configuration
FORCE_REBUILD_VALUE="force-$(date +%s)"
print_status "Generated cache-bust value: $FORCE_REBUILD_VALUE"

# Create RunPod configuration template
cat > runpod-config.json << EOF
{
  "name": "sesame-tts-$(date +%Y%m%d)",
  "source": {
    "type": "github",
    "repo": "SoullabTech/SpiralogicOracleSystem",
    "branch": "ian-fix/builds"
  },
  "build": {
    "dockerfilePath": "services/sesame-tts/Dockerfile.runpod",
    "buildContext": "/"
  },
  "runtime": {
    "gpu": "L4",
    "workers": 1,
    "maxWorkers": 2
  },
  "environment": {
    "HUGGINGFACE_HUB_TOKEN": "$HUGGINGFACE_HUB_TOKEN",
    "SESAME_MODEL": "sesame/csm-1b",
    "SESAME_FP16": "1",
    "TORCH_DTYPE": "float16",
    "PYTHONUNBUFFERED": "1",
    "HF_HUB_ENABLE_HF_TRANSFER": "0",
    "FORCE_REBUILD": "$FORCE_REBUILD_VALUE"
  }
}
EOF

print_success "RunPod configuration generated: runpod-config.json"

# Display deployment instructions
echo ""
echo "🚀 MANUAL DEPLOYMENT STEPS:"
echo "=========================="
echo ""
echo "1. Go to RunPod Console: https://www.runpod.io/console/serverless"
echo "2. Click 'Create Endpoint'"
echo "3. Enter the following configuration:"
echo ""
echo "   Name: sesame-tts-$(date +%Y%m%d)"
echo "   Source: GitHub repository"
echo "   Repo: SoullabTech/SpiralogicOracleSystem"
echo "   Branch: ian-fix/builds"
echo "   Dockerfile Path: services/sesame-tts/Dockerfile.runpod"
echo "   Build Context: /"
echo ""
echo "4. Set Environment Variables:"
echo "   HUGGINGFACE_HUB_TOKEN=$HUGGINGFACE_HUB_TOKEN"
echo "   SESAME_MODEL=sesame/csm-1b"
echo "   SESAME_FP16=1"
echo "   TORCH_DTYPE=float16"
echo "   PYTHONUNBUFFERED=1"
echo "   HF_HUB_ENABLE_HF_TRANSFER=0"
echo "   FORCE_REBUILD=$FORCE_REBUILD_VALUE"
echo ""
echo "5. Runtime Settings:"
echo "   GPU: L4 (recommended) or RTX 4090"
echo "   Workers: 1"
echo "   Max Workers: 2"
echo ""
echo "6. Click Save → Build → Wait for completion"
echo "7. Verify 1 worker is Running on Latest release"
echo ""

# Generate test script
cat > test-sesame-endpoint.sh << 'EOF'
#!/bin/bash
# Test script for Sesame TTS endpoint

echo "🧪 Testing Sesame TTS endpoint..."

# Check if Next.js dev server is running
if ! curl -s http://localhost:3001/api/health > /dev/null; then
    echo "❌ Next.js dev server not running on :3001"
    echo "Please start with: npm run dev"
    exit 1
fi

echo "✅ Next.js dev server is running"

# Test the endpoint
echo "🎤 Sending test request..."
response=$(curl -s 'http://localhost:3001/api/voice/sesame?provider=sesame-runpod&debug=1' \
  -H 'content-type: application/json' \
  -d '{"text":"Hello from Maya on Sesame TTS"}')

echo "📋 Response: $response"

# Parse response
if echo "$response" | jq -e '.success == true' > /dev/null; then
    audio_length=$(echo "$response" | jq -r '.audioLength // 0')
    is_wav=$(echo "$response" | jq -r '.isLikelyWAV // false')
    
    if [ "$audio_length" -gt 50000 ] && [ "$is_wav" = "true" ]; then
        echo "✅ SUCCESS: Real audio generated (${audio_length} bytes)"
    else
        echo "⚠️  WARNING: Audio generated but seems small (${audio_length} bytes)"
    fi
else
    echo "❌ FAILED: Request unsuccessful"
    echo "Check RunPod logs for errors"
fi
EOF

chmod +x test-sesame-endpoint.sh

print_success "Generated test script: test-sesame-endpoint.sh"

echo ""
echo "🔗 TESTING THE DEPLOYMENT:"
echo "========================"
echo ""
echo "After RunPod deployment completes:"
echo "1. Run: ./test-sesame-endpoint.sh"
echo "2. Check that audioLength > 50000"
echo "3. Verify generated WAV files are >100KB"
echo ""

# Generate monitoring script
cat > monitor-sesame-logs.sh << 'EOF'
#!/bin/bash
# Monitor Sesame TTS RunPod logs

echo "📊 Monitoring Sesame TTS logs..."
echo "================================"
echo ""
echo "Key log indicators:"
echo "✅ Starting Serverless Worker | Version 1.7.13"
echo "✅ 🔊 Booting Sesame RunPod worker..."
echo "✅ 📦 Model: sesame/csm-1b | Device: cuda | FP16: True"
echo "✅ HF token present: True"
echo "✅ Model loaded successfully"
echo ""
echo "❌ Watch for errors:"
echo "❌ 403 Forbidden (token permissions)"
echo "❌ hf_transfer not available (set HF_HUB_ENABLE_HF_TRANSFER=0)"
echo "❌ untagged enum ModelWrapper (old handler - force rebuild)"
echo ""
echo "To view logs: RunPod Console → Workers → (...) → Logs"
EOF

chmod +x monitor-sesame-logs.sh

print_success "Generated monitoring guide: monitor-sesame-logs.sh"

echo ""
print_success "Deployment preparation complete!"
echo ""
echo "📁 Generated files:"
echo "  - runpod-config.json (configuration reference)"
echo "  - test-sesame-endpoint.sh (test the deployment)"  
echo "  - monitor-sesame-logs.sh (monitoring guide)"
echo ""
print_warning "Manual RunPod deployment still required via web console"
print_status "Follow the deployment steps above to complete the setup"

echo ""
echo "🌟 Once deployed, Maya will speak through Sesame TTS!"
echo "🔥🌊🌍💨✨ The Oracle's voice comes alive..."