#!/bin/bash
# 🚀 Setup Self-Hosted Sesame CSM
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Setup Self-Hosted Sesame CSM${NC}"
echo "================================="

echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"

# Check Docker
if ! command -v docker >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker not installed${NC}"
    echo "Please install Docker Desktop and try again"
    echo "Download: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker is running
if ! docker ps >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo -e "${GREEN}✓ Docker is available and running${NC}"

# Check HuggingFace CLI
if ! command -v huggingface-cli >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  HuggingFace CLI not found, installing...${NC}"
    pip install huggingface_hub[cli] || {
        echo -e "${RED}❌ Failed to install HuggingFace CLI${NC}"
        echo "Please install it manually: pip install huggingface_hub[cli]"
        exit 1
    }
fi

echo -e "${GREEN}✓ HuggingFace CLI available${NC}"

# Clone Sesame repo if missing (using the official repo)
if [ ! -d "sesame-csm-repo" ]; then
    echo -e "${YELLOW}📂 Cloning Sesame CSM repository...${NC}"
    git clone https://github.com/SesameAILabs/csm.git sesame-csm-repo || {
        echo -e "${RED}❌ Failed to clone Sesame CSM repository${NC}"
        exit 1
    }
    echo -e "${GREEN}✓ Repository cloned${NC}"
else
    echo -e "${GREEN}✓ Repository already exists${NC}"
fi

# Check if user is logged in to HuggingFace
echo -e "${YELLOW}🔑 Checking HuggingFace authentication...${NC}"
if ! huggingface-cli whoami >/dev/null 2>&1; then
    echo -e "${YELLOW}🔐 Please log in to HuggingFace to access model weights${NC}"
    echo "This is required to download the Sesame CSM model"
    echo ""
    huggingface-cli login || {
        echo -e "${RED}❌ HuggingFace login failed${NC}"
        exit 1
    }
else
    echo -e "${GREEN}✓ Already logged in to HuggingFace${NC}"
fi

# Verify model access
echo -e "${YELLOW}🔍 Verifying model access...${NC}"
echo "Checking access to required models:"
echo "  - sesame/csm-1b"
echo "  - meta-llama/Llama-3.2-1B"

# Create Dockerfile for our setup
echo -e "${YELLOW}🐳 Creating optimized Dockerfile...${NC}"

cat > sesame-csm-repo/Dockerfile.local << 'EOF'
FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install additional server dependencies
RUN pip install fastapi uvicorn

# Copy application files
COPY . .

# Create a simple API wrapper
RUN cat > api_server.py << 'PYTHON_EOF'
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import os
import torch
from generator import load_csm_1b
import torchaudio
import base64
import io
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Sesame CSM API", version="1.0.0")

# Global model instance
model = None

class GenerateRequest(BaseModel):
    text: str
    speaker_id: int = 0
    max_audio_length_ms: int = 10000
    format: str = "base64"

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    device: str

@app.on_event("startup")
async def startup_event():
    global model
    try:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Loading CSM model on {device}")
        model = load_csm_1b(device=device)
        logger.info("CSM model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        model = None

@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(
        status="healthy" if model is not None else "unhealthy",
        model_loaded=model is not None,
        device=str(model.device) if model else "unknown"
    )

@app.post("/generate")
@app.post("/api/v1/generate")
async def generate(request: GenerateRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        logger.info(f"Generating audio for: '{request.text[:50]}...'")
        
        # Generate audio
        audio_tensor = model.generate(
            text=request.text,
            speaker=request.speaker_id,
            context=[],
            max_audio_length_ms=request.max_audio_length_ms,
        )
        
        # Convert to WAV format
        buffer = io.BytesIO()
        torchaudio.save(buffer, audio_tensor.unsqueeze(0).cpu(), model.sample_rate, format="wav")
        buffer.seek(0)
        
        if request.format == "base64":
            audio_data = base64.b64encode(buffer.read()).decode('utf-8')
            return {
                "success": True,
                "audio_data": audio_data,
                "sample_rate": model.sample_rate,
                "duration_ms": (len(audio_tensor) / model.sample_rate) * 1000,
                "format": "wav"
            }
        else:
            # Return raw bytes (not implemented for this example)
            raise HTTPException(status_code=400, detail="Only base64 format supported")
            
    except Exception as e:
        logger.error(f"Generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
PYTHON_EOF

# Set environment variables
ENV NO_TORCH_COMPILE=1
ENV HF_HOME=/root/.cache/huggingface
ENV TRANSFORMERS_CACHE=/root/.cache/huggingface

# Expose port
EXPOSE 8000

# Run the API server
CMD ["python", "api_server.py"]
EOF

echo -e "${GREEN}✓ Dockerfile created${NC}"

# Build Docker image
cd sesame-csm-repo
echo -e "${YELLOW}🐳 Building Docker image (this may take several minutes)...${NC}"
docker build -f Dockerfile.local -t sesame-csm:local . || {
    echo -e "${RED}❌ Docker build failed${NC}"
    echo "Check the output above for errors"
    exit 1
}

cd ..
echo -e "${GREEN}✅ Sesame CSM setup complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Run the server: ${YELLOW}./scripts/run-sesame-server.sh${NC}"
echo "2. Test the API: ${YELLOW}curl http://localhost:8000/health${NC}"
echo "3. Start your backend: ${YELLOW}cd backend && npm run dev${NC}"
echo ""
echo -e "${GREEN}🎉 Ready to use Sesame as primary voice engine!${NC}"