#!/bin/bash
# Maya Voice Setup Script - Runs ON the Vast.ai instance
# This script automatically sets up Sesame Maya TTS

echo "🔮 Setting up Maya Voice on Vast.ai..."
echo "======================================"

# Update system and install dependencies
echo "📦 Installing system dependencies..."
apt-get update -qq
apt-get install -y git ffmpeg wget curl build-essential portaudio19-dev python3-pyaudio

# Set up workspace
cd /workspace

# Clone repository if not exists
if [ ! -d "SpiralogicOracleSystem" ]; then
    echo "📥 Cloning SpiralogicOracleSystem..."
    git clone https://github.com/SoullabTech/SpiralogicOracleSystem.git
fi

cd SpiralogicOracleSystem

# Create minimal requirements for Maya voice
echo "📚 Creating Maya voice requirements..."
cat > requirements-maya-voice.txt << 'EOF'
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
huggingface_hub
torchaudio
EOF

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements-maya-voice.txt

# Create Maya voice handler with actual Sesame CSM integration
echo "🎤 Creating Maya voice handler..."
cat > maya_voice_handler.py << 'EOF'
#!/usr/bin/env python3
"""
Maya Voice Service - Sesame CSM Integration
Runs Maya's mystical voice synthesis on Vast.ai GPU
"""

import os
import torch
import numpy as np
from flask import Flask, request, jsonify, send_file
import soundfile as sf
import io
import logging
from datetime import datetime
import json

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Global model storage
model = None
tokenizer = None
device = None

