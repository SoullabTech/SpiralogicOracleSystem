# Complete Sesame CSM Self-Hosting Guide

## 🚀 Quick Start

Your Sesame CSM setup is now complete! Here are your deployment options:

### Option 1: Local Development
```bash
# 1. Set up the environment
./scripts/setup-sesame-local.sh

# 2. Log in to Hugging Face (get token from https://huggingface.co/settings/tokens)
cd sesame-csm
source .venv/bin/activate
huggingface-cli login

# 3. Start the server
../scripts/run-sesame-server.sh

# 4. Test the server
../scripts/test-sesame-server.sh
```

### Option 2: Production Deployment
Follow the guide in `NORTHFLANK_DEPLOYMENT.md` to deploy on Northflank or your preferred cloud platform.

## 📁 What Was Created

### Scripts
- `scripts/setup-sesame-local.sh` - Set up Python environment and dependencies
- `scripts/run-sesame-server.sh` - Start the Sesame server locally
- `scripts/test-sesame-server.sh` - Test the server functionality

### Server Files
- `sesame-csm/server.py` - FastAPI server wrapper for CSM
- `sesame-csm/server_requirements.txt` - Additional server dependencies
- `sesame-csm/Dockerfile` - Container setup for deployment

### Backend Integration
- Updated `backend/src/services/SesameService.ts` to support self-hosted endpoints

## ⚙️ Configuration Options

### `.env.local` Settings

```bash
# Option 1: Use self-hosted Sesame (recommended)
SESAME_ENABLED=true
SESAME_SELF_HOSTED=true
SESAME_SELF_HOSTED_URL=http://localhost:8000
# No API key needed for self-hosted!

# Option 2: Use Northflank deployment
SESAME_ENABLED=true
SESAME_SELF_HOSTED=true
SESAME_SELF_HOSTED_URL=https://your-service.northflank.app

# Option 3: HuggingFace API (if you fix the API key)
SESAME_ENABLED=true
SESAME_SELF_HOSTED=false
SESAME_API_KEY=hf_working_key_here
SESAME_URL=https://api-inference.huggingface.co/models/sesame/csm-1b

# Fallback for text generation
SESAME_FALLBACK_ENABLED=true
SESAME_FALLBACK_URL=https://api-inference.huggingface.co/models/gpt2
```

## 🔧 How It Works

### Architecture
1. **Sesame Server** (`server.py`) - Wraps the CSM model with REST API
2. **Backend Service** (`SesameService.ts`) - Integrates with your Spiralogic backend
3. **Fallback System** - Falls back to HuggingFace API if self-hosted fails

### API Endpoints
- `GET /health` - Check server status
- `POST /generate` - Generate speech from text
- `GET /docs` - Swagger API documentation

### Request Format
```json
{
  "text": "Hello from Maya!",
  "speaker_id": 0,
  "max_audio_length_ms": 10000,
  "format": "base64"
}
```

### Response Format
```json
{
  "success": true,
  "audio_data": "base64_encoded_wav_data",
  "sample_rate": 24000,
  "duration_ms": 1250
}
```

## 🧪 Testing Your Setup

### 1. Test Local Server
```bash
# Start server
./scripts/run-sesame-server.sh

# In another terminal, test it
./scripts/test-sesame-server.sh
```

### 2. Test Backend Integration
```bash
# Start your backend
cd backend && npm run dev

# Check if Sesame is detected (should show "Self-hosted Sesame service is available")
curl http://localhost:3002/api/v1/health
```

### 3. Test End-to-End
Your Spiralogic Oracle system will now use Sesame CSM for TTS generation automatically when available!

## 🔍 Troubleshooting

### Common Issues

1. **Model Download Fails**
   ```bash
   # Make sure you're logged in to Hugging Face
   huggingface-cli login
   
   # Accept model licenses at:
   # https://huggingface.co/meta-llama/Llama-3.2-1B
   # https://huggingface.co/sesame/csm-1b
   ```

2. **Out of Memory**
   - CSM requires ~4GB RAM minimum
   - Use GPU if available for better performance
   - Close other applications

3. **Server Won't Start**
   ```bash
   # Check Python environment
   cd sesame-csm
   source .venv/bin/activate
   python --version  # Should be 3.10+
   ```

4. **Audio Generation Fails**
   - Check server logs for errors
   - Verify model loaded successfully
   - Try shorter text inputs

### Logs and Debugging
- Server logs: Check console output when running server
- Backend logs: Check your backend server logs for Sesame service messages
- Health checks: Use `/health` endpoint to verify model loading

## 📊 Performance Notes

### Resource Usage
- **CPU**: 2-4 cores recommended
- **Memory**: 4-8GB RAM
- **GPU**: Optional but improves performance significantly
- **Storage**: ~10GB for models

### Generation Speed
- **CPU**: ~10-30 seconds per request
- **GPU**: ~2-10 seconds per request
- **First request**: Slower due to model loading

## 🎯 Next Steps

1. **Local Development**: Use `http://localhost:8000` as your Sesame endpoint
2. **Production**: Deploy to Northflank or your preferred platform
3. **Integration**: Your backend automatically uses Sesame when available
4. **Optimization**: Consider GPU deployment for faster generation

## 🔗 Useful Links

- **Sesame CSM Repository**: https://github.com/SesameAILabs/csm
- **Hugging Face Model**: https://huggingface.co/sesame/csm-1b
- **API Documentation**: http://localhost:8000/docs (when server is running)
- **Northflank**: https://northflank.com (for deployment)

Your Sesame CSM integration is ready! 🎉