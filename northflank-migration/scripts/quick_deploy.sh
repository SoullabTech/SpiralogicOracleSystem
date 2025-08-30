#!/bin/bash
"""
Quick deployment script for Northflank migration
Usage: ./quick_deploy.sh [your-dockerhub-username]
"""

set -e  # Exit on error

# Configuration
REGISTRY="ghcr.io"
NAMESPACE=${1:-"soullabtech"}  # Use first argument or default
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "🚀 Quick Deploy to Northflank"
echo "Registry: $REGISTRY"
echo "Namespace: $NAMESPACE"
echo "Timestamp: $TIMESTAMP"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check Docker
if ! command -v docker &> /dev/null; then
    error "Docker is not installed or not in PATH"
fi

log "Docker version: $(docker --version)"

# Build Voice Agent
log "Building voice-agent..."
cd ../voice-agent
VOICE_TAG="$REGISTRY/$NAMESPACE/voice-agent:$TIMESTAMP"
docker build -t "$VOICE_TAG" .
docker tag "$VOICE_TAG" "$REGISTRY/$NAMESPACE/voice-agent:latest"
success "Built voice-agent"

# Build Memory Agent  
log "Building memory-agent..."
cd ../memory-agent
MEMORY_TAG="$REGISTRY/$NAMESPACE/memory-agent:$TIMESTAMP"
docker build -t "$MEMORY_TAG" .
docker tag "$MEMORY_TAG" "$REGISTRY/$NAMESPACE/memory-agent:latest"
success "Built memory-agent"

# Push images (if not skipped)
if [[ "$2" != "--skip-push" ]]; then
    log "Pushing images..."
    
    docker push "$VOICE_TAG"
    docker push "$REGISTRY/$NAMESPACE/voice-agent:latest"
    success "Pushed voice-agent"
    
    docker push "$MEMORY_TAG"  
    docker push "$REGISTRY/$NAMESPACE/memory-agent:latest"
    success "Pushed memory-agent"
else
    warn "Skipping push (--skip-push flag detected)"
fi

# Generate deployment info
cd ../
cat > deployment_info.txt << EOF
🚀 Northflank Deployment Info - $(date)

Voice Agent:
- Image: $VOICE_TAG
- Latest: $REGISTRY/$NAMESPACE/voice-agent:latest
- Port: 8000
- GPU Required: Yes

Memory Agent:
- Image: $MEMORY_TAG  
- Latest: $REGISTRY/$NAMESPACE/memory-agent:latest
- Port: 8000
- GPU Required: No

Next Steps:
1. Go to Northflank Dashboard
2. Create New Project
3. Add Service > Deploy from Docker Image
4. Use the image names above
5. Configure ports (8000 for both)
6. Add GPU resources for voice-agent
7. Deploy!

Environment Variables (if needed):
- PORT=8000
- HOST=0.0.0.0
EOF

success "Deployment complete!"
echo ""
echo "📝 Deployment info saved to deployment_info.txt"
echo "🐳 Images built and pushed:"
echo "   • $VOICE_TAG"
echo "   • $MEMORY_TAG"
echo ""
echo "🔗 Next: Go to Northflank and deploy these images!"