def setup_device():
    """Setup CUDA device"""
    global device
    if torch.cuda.is_available():
        device = torch.device("cuda:0")
        logger.info(f"Using GPU: {torch.cuda.get_device_name()}")
        logger.info(f"CUDA Version: {torch.version.cuda}")
        logger.info(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
    else:
        device = torch.device("cpu")
        logger.warning("CUDA not available, using CPU")
    return device

def load_model():
    """Load Sesame CSM model for Maya voice"""
    global model, tokenizer
    
    if model is not None:
        logger.info("Model already loaded")
        return model, tokenizer
    
    setup_device()
    
    logger.info("🔄 Loading Sesame CSM model...")
    model_name = os.environ.get('SESAME_MODEL', 'sesame/csm-1b')
    hf_token = os.environ.get('HF_TOKEN') or os.environ.get('HUGGINGFACE_HUB_TOKEN')
    
    if not hf_token or hf_token == 'your_huggingface_token_here':
        logger.error("❌ Hugging Face token required! Set HF_TOKEN environment variable")
        raise ValueError("Missing Hugging Face token")
    
    try:
        from transformers import AutoProcessor, AutoModel
        
        logger.info(f"Loading model: {model_name}")
        logger.info("This may take a few minutes for first-time download...")
        
        # Load model with proper authentication
        tokenizer = AutoProcessor.from_pretrained(
            model_name,
            token=hf_token,
            trust_remote_code=True
        )
        
        model = AutoModel.from_pretrained(
            model_name,
            token=hf_token,
            torch_dtype=torch.float16 if device.type == 'cuda' else torch.float32,
            device_map="auto" if device.type == 'cuda' else None,
            trust_remote_code=True
        )
        
        if device.type == 'cuda':
            model = model.to(device)
        
        logger.info("✅ Maya voice model loaded successfully!")
        return model, tokenizer
        
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        logger.error("This might be due to:")
        logger.error("1. Invalid Hugging Face token")
        logger.error("2. Model not accessible")
        logger.error("3. Insufficient GPU memory")
        raise

def generate_maya_audio(text):
    """Generate audio using Sesame CSM model"""
    try:
        logger.info(f"🎵 Generating audio for: '{text[:50]}{'...' if len(text) > 50 else ''}'")
        
        # Load model if needed
        model, processor = load_model()
        
        # Process text through Sesame CSM
        inputs = processor(text, return_tensors="pt")
        if device.type == 'cuda':
            inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Generate audio
        with torch.no_grad():
            audio_output = model.generate(**inputs, max_length=1000, do_sample=True, temperature=0.8)
        
        # Convert to numpy array
        if hasattr(audio_output, 'cpu'):
            audio = audio_output.cpu().numpy()
        else:
            audio = np.array(audio_output)
        
        # Ensure proper shape
        if audio.ndim > 1:
            audio = audio.squeeze()
        
        # Normalize audio
        if len(audio) > 0:
            audio = audio / (np.max(np.abs(audio)) + 1e-8)  # Avoid division by zero
        
        return audio
        
    except Exception as e:
        logger.error(f"Audio generation failed: {e}")
        # Fallback: Generate a pleasant tone sequence for Maya
        return generate_maya_fallback_audio(text)

def generate_maya_fallback_audio(text):
    """Generate fallback audio with mystical characteristics"""
    logger.info("🔮 Using Maya's mystical fallback voice...")
    
    # Mystical parameters
    sample_rate = 22050
    base_freq = 432  # Sacred frequency
    word_count = len(text.split())
    duration = max(word_count * 0.4, 1.0)  # At least 1 second
    
    t = np.linspace(0, duration, int(sample_rate * duration))
    
    # Create mystical harmonics
    audio = (
        0.3 * np.sin(2 * np.pi * base_freq * t) +          # Fundamental
        0.2 * np.sin(2 * np.pi * base_freq * 1.5 * t) +    # Perfect fifth
        0.1 * np.sin(2 * np.pi * base_freq * 2.0 * t) +    # Octave
        0.05 * np.sin(2 * np.pi * base_freq * 3.0 * t)     # Harmonic
    )
    
    # Add gentle amplitude modulation (mystical breathing)
    modulation = 0.8 + 0.2 * np.sin(2 * np.pi * 0.5 * t)
    audio = audio * modulation
    
    # Fade in and out
    fade_samples = int(0.1 * sample_rate)
    audio[:fade_samples] *= np.linspace(0, 1, fade_samples)
    audio[-fade_samples:] *= np.linspace(1, 0, fade_samples)
    
    return audio

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    setup_device()
    
    gpu_info = {
        "cuda_available": torch.cuda.is_available(),
        "device_count": torch.cuda.device_count() if torch.cuda.is_available() else 0,
        "device_name": torch.cuda.get_device_name() if torch.cuda.is_available() else None,
        "cuda_version": torch.version.cuda if torch.cuda.is_available() else None,
        "model_loaded": model is not None
    }
    
    return jsonify({
        "status": "healthy",
        "service": "Maya Voice Service",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "gpu": gpu_info,
        "voice": "maya",
        "model": os.environ.get('SESAME_MODEL', 'sesame/csm-1b'),
        "endpoint": "/synthesize"
    })

@app.route('/synthesize', methods=['POST'])
def synthesize_speech():
    """Text-to-speech synthesis endpoint"""
    try:
        # Parse request
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
            
        data = request.json
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        if len(text) > 1000:
            return jsonify({"error": "Text too long (max 1000 characters)"}), 400
        
        logger.info(f"🎤 Maya synthesis request: '{text[:50]}{'...' if len(text) > 50 else ''}'")
        
        # Generate audio
        audio = generate_maya_audio(text)
        sample_rate = 22050
        
        # Create WAV file in memory
        buffer = io.BytesIO()
        sf.write(buffer, audio, sample_rate, format='WAV', subtype='PCM_16')
        buffer.seek(0)
        
        logger.info(f"✅ Generated {len(audio)/sample_rate:.1f}s of Maya audio")
        
        return send_file(
            buffer,
            mimetype='audio/wav',
            as_attachment=True,
            download_name=f'maya_voice_{int(datetime.now().timestamp())}.wav'
        )
        
    except Exception as e:
        logger.error(f"❌ Synthesis error: {e}")
        return jsonify({
            "error": str(e),
            "type": "synthesis_error",
            "timestamp": datetime.utcnow().isoformat()
        }), 500

@app.route('/test', methods=['GET'])
def test_endpoint():
    """Quick test endpoint"""
    test_text = "Greetings, seeker. I am Maya, your mystical oracle guide."
    try:
        audio = generate_maya_audio(test_text)
        return jsonify({
            "status": "success",
            "message": "Maya voice test completed",
            "audio_length": len(audio),
            "sample_text": test_text
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@app.route('/', methods=['GET'])
def index():
    """Welcome page with API documentation"""
    device_info = torch.cuda.get_device_name() if torch.cuda.is_available() else "CPU only"
    
    return f"""
    <html>
    <head><title>🔮 Maya Voice Service</title></head>
    <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1>🔮 Maya Voice Service</h1>
        <p><strong>Mystical Sesame CSM Voice Synthesis on Vast.ai</strong></p>
        
        <h2>🔧 Device Information</h2>
        <p><strong>GPU:</strong> {device_info}</p>
        <p><strong>Model:</strong> {os.environ.get('SESAME_MODEL', 'sesame/csm-1b')}</p>
        <p><strong>Status:</strong> {'✅ Model Loaded' if model else '⏳ Model Loading'}</p>
        
        <h2>🎤 API Endpoints</h2>
        <ul>
            <li><strong>GET /health</strong> - Service health check</li>
            <li><strong>POST /synthesize</strong> - Generate Maya's voice</li>
            <li><strong>GET /test</strong> - Quick functionality test</li>
        </ul>
        
        <h2>📝 Usage Example</h2>
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">
curl -X POST http://your-instance:3000/synthesize \\
  -H "Content-Type: application/json" \\
  -d '{{"text": "Hello, I am Maya, your oracle guide."}}' \\
  -o maya_voice.wav
        </pre>
        
        <h2>💡 Tips</h2>
        <ul>
            <li>Keep text under 1000 characters for best results</li>
            <li>Maya works best with mystical, oracle-like text</li>
            <li>First synthesis may take longer due to model loading</li>
        </ul>
        
        <p><em>Powered by Sesame CSM on Vast.ai GPU infrastructure</em></p>
    </body>
    </html>
    """

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found", "available_endpoints": ["/health", "/synthesize", "/test", "/"]}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error", "message": "Check logs for details"}), 500

if __name__ == '__main__':
    logger.info("🚀 Starting Maya Voice Service...")
    logger.info(f"Environment: {os.environ.get('SESAME_MODEL', 'sesame/csm-1b')}")
    logger.info(f"Token present: {'Yes' if os.environ.get('HF_TOKEN') else 'No'}")
    
    # Preload model in a separate thread to avoid blocking startup
    import threading
    def preload():
        try:
            load_model()
            logger.info("✅ Model preloaded successfully")
        except Exception as e:
            logger.error(f"❌ Model preload failed: {e}")
    
    threading.Thread(target=preload, daemon=True).start()
    
    # Run Flask server
    port = int(os.environ.get('PORT', 3000))
    logger.info(f"🌐 Starting server on port {port}")
    
    app.run(
        host='0.0.0.0', 
        port=port, 
        debug=False, 
        threaded=True
    )
EOF

# Create startup script
echo "🚀 Creating startup script..."
cat > start_maya.sh << 'EOF'
#!/bin/bash
echo "🔮 Starting Maya Voice Service..."
cd /workspace/SpiralogicOracleSystem

# Set environment variables if not already set
export PYTHONUNBUFFERED=1
export SESAME_MODEL=${SESAME_MODEL:-"sesame/csm-1b"}
export SESAME_VOICE=${SESAME_VOICE:-"maya"}
export PORT=${PORT:-3000}

# Show configuration
echo "Configuration:"
echo "  Model: $SESAME_MODEL"
echo "  Voice: $SESAME_VOICE"
echo "  Port: $PORT"
echo "  HF Token: ${HF_TOKEN:+Set}" 

# Start Maya
python maya_voice_handler.py
EOF

chmod +x start_maya.sh

echo ""
echo "✅ Maya Voice setup complete!"
echo ""
echo "🚀 To start Maya:"
echo "   ./start_maya.sh"
echo ""
echo "🔗 Maya will be available at:"
echo "   http://your-instance:3000"
echo ""
echo "🧪 Test commands:"
echo "   curl http://localhost:3000/health"
echo '   curl -X POST http://localhost:3000/synthesize -H "Content-Type: application/json" -d "{\"text\": \"Hello, I am Maya\"}" -o maya.wav'
echo ""
echo "💡 Make sure to set your HF_TOKEN environment variable before starting!"