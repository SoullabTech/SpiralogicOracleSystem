# 📝 Sesame CSM Runbook – Moving Off the Mock

## 1. Prerequisites

* **Docker Desktop** running (macOS/Windows)
* At least **8 GB RAM free** (model needs space)
* Optional: **GPU drivers** (NVIDIA CUDA) if you want acceleration

Check:

```bash
docker --version
docker ps
```

---

## 2. One-Time Setup

From your project root:

```bash
chmod +x backend/scripts/setup-sesame-offline.sh
./backend/scripts/setup-sesame-offline.sh
```

This script will:

1. **Download model** → `DialoGPT-medium` (~400MB) into `backend/models/sesame/`
2. **Build Docker image** → `sesame-csm:local`
3. **Configure `.env.local`** with:

   ```env
   SESAME_ENABLED=true
   SESAME_MODE=offline
   SESAME_URL=http://localhost:8000/api/v1/generate
   ```

---

## 3. Starting the Real Sesame CSM

### Option A: Via Beta Launcher (Recommended)

```bash
./backend/scripts/start-beta.sh
```

The beta launcher will:
- Kill any mock Sesame server
- Auto-start Docker container
- Wait for model to load (30-60s)
- Verify health before proceeding

### Option B: Manual Start

```bash
# Stop mock server if running
pkill -f "start-mock-sesame" || true

# Start real Sesame container
docker compose -f backend/docker-compose.sesame-offline.yml up -d

# Verify it's ready
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "device": "cuda",  // or "cpu"
  "model_name": "microsoft/DialoGPT-medium"
}
```

---

## 4. Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs sesame-csm

# Common fixes:
docker system prune -f  # Clean up disk space
docker compose -f backend/docker-compose.sesame-offline.yml down
docker compose -f backend/docker-compose.sesame-offline.yml up -d --force-recreate
```

### Model Loading Timeout

```bash
# Increase timeout in .env.local
VOICE_TIMEOUT_MS=60000  # 60 seconds

# Or disable fail-fast mode
VOICE_FAIL_FAST=false
```

### Port Conflicts

```bash
# Kill anything on port 8000
lsof -ti:8000 | xargs kill -9

# Change port in docker-compose.sesame-offline.yml
ports:
  - "8001:8000"  # Use 8001 instead

# Update .env.local
SESAME_URL=http://localhost:8001/api/v1/generate
```

---

## 5. Performance Tuning

### GPU Acceleration (NVIDIA)

```yaml
# In docker-compose.sesame-offline.yml
deploy:
  resources:
    reservations:
      devices:
        - capabilities: [gpu]
```

### CPU-Only Mode

```yaml
# Remove GPU section and add:
environment:
  - CUDA_VISIBLE_DEVICES=-1  # Force CPU
```

### Memory Optimization

```yaml
# Limit container memory
deploy:
  resources:
    limits:
      memory: 4G
```

---

## 6. Testing Voice Generation

### Quick Test

```bash
curl -X POST http://localhost:8000/api/v1/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, I am Maya",
    "max_tokens": 50,
    "temperature": 0.7
  }'
```

### Full Integration Test

```bash
curl -X POST http://localhost:3000/api/voice/unified \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Maya speaking through real Sesame CSM",
    "voiceEngine": "sesame"
  }'
```

---

## 7. Switching Between Mock and Real

### Use Mock (Quick Testing)

```bash
# Stop real Sesame
docker compose -f backend/docker-compose.sesame-offline.yml down

# Start mock
./scripts/start-mock-sesame.sh &
```

### Use Real (Production)

```bash
# Stop mock
pkill -f "start-mock-sesame"

# Start real
docker compose -f backend/docker-compose.sesame-offline.yml up -d
```

---

## 8. Model Alternatives

Update `configs/sesame-server-config.yaml`:

```yaml
model:
  # Smaller/Faster options:
  name: "microsoft/DialoGPT-small"      # ~117MB
  # name: "facebook/blenderbot-400M"    # ~400MB
  # name: "microsoft/DialoGPT-medium"   # ~355MB (default)
  # name: "microsoft/DialoGPT-large"    # ~774MB
```

---

## 9. Production Checklist

- [ ] Docker container running: `docker ps | grep sesame-csm`
- [ ] Health endpoint responding: `curl http://localhost:8000/health`
- [ ] Model loaded: Check for `"model_loaded": true`
- [ ] Voice API working: Test at `/api/voice/unified`
- [ ] Fallback configured: `SESAME_FALLBACK_ENABLED=true`
- [ ] Monitoring: Check `docker logs sesame-csm` regularly

---

## 10. Emergency Fallback

If Sesame fails during production:

```bash
# In .env.local
SESAME_FALLBACK_ENABLED=true
ELEVENLABS_FALLBACK_ONLY=false
VOICE_FALLBACK_TO_ELEVENLABS=true
```

This ensures Maya keeps speaking even if Sesame has issues.

---

## Quick Reference Commands

```bash
# Status check
docker ps | grep sesame
curl http://localhost:8000/health

# Restart
docker restart sesame-csm

# View logs
docker logs -f sesame-csm --tail 50

# Full reset
docker compose -f backend/docker-compose.sesame-offline.yml down
docker compose -f backend/docker-compose.sesame-offline.yml up -d --force-recreate
```

---

🎤 **Ready to move off mock!** Maya's voice is now powered by real AI models running 100% locally.