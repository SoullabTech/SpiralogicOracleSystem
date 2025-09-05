#!/bin/bash

# Fallback setup for Sesame CSM with current PyTorch versions
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Setting up Sesame CSM (Fallback)${NC}"
echo "====================================="

# Check if we're in the right directory
if [ ! -d "sesame-csm" ]; then
    echo -e "${RED}❌ sesame-csm directory not found${NC}"
    echo "Run this script from your project root directory"
    exit 1
fi

cd sesame-csm

# Create/recreate virtual environment
echo -e "\n${YELLOW}📦 Creating Python virtual environment...${NC}"
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate

echo -e "${GREEN}✓ Virtual environment created${NC}"

# Install compatible dependencies
echo -e "\n${YELLOW}📚 Installing compatible dependencies...${NC}"
pip install --upgrade pip

# Install current PyTorch
echo "Installing PyTorch (latest stable)..."
pip install torch torchaudio

# Install core dependencies with compatible versions
echo "Installing core dependencies..."
pip install \
  tokenizers \
  transformers \
  huggingface_hub \
  moshi \
  requests \
  numpy

# Install server dependencies
echo "Installing server dependencies..."
pip install fastapi uvicorn python-multipart

# Set environment variable
export NO_TORCH_COMPILE=1

echo -e "\n${GREEN}✅ Fallback setup complete!${NC}"
echo ""
echo "Note: This is a lightweight setup that may not include all CSM features."
echo "For full functionality, you may need to resolve the original dependency issues."
echo ""
echo "Next steps:"
echo "1. Test basic server: ${BLUE}python server.py${NC}"
echo "2. Or continue with full backend integration"

echo -e "\nTo activate the environment later:"
echo "${BLUE}cd sesame-csm && source .venv/bin/activate${NC}"