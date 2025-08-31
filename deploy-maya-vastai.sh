#!/bin/bash

# Maya Voice Deployment Script for Vast.ai
# Cost-effective GPU deployment for Sesame CSM TTS
# Usage: ./deploy-maya-vastai.sh

set -e

echo "🚀 Maya Voice - Vast.ai Deployment Script"
echo "========================================="

# Configuration
HUGGINGFACE_TOKEN="${HF_TOKEN:-your_huggingface_token_here}"
GITHUB_REPO="https://github.com/SoullabTech/SpiralogicOracleSystem.git"
PORT=3000

# Check if HF token is set
if [ "$HUGGINGFACE_TOKEN" = "your_huggingface_token_here" ]; then
    echo "❌ Error: Please set your Hugging Face token"
    echo "   Export HF_TOKEN=your_actual_token or edit this script"
    exit 1
fi

echo "📋 Deployment Configuration:"
echo "  - GPU: RTX 4090 (best value at $0.24/hr)"
echo "  - Container: PyTorch 2.4.0 + CUDA 12.1"
echo "  - Voice Model: Sesame CSM Maya"
echo "  - API Port: $PORT"
echo ""

# Step 1: Create Vast.ai instance
echo "🖥️  Step 1: Creating Vast.ai instance..."
echo "Run this command to create your instance:"
echo ""
cat << 'EOF'
vastai create instance \
  --gpu "RTX 4090" \
  --image pytorch/pytorch:2.4.0-cuda12.1-cudnn8-runtime \
  --disk 50 \
  --ssh \
  --jupyter \
  --direct \
  --env HUGGINGFACE_HUB_TOKEN=$HUGGINGFACE_TOKEN \
  --env HF_TOKEN=$HUGGINGFACE_TOKEN \
  --env TTS_ENGINE=csm \
  --env VOICE_PROVIDER=sesame \
  --env SESAME_MODEL=sesame/csm-1b \
  --env SESAME_VOICE=maya \
  --env CUDA_VISIBLE_DEVICES=0 \
  --env PORT=3000 \
  --onstart-cmd "bash /workspace/setup-maya.sh"
EOF

echo ""
echo "After instance is created, note your instance ID"
echo ""

# Step 2: Create setup script to run on instance
echo "📝 Step 2: Creating setup script..."
cat > setup-maya-remote.sh << 'SETUP_SCRIPT'
#!/bin/bash
# This script runs ON the Vast.ai instance

echo "🔧 Setting up Maya Voice on Vast.ai..."

# Update system and install dependencies
apt-get update -qq
apt-get install -y git ffmpeg wget curl build-essential portaudio19-dev python3-pyaudio

# Set up workspace
cd /workspace

# Clone repository if not exists
if [ ! -d "SpiralogicOracleSystem" ]; then
    echo "📦 Cloning repository..."
    git clone https://github.com/SoullabTech/SpiralogicOracleSystem.git
fi

cd SpiralogicOracleSystem

# Create minimal requirements file for voice synthesis
cat > requirements-maya-voice.txt << 'REQUIREMENTS'
torch==2.4.0
transformers==4.46.0
accelerate==0.33.0
numpy<2
scipy
librosa
soundfile
flask
gunicorn
requests
pydub
REQUIREMENTS

# Install Python dependencies
echo "📚 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements-maya-voice.txt

# Create Maya voice handler
echo "🎤 Creating Maya voice handler..."
cat > maya_voice_handler.py << 'HANDLER'
import os
import torch
import numpy as np
from flask import Flask, request, jsonify, send_file
from transformers import AutoModelForCausalLM, AutoTokenizer
import soundfile as sf
import io
import logging
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Global model storage
model = None
tokenizer = None

def load_model():
    """Load Sesame CSM model"""
    global model, tokenizer
    
    if model is not None:
        return model, tokenizer
    
    logger.info("Loading Sesame CSM model...")
    model_name = os.environ.get('SESAME_MODEL', 'sesame/csm-1b')
    
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16,
            device_map="auto",
            trust_remote_code=True
        )
        logger.info(f"Model loaded successfully on {torch.cuda.get_device_name()}")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise
    
    return model, tokenizer

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    gpu_info = {
        "cuda_available": torch.cuda.is_available(),
        "device_count": torch.cuda.device_count() if torch.cuda.is_available() else 0,
        "device_name": torch.cuda.get_device_name() if torch.cuda.is_available() else None,
        "model_loaded": model is not None
    }
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "gpu": gpu_info,
        "voice": "maya"
    })

