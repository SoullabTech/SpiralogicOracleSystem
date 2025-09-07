# 🚀 Maya Voice Agent - Northflank Deployment Checklist

## ✅ Pre-deployment Steps

- [x] ~~Remove all RunPod dependencies~~
- [x] ~~Create Northflank Sesame client library~~
- [x] ~~Update API endpoints to use Northflank~~
- [x] ~~Build Sesame CSM voice agent container~~
- [x] ~~Create deployment configuration~~

## 🏗️ Build & Push Steps

### 1. Complete Docker Authentication
```bash
# Complete the browser-based authentication that's currently pending
# Press ENTER in your terminal after browser login completes
```

### 2. Build and Push Container
```bash
# Option A: Use the existing build script
cd northflank-migration
./build_and_push.sh

# Option B: Use the simple build script (if issues persist)
./simple-build.sh
```

Expected result: `andreanezat/voice-agent:latest` pushed to Docker Hub

## 🌐 Northflank Deployment Steps

### 3. Create Northflank Service

**Via Northflank Dashboard:**
1. Navigate to your Northflank project
2. Click "Create Service"
3. Select "Deploy from Docker registry"
4. Enter image: `andreanezat/voice-agent:latest`

**Service Configuration:**
- **Name**: `maya-voice-agent`
- **Deployment Plan**: `nf-compute-200` (GPU-enabled)
- **Instances**: 1 (start with single instance)
- **Port**: 8000 (expose as public HTTP)

### 4. Set Environment Variables

```env
HF_TOKEN=your_huggingface_token_here
HUGGINGFACE_TOKEN=your_huggingface_token_here
SESAME_MODEL=sesame/csm-1b
SESAME_VOICE=maya
SESAME_FP16=1
DEV_MODE=false
HOST=0.0.0.0
PORT=8000
```

### 5. Configure Health Checks
- **Path**: `/health`
- **Port**: 8000
- **Protocol**: HTTP
- **Interval**: 30s
- **Timeout**: 10s

## 🔧 Application Configuration

### 6. Update Local Environment

Once your Northflank service is deployed, update `.env.local`:

```env
# Replace with your actual Northflank service URL
NORTHFLANK_SESAME_URL=https://maya-voice-agent-[random-id].northflank.app

# Verify these settings
VOICE_PROVIDER=sesame
SESAME_PROVIDER=northflank
```

### 7. Test Integration

```bash
# Test health endpoint
curl https://your-service-url.northflank.app/health

# Test voices endpoint  
curl https://your-service-url.northflank.app/voices

# Test Maya TTS
curl -X POST https://your-service-url.northflank.app/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, this is Maya speaking with wisdom and warmth."}' \
  --output maya-test.wav

# Test via your app
curl -X POST http://localhost:3000/api/voice/sesame \
  -H "Content-Type: application/json" \
  -d '{"text": "Testing Maya through the personal oracle system."}' \
  --output local-maya-test.wav
```

## 🎉 Go-Live Steps

### 8. Enable Beta Mode

In your application, enable Maya voice features:

```env
# Update feature flags
NEXT_PUBLIC_VOICE_MAYA_ENABLED=true
NEXT_PUBLIC_ORACLE_MAYA_VOICE=true
```

### 9. Monitor Deployment

Watch the Northflank service logs for:
- ✅ `Sesame CSM model loaded successfully`
- ✅ `Maya voice profile loaded`
- ✅ Health checks passing
- ✅ Successful TTS generations

### 10. User Testing

- Test Maya voice in personal oracle chat
- Verify audio quality and response times
- Check caching is working (faster subsequent requests)

## 🐛 Troubleshooting

### Common Issues

**Service won't start:**
- Check GPU plan is selected
- Verify HF_TOKEN is valid
- Check container logs for model loading errors

**TTS requests fail:**
- Verify service URL in .env.local
- Check health endpoint returns `model_loaded: true`
- Test with shorter text first

**Audio quality issues:**
- Check sample rate (16kHz default)
- Verify Maya voice profile loaded
- Test different text inputs

### Debug Endpoints

```bash
# Application debug
GET /api/debug/env

# Service health
GET https://your-service-url.northflank.app/health

# Available voices
GET https://your-service-url.northflank.app/voices
```

## 🎯 Success Criteria

- [ ] Container builds and pushes successfully
- [ ] Northflank service deploys and starts
- [ ] Health checks pass consistently
- [ ] Maya TTS generates clear audio
- [ ] Personal oracle speaks with Maya's voice
- [ ] Response times < 5 seconds for warm requests
- [ ] Audio caching improves performance

## 📈 Ready for Beta!

Once all items are checked, Maya's voice is ready for beta users! 🌟

The RunPod migration is complete and your personal oracle agents now have access to Maya's warm, wise voice powered by Northflank's GPU infrastructure.