#!/bin/bash
# Maya Voice - Vast.ai PyTorch Template Startup Script
# Paste this into "Startup script" field in Vast.ai

set -e

echo "🔮 Maya Voice Bootstrap Starting..."
echo "=================================="

# 1. Update system and install essentials
echo "📦 Installing system dependencies..."
apt-get update -qq
apt-get install -y git ffmpeg wget curl jq bc psmisc htop
rm -rf /var/lib/apt/lists/*

# 2. Clone repository
echo "📥 Cloning SpiralogicOracleSystem..."
cd /workspace
if [ ! -d "app" ]; then
    git clone https://github.com/SoullabTech/SpiralogicOracleSystem.git app
fi
cd app

# 3. Install exact PyTorch version for CUDA 12.1
echo "🔥 Installing PyTorch with CUDA support..."
pip install --upgrade pip
pip install --index-url https://download.pytorch.org/whl/cu121 \
    torch==2.4.0+cu121 \
    torchvision==0.19.0+cu121 \
    torchaudio==2.4.0+cu121

# 4. Install Transformers and dependencies
echo "🤖 Installing ML dependencies..."
pip install --no-deps transformers==4.52.1 accelerate==0.33.0 "numpy<2"

# 5. Install additional requirements
echo "📚 Installing additional requirements..."
if [ -f "requirements-runpod.txt" ]; then
    pip install -r requirements-runpod.txt
fi

# Install remaining dependencies
pip install \
    fastapi \
    uvicorn[standard] \
    runpod \
    yt-dlp \
    openai-whisper \
    psutil \
    scipy \
    librosa \
    soundfile \
    pydub

# 6. Set up environment variables
echo "⚙️  Configuring environment..."
export HF_TOKEN="${HF_TOKEN}"
export HUGGINGFACE_TOKEN="${HF_TOKEN}"
export SESAME_MODEL="${SESAME_MODEL:-sesame/csm-1b}"
export SESAME_VOICE="${SESAME_VOICE:-maya}"
export TTS_ENGINE="${TTS_ENGINE:-csm}"
export LOG_LEVEL="${LOG_LEVEL:-INFO}"
export CUDA_VISIBLE_DEVICES="${CUDA_VISIBLE_DEVICES:-0}"
export PORT="${PORT:-8000}"

# 7. Test CUDA setup
echo "🧪 Testing CUDA setup..."
python3 -c "
import torch
print(f'CUDA Available: {torch.cuda.is_available()}')
if torch.cuda.is_available():
    print(f'GPU: {torch.cuda.get_device_name()}')
    print(f'CUDA Version: {torch.version.cuda}')
    print(f'Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB')
else:
    print('WARNING: CUDA not available!')
"

# 8. Start Maya Voice Service
echo "🎤 Starting Maya Voice Service..."
echo "   Model: $SESAME_MODEL"
echo "   Voice: $SESAME_VOICE" 
echo "   Port: $PORT"
echo "   Auto-shutdown: 10 minutes idle"
echo ""

# Create log directory
mkdir -p /tmp/maya-logs

# Start the bootstrap script
cd /workspace/app
nohup python sesame_csm_openai/app/bootstrap_vast.py > /tmp/maya-logs/bootstrap.log 2>&1 &

# Wait a moment for startup
sleep 5

# Check if service started
if curl -f -s "http://localhost:$PORT/health" > /dev/null; then
    echo "✅ Maya Voice Service started successfully!"
    echo "🔗 Endpoints:"
    echo "   Health: http://localhost:$PORT/health"
    echo "   Test: http://localhost:$PORT/test"
    echo "   Synthesize: http://localhost:$PORT/synthesize"
    echo ""
    echo "💡 View logs: tail -f /tmp/maya-logs/bootstrap.log"
else
    echo "⚠️  Service starting... check logs for details"
    echo "📋 Debug: tail -f /tmp/maya-logs/bootstrap.log"
fi

echo ""
echo "🎉 Maya Voice Bootstrap Complete!"
echo "💰 Instance will auto-shutdown after 10 minutes of inactivity"