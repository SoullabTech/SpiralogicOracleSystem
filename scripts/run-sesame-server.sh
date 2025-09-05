#!/bin/bash
# 🎙️ Run Sesame CSM Server (self-hosted)
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🎙️ Starting Sesame CSM Server${NC}"
echo "============================="

# Check if Docker image exists
if ! docker images sesame-csm:local -q | grep -q .; then
    echo -e "${RED}❌ Sesame CSM Docker image not found${NC}"
    echo "Please run setup first: ${YELLOW}./scripts/setup-sesame-local.sh${NC}"
    exit 1
fi

# Check if port 8000 is available
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 8000 is in use${NC}"
    echo "Stopping existing process..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo -e "${GREEN}✓ Docker image found${NC}"
echo -e "${GREEN}✓ Port 8000 available${NC}"

# Mount HuggingFace cache to avoid re-downloading models
HF_CACHE_DIR="$HOME/.cache/huggingface"
mkdir -p "$HF_CACHE_DIR"

echo -e "\n${YELLOW}🚀 Starting Sesame CSM container...${NC}"
echo "This may take a few minutes for initial model loading"
echo ""

# Copy HuggingFace token to a temporary file for Docker
if [ -n "$HF_TOKEN" ] || huggingface-cli whoami >/dev/null 2>&1; then
    echo -e "${GREEN}✓ HuggingFace authentication available${NC}"
    
    # Get the token from the CLI config
    if [ -z "$HF_TOKEN" ]; then
        HF_TOKEN=$(cat ~/.cache/huggingface/token 2>/dev/null || echo "")
    fi
fi

# Run the container with GPU support if available
echo -e "${BLUE}📦 Container configuration:${NC}"
echo "  - Port: 8000 (host) -> 8000 (container)"
echo "  - Cache: $HF_CACHE_DIR -> /root/.cache/huggingface"
echo "  - GPU: $(docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi >/dev/null 2>&1 && echo "Enabled" || echo "CPU only")"
echo ""

# Determine GPU support
if docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi >/dev/null 2>&1; then
    GPU_FLAG="--gpus all"
    echo -e "${GREEN}🚀 Starting with GPU acceleration${NC}"
else
    GPU_FLAG=""
    echo -e "${YELLOW}🚀 Starting with CPU (slower generation)${NC}"
fi

# Create environment variables for the container
ENV_VARS=""
if [ -n "$HF_TOKEN" ]; then
    ENV_VARS="$ENV_VARS -e HF_TOKEN=$HF_TOKEN"
fi

# Run the container
echo -e "\n${BLUE}Starting container...${NC}"

docker run --rm -it \
    $GPU_FLAG \
    -p 8000:8000 \
    -v "$HF_CACHE_DIR:/root/.cache/huggingface" \
    -e NO_TORCH_COMPILE=1 \
    -e HF_HOME=/root/.cache/huggingface \
    -e TRANSFORMERS_CACHE=/root/.cache/huggingface \
    $ENV_VARS \
    --name sesame-csm-server \
    sesame-csm:local

# Note: This script will block here while the container runs
# Press Ctrl+C to stop the server