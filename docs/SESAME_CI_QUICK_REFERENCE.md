# 🌀 Sesame CI Quick Reference

## One-Page Developer Cheatsheet

---

### 🎯 **Current Status Check**
```bash
# What mode am I in?
grep "SESAME_CI_ENABLED" .env

# Is CI endpoint available?
curl http://localhost:8000/ci/shape -X POST \
  -H "Content-Type: application/json" \
  -d '{"text":"Test","style":"fire"}'

# Test full pipeline
cd backend && node test-sesame-ci.js
```

---

### 🔄 **Mode Switching**
```bash
# Interactive switcher
./scripts/switch-sesame.sh

# Manual switch to CI mode
export SESAME_CI_ENABLED=true
export SESAME_CI_REQUIRED=false  # Don't fail if unavailable

# Manual switch to TTS-only
export SESAME_CI_ENABLED=false
```

---

### 🐳 **Docker Commands**
```bash
# TTS-only container
docker run -p 8000:8000 sesame-csm:latest

# CI-enabled container  
docker run -p 8000:8000 sesame-csm-ci:latest

# Check what's running
docker ps | grep sesame
```

---

### 📊 **Environment Variables**
```env
# Core Settings
SESAME_URL=http://localhost:8000       # Sesame base URL
SESAME_CI_ENABLED=true/false          # Enable CI shaping
SESAME_CI_REQUIRED=true/false         # Fail if CI unavailable
SESAME_CI_TIMEOUT=150                 # Max shaping latency (ms)

# Endpoints
SESAME_TTS_ENDPOINT=/tts              # Audio synthesis
SESAME_CI_ENDPOINT=/ci/shape          # Text shaping
```

---

### 🧪 **Test Endpoints**

**Health Check:**
```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy"}
```

**TTS (Always Available):**
```bash
curl -X POST http://localhost:8000/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world"}'
# Expected: {"audio":"base64...","format":"wav"}
```

**CI Shaping (Optional):**
```bash
curl -X POST http://localhost:8000/ci/shape \
  -H "Content-Type: application/json" \
  -d '{
    "text":"Welcome to your session.",
    "style":"aether",
    "meta":{"element":"aether","sentiment":"neutral"}
  }'
# Expected: {"text":"Welcome. <pause-300ms> To your session."}
```

---

### 🔥 **Elemental Shaping Examples**

```javascript
// Fire (Dynamic, Passionate)
{ style: "fire", pausePattern: "dramatic" }
// Output: "Let's go! <pause-100ms> Take action <emphasis>now</emphasis>!"

// Water (Flowing, Gentle)  
{ style: "water", pausePattern: "flowing" }
// Output: "I understand... <pause-500ms> how you're feeling."

// Earth (Steady, Grounding)
{ style: "earth", pausePattern: "grounding" }  
// Output: "Take your time. <pause-600ms> We're here."

// Air (Crisp, Precise)
{ style: "air", pausePattern: "staccato" }
// Output: "Clear. <pause-150ms> Precise. <pause-150ms> Focused."

// Aether (Spacious, Sacred)
{ style: "aether", pausePattern: "sacred" }
// Output: "There's wisdom <pause-800ms> in this moment."
```

---

### 🐛 **Debug Mode**

**Enable Debug Logging:**
```bash
export NODE_ENV=development
export MAYA_DEBUG_MEMORY=true
export SESAME_LOG_LEVEL=debug
```

**Watch Shaping in Console:**
```
🌀 [SESAME SHAPING] Elemental Intelligence Activation
📝 Raw Text: "Hello world"
✨ Shaped Text: "Hello <pause-200ms> world"
⏱️ Processing: 89ms
```

---

### 🚨 **Troubleshooting**

| Issue | Solution |
|-------|----------|
| **404 on /ci/shape** | Container doesn't support CI. Use TTS-only mode. |
| **Timeout errors** | Increase `SESAME_CI_TIMEOUT` or disable CI |
| **No audio output** | Check `/tts` endpoint directly |
| **CI not applying** | Verify `SESAME_CI_ENABLED=true` in .env |
| **Fallback warnings** | Normal if CI unavailable - system continues |

---

### 📈 **Performance Targets**

- **CI Shaping Latency:** <150ms (95th percentile)
- **TTS Generation:** <500ms for typical response
- **Fallback Rate:** <5% in production
- **Success Rate:** >95% when CI enabled

---

### 🔧 **Quick Fixes**

```bash
# Force CI disable (emergency)
echo "SESAME_CI_ENABLED=false" >> .env && npm run dev

# Clear Docker issues
docker system prune -f

# Reset to TTS-only
cp .env.sesame.local .env && npm run dev

# Full restart
docker-compose down && docker-compose up -d && npm run dev
```

---

### 📚 **Key Files**

- **Config:** `.env`, `.env.sesame.*`
- **Pipeline:** `backend/src/services/ConversationalPipeline.ts`
- **Tests:** `backend/test-sesame-ci.js`
- **Scripts:** `backend/scripts/switch-sesame.sh`
- **Docs:** `docs/SESAME_CI_UPGRADE_RITUAL.md`

---

*Keep this reference handy during development and debugging.*