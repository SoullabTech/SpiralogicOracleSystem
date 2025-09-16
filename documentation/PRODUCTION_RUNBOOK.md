# 🌟 Spiralogic Oracle – Production Voice System

### ✅ Current State

* **Backend**: Stable on port **3002**
* **Frontend**: Accessible at **[http://localhost:3000/oracle](http://localhost:3000/oracle)**
* **Voice**:

  * 🟢 **Sesame CSM** (Primary – mock right now, offline real model ready to deploy)
  * 🟡 **HuggingFace/Blenderbot** (Secondary, token validated)
  * 🔴 **ElevenLabs** (Tertiary fallback)
* **Conversations**: Anthropic Claude integrated; OpenAI available when quota allows
* **Persistence**: In-memory stable, Supabase ready to re-enable when DNS issues are resolved

---

### 🎤 Voice Pipeline

1. **Sesame (Local)** – Fast, contextual, primary voice
2. **HuggingFace (Cloud)** – Model-backed, lightweight fallback
3. **ElevenLabs (Premium)** – Last-resort fallback for quality

**Real-time Indicator** in UI shows:

* Which engine was used
* Response times
* Fallback reasons

---

### 🛠️ Usage Workflow

```bash
# Daily use
./scripts/start-beta.sh

# One-time full offline setup (when you want the *real* Sesame CSM model)
./backend/scripts/setup-sesame-offline.sh
```

Check:

* Voice: `http://localhost:3000/api/voice/unified`
* Health: `http://localhost:3002/api/v1/health`

---

### 🌐 Monitoring

* **UI Badge** – Compact engine status
* **VoiceControls Card** – Full latency, error, fallback reason tracking
* **Console Logs** – Detailed attempt history (Sesame → HF → ElevenLabs)

---

## 🚀 Quick Start Commands

### Start Everything
```bash
# From project root
./backend/scripts/start-beta.sh
```

### Start Services Individually
```bash
# Backend only
cd backend && npm run dev

# Frontend only
cd . && npm run dev

# Mock Sesame voice
./scripts/start-mock-sesame.sh
```

### Health Checks
```bash
# Backend health
curl http://localhost:3002/api/v1/health

# Voice API status
curl http://localhost:3000/api/voice/unified

# Test voice generation
curl -X POST http://localhost:3000/api/voice/unified \
  -H "Content-Type: application/json" \
  -d '{"text": "Maya voice test", "voiceEngine": "auto"}'
```

---

## 🔧 Environment Configuration

### Critical Variables (.env.local)
```env
# Voice Engine Priority
VOICE_PRIMARY=sesame
VOICE_SECONDARY=huggingface
VOICE_TERTIARY=elevenlabs

# Sesame Configuration
SESAME_ENABLED=true
SESAME_MODE=offline
SESAME_URL=http://localhost:8000/api/v1/generate

# Fallback Settings
SESAME_FALLBACK_ENABLED=true
VOICE_FALLBACK_TO_ELEVENLABS=true

# API Keys
ANTHROPIC_API_KEY=sk-ant-...
ELEVENLABS_API_KEY=sk_...
```

### Service Ports
- **Backend API**: 3002
- **Frontend**: 3000
- **Sesame Voice**: 8000
- **Redis** (if enabled): 6379

---

## 📊 Production Monitoring Checklist

### Pre-Flight Checks
- [ ] Docker Desktop running
- [ ] All environment variables set
- [ ] Ports 3000, 3002, 8000 available
- [ ] At least 8GB RAM free

### Runtime Monitoring
- [ ] Backend responds at `/api/v1/health`
- [ ] Frontend loads at `/oracle`
- [ ] Voice synthesis working
- [ ] Fallback chain operational
- [ ] Memory usage stable
- [ ] No TypeScript errors in logs

### Voice System Status
```bash
# Check voice engine status
curl -s http://localhost:3000/api/voice/unified | jq .

# Expected response includes:
# - voiceRouter.sesamePrimary: true
# - voiceRouter.sesameAvailable: true
# - voiceRouter.fallbackEnabled: true
```

---

## 🛡️ Troubleshooting

### Backend Won't Start
```bash
# Check logs
tail -f backend/backend.log

# Common fixes:
cd backend && npm install
npm run build:check  # Verify TypeScript compilation
```

### Voice Not Working
```bash
# 1. Check Sesame server
curl http://localhost:8000/health

# 2. Restart mock if needed
pkill -f "start-mock-sesame"
./scripts/start-mock-sesame.sh &

# 3. Verify API keys in .env.local
grep "API_KEY" .env.local
```

### High Memory Usage
```bash
# Restart services
pkill -f "node"
pkill -f "npm"
./backend/scripts/start-beta.sh
```

---

## 🔄 Switching Voice Modes

### Use Mock Sesame (Development)
```bash
SESAME_MODE=mock ./backend/scripts/start-beta.sh
```

### Use Real Sesame (Production)
```bash
# First time setup
./backend/scripts/setup-sesame-offline.sh

# Then start normally
SESAME_MODE=offline ./backend/scripts/start-beta.sh
```

### Force Specific Engine
```bash
# Test with specific engine
curl -X POST http://localhost:3000/api/voice/unified \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test message",
    "voiceEngine": "elevenlabs"  // or "sesame", "huggingface"
  }'
```

---

## 📈 Performance Optimization

### Reduce Startup Time
```env
# In .env.local
VOICE_TIMEOUT_MS=10000  # Faster timeouts
VOICE_RETRY_COUNT=0     # No retries
```

### Optimize Memory
```env
# Limit concurrent requests
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
```

### GPU Acceleration (When Available)
```yaml
# In docker-compose.sesame-offline.yml
deploy:
  resources:
    reservations:
      devices:
        - capabilities: [gpu]
```

---

## 🚨 Emergency Procedures

### Complete System Reset
```bash
# Stop everything
pkill -f "node"
pkill -f "npm"
docker compose down

# Clear caches
rm -rf backend/node_modules/.cache
rm -rf .next

# Restart fresh
npm install
cd backend && npm install
cd ..
./backend/scripts/start-beta.sh
```

### Fallback to ElevenLabs Only
```env
# In .env.local (emergency mode)
SESAME_ENABLED=false
VOICE_PRIMARY=elevenlabs
ELEVENLABS_FALLBACK_ONLY=false
```

---

✨ **Bottom line**: Maya is production-ready today with mock Sesame voice, transparent fallback, and full conversational stack. The *only next leap* is swapping the mock with the real Sesame CSM offline container when you're ready.

---

## 📚 Additional Resources

- **Sesame CSM Setup**: See `SESAME_CSM_RUNBOOK.md`
- **API Documentation**: `backend/src/api/README.md`
- **Voice Architecture**: `docs/VOICE_SYSTEM_ARCHITECTURE.md`
- **Troubleshooting Guide**: `docs/TROUBLESHOOTING.md`

---

Last Updated: September 3, 2025
Version: 1.0.0