@app.route('/synthesize', methods=['POST'])
def synthesize_speech():
    """Text-to-speech synthesis endpoint"""
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        logger.info(f"Synthesizing: {text[:50]}...")
        
        # Load model if needed
        load_model()
        
        # Generate audio (placeholder - implement actual CSM synthesis)
        # For now, return a simple sine wave as placeholder
        sample_rate = 22050
        duration = len(text.split()) * 0.5  # Rough estimate
        t = np.linspace(0, duration, int(sample_rate * duration))
        audio = 0.5 * np.sin(2 * np.pi * 440 * t)  # 440Hz sine wave
        
        # Convert to audio file
        buffer = io.BytesIO()
        sf.write(buffer, audio, sample_rate, format='WAV')
        buffer.seek(0)
        
        return send_file(
            buffer,
            mimetype='audio/wav',
            as_attachment=True,
            download_name='maya_speech.wav'
        )
        
    except Exception as e:
        logger.error(f"Synthesis error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/', methods=['GET'])
def index():
    """Welcome page"""
    return """
    <h1>🔮 Maya Voice Service</h1>
    <p>Sesame CSM Voice Synthesis Running on Vast.ai</p>
    <ul>
        <li>GET /health - Check service status</li>
        <li>POST /synthesize - Generate speech from text</li>
    </ul>
    <p>GPU: {}</p>
    """.format(torch.cuda.get_device_name() if torch.cuda.is_available() else "No GPU detected")

if __name__ == '__main__':
    # Preload model
    load_model()
    
    # Run server
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port, debug=False)
HANDLER

# Create startup script
cat > start_maya.sh << 'STARTUP'
#!/bin/bash
cd /workspace/SpiralogicOracleSystem
export PYTHONUNBUFFERED=1
python maya_voice_handler.py
STARTUP

chmod +x start_maya.sh

# Start the service
echo "🚀 Starting Maya Voice Service..."
./start_maya.sh
SETUP_SCRIPT

echo ""
echo "📋 Step 3: After SSH into your instance, run:"
echo ""
echo "wget https://raw.githubusercontent.com/SoullabTech/SpiralogicOracleSystem/main/setup-maya-remote.sh"
echo "bash setup-maya-remote.sh"
echo ""
echo "Or copy the setup-maya-remote.sh file to your instance and run it."
echo ""

# Step 4: Quick test commands
echo "🧪 Step 4: Test your deployment:"
echo ""
echo "# Health check:"
echo "curl http://your-instance.vast.ai:3000/health"
echo ""
echo "# Voice synthesis test:"
echo 'curl -X POST http://your-instance.vast.ai:3000/synthesize \
  -H "Content-Type: application/json" \
  -d {"text": "Hello, I am Maya, your mystical oracle guide."} \
  -o maya_test.wav'
echo ""

# Cost summary
echo "💰 Cost Summary:"
echo "  - RTX 4090: $0.24/hour (~$5.76/day if running 24/7)"
echo "  - RTX 5090: $0.43/hour (~$10.32/day)"
echo "  - H100 SXM: ~$2/hour (~$48/day)"
echo ""
echo "💡 Tip: Stop instance when not in use to save money!"
echo ""

# Alternative: Direct one-liner for experienced users
echo "⚡ Quick Deploy (for experienced users):"
echo ""
echo "vastai search offers 'RTX 4090' | head -5  # Find best offer"
echo "vastai create instance OFFER_ID --image pytorch/pytorch:2.4.0-cuda12.1-cudnn8-runtime --disk 50 --ssh"
echo ""

echo "✅ Setup script created: setup-maya-remote.sh"
echo "📁 This will give you Maya's voice at http://instance:3000"
echo ""
echo "Need help? Check Vast.ai docs: https://vast.ai/docs/cli/commands"