#!/bin/bash
set -e

echo "🚀 Simple Maya Voice Agent Build"
echo "Building for Northflank deployment..."

# Navigate to the right directory
cd "$(dirname "$0")/northflank-migration"

# Clean up any Mac-specific files
find . -name "._*" -delete 2>/dev/null || true

# Build just the voice agent with a simpler approach
echo "🎙️ Building Maya Voice Agent..."

# Use buildx but with more reliable settings
docker buildx build \
  --platform linux/amd64 \
  -t andreanezat/voice-agent:latest \
  --progress=plain \
  ./voice-agent/ \
  --push

echo "✅ Maya Voice Agent built and pushed!"
echo ""
echo "🎯 Ready for Northflank deployment:"
echo "   Image: andreanezat/voice-agent:latest"
echo ""
echo "Next steps:"
echo "1. Create new service in Northflank"
echo "2. Use image: andreanezat/voice-agent:latest"  
echo "3. Select GPU-enabled deployment plan"
echo "4. Set environment variables:"
echo "   - HF_TOKEN=<your_huggingface_token>"
echo "   - SESAME_MODEL=sesame/csm-1b"
echo "   - SESAME_VOICE=maya"
echo "   - DEV_MODE=false"
echo "5. Deploy and test!"