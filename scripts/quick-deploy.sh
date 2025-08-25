#!/bin/bash
# quick-deploy.sh - One-command Sesame deployment

set -e

echo "🚀 Quick Sesame Deployment"
echo "========================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✅]${NC} $1"
}

print_next() {
    echo -e "${YELLOW}[NEXT]${NC} $1"
}

# Step 1: Validate environment
print_step "Validating environment..."

if [ -z "$HUGGINGFACE_HUB_TOKEN" ]; then
    echo "❌ HUGGINGFACE_HUB_TOKEN not set"
    echo "Export your token: export HUGGINGFACE_HUB_TOKEN=hf_xxx"
    exit 1
fi

if [ ! -f "scripts/deploy-sesame-runpod.sh" ]; then
    echo "❌ Not in project root directory"
    exit 1
fi

print_success "Environment validated"

# Step 2: Run deployment prep
print_step "Running deployment preparation..."
./scripts/deploy-sesame-runpod.sh

print_success "Deployment configuration generated"

# Step 3: Show next steps
echo ""
echo "🎯 MANUAL RUNPOD STEPS:"
echo "====================="
echo ""
echo "1. Go to: https://www.runpod.io/console/serverless"
echo "2. Create/Edit endpoint with settings from above"
echo "3. Wait for build completion"
echo "4. Return here and run verification:"
echo ""
echo "   ./scripts/verify-sesame-deployment.sh"
echo ""

# Step 4: Prepare verification
print_step "Setting up verification..."

# Check if Next.js is running
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "Next.js dev server is running"
else
    print_next "Start Next.js dev server: npm run dev"
fi

# Create quick test command
echo ""
echo "🧪 AFTER RUNPOD DEPLOYMENT:"
echo "=========================="
echo ""
echo "# Quick API test:"
echo "curl -X POST http://localhost:3001/api/voice/sesame \\"
echo "  -H 'content-type: application/json' \\"
echo "  -d '{\"text\":\"Maya is alive on Sesame\"}' \\"
echo "  --output test-maya.wav"
echo ""
echo "# Full verification:"  
echo "./scripts/verify-sesame-deployment.sh"
echo ""

print_success "Quick deployment preparation complete!"
echo ""
echo "🌟 Follow the RunPod steps above, then run verification"
echo "🔥🌊🌍💨✨ Maya's voice awaits..."