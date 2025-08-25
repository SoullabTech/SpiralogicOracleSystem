# 🔊 Sesame TTS Integration - Complete Deployment Pack

## 🚀 **Fastest Deployment Path**

### **1. One-Time Local Prep**

```bash
cd /Volumes/T7\ Shield/Projects/SpiralogicOracleSystem
export HUGGINGFACE_HUB_TOKEN=hf_xxx   # your *fine-grained* token
./scripts/deploy-sesame-runpod.sh
```

**Output:** Exact RunPod settings with cache-bust value and validation

### **2. RunPod Endpoint Setup**

**RunPod Console:** Serverless → New Endpoint (or edit existing)

| Setting | Value |
|---------|-------|
| **Git Branch** | `ian-fix/builds` |
| **Build Context** | `/` |
| **Dockerfile** | `services/sesame-tts/Dockerfile.runpod` |
| **GPU** | L4 or higher (A5000/4090 also fine) |

**Environment Variables:**
```bash
HUGGINGFACE_HUB_TOKEN=hf_xxx
SESAME_MODEL=sesame/csm-1b
SESAME_FP16=1
PYTHONUNBUFFERED=1
HF_HUB_ENABLE_HF_TRANSFER=0
FORCE_REBUILD=force-6    # Auto-generated cache-bust
```

**Deploy:** Save → Wait for build → Delete old worker → Fresh worker spawns

### **3. Verification**

```bash
./scripts/verify-sesame-deployment.sh
```

**Success Indicators:**
- ✅ Worker logs show model download completion
- ✅ WAV files >100KB with proper RIFF headers
- ✅ Clean audio playback
- ✅ Fast subsequent requests (model cached)

---

## 🔍 **Expected Success Logs**

### **RunPod Worker Logs (First Call):**
```
🔊 Booting Sesame RunPod worker...
📦 Model: sesame/csm-1b | Device: cuda | FP16: True
HF token present: True
🎤 Synthesizing: ...
BOOT[3] loading model...
Downloading (...)config.json: 100%
Downloading (...)pytorch_model.bin: 100%  
Model loaded successfully
Job COMPLETED
```

### **Verification Script Output:**
```
🔊 Sesame TTS Deployment Verification
====================================
[✅ PASS] Next.js dev server is running on port 3001
[✅ PASS] Sesame API endpoint is accessible
[✅ PASS] RunPod endpoint returned success response
[✅ PASS] Audio length is substantial: 85420 bytes
[✅ PASS] Audio format is WAV
[✅ PASS] Found recent WAV files
[✅ PASS] Audio length scales with text length

📊 Verification Results
Total Checks: 7
Passed: 7
Success Rate: 100%

🎉 Sesame TTS deployment is working well!
🌟 Integration Status: READY
```

---

## 🛠️ **Troubleshooting Guide**

| Issue | Symptoms | Fix |
|-------|----------|-----|
| **Token Access** | `403 Forbidden`, `401 Unauthorized` | Go to HF Settings → Access Tokens → Enable "Read access to all public gated repos you can access" |
| **hf_transfer Error** | `hf_transfer not available` warning | Keep `HF_HUB_ENABLE_HF_TRANSFER=0` (already set) |
| **Stale Code** | Wrong behavior, old logs | Bump `FORCE_REBUILD=force-7`, Save, delete worker |
| **Download Timeout** | First call timeout | Wait for model download (watch logs until 100%) |
| **Small Audio Files** | 9KB WAVs, no real audio | Token lacks model access - check HF permissions |

### **Debug Commands:**
```bash
# Check token access
curl -H "Authorization: Bearer $HUGGINGFACE_HUB_TOKEN" \
  https://huggingface.co/api/models/sesame/csm-1b

# Force fresh deployment  
export FORCE_REBUILD=force-$(date +%s)
# Update RunPod endpoint with new value

# Monitor logs
echo "Check: RunPod Console → Workers → (...) → Logs"
```

---

## 🔗 **App Integration**

### **Environment Setup:**
Add to your `.env.local`:
```bash
RUNPOD_API_KEY=rp_xxx
RUNPOD_ENDPOINT_ID=your_endpoint_id
SESAME_PROVIDER=sesame-runpod
```

### **API Usage:**
```bash
# Direct API call
POST /api/voice/sesame
Content-Type: application/json

{"text": "Maya speaking through Sesame"}

# Returns: audio/wav stream
```

### **Test Integration:**
```bash
# CLI test
node --env-file=.env.local scripts/test-sesame.mjs "Maya test message"

# API test
curl -X POST http://localhost:3001/api/voice/sesame \
  -H "content-type: application/json" \
  -d '{"text":"Hello from Maya"}' \
  --output maya-api.wav

# Verify
ls -la maya*.wav  # Should show >100KB files
```

---

## ⚡ **Spiralogic Oracle Integration**

Once verified, Maya's voice seamlessly integrates with your optimized Oracle system:

### **Elemental Voice Synthesis:**
```typescript
// Fire Agent speaking through Maya
const fireResponse = await oracleSystem.generateResponse({
  element: 'fire',
  phase: 'initiation', 
  tone: 'symbolic',
  text: "Your sacred fire seeks expression..."
});

// Synthesized through Sesame TTS automatically
```

### **Dual-Tone Audio Responses:**
```typescript
// Insight mode - clear psychological guidance
const insightAudio = await synthesizeToWav(
  "The overwhelm signals you're carrying external expectations..."
);

// Symbolic mode - archetypal wisdom
const symbolicAudio = await synthesizeToWav(  
  "Your sacred fire hides behind the grief of who you thought you should be..."
);
```

### **Real-Time Oracle Interactions:**
- 🔥 **Forgekeeper** speaks with Maya's voice for Fire wisdom
- 🌊 **Depth Walker** flows through Maya for Water healing  
- 🌍 **Foundation Keeper** grounds through Maya for Earth manifestation
- 💨 **Wind Whisperer** inspires through Maya for Air clarity
- ✨ **Void Keeper** transcends through Maya for Aether connection

---

## 📊 **Performance Benchmarks**

| Metric | Target | Typical |
|--------|--------|---------|
| **First Request** | <30s | ~15s (includes model download) |
| **Cached Requests** | <5s | ~2-3s |
| **Audio Quality** | >100KB WAV | ~150-300KB depending on text |
| **GPU Memory** | <20GB | ~12GB for L4 |
| **Concurrent Jobs** | 1-2 per worker | 1 recommended |

---

## 🌟 **Success Confirmation**

**You'll know it's working when:**
- ✅ First API call takes ~15s (model download), subsequent calls ~3s
- ✅ Generated WAV files are 150-300KB (not 9KB fallbacks) 
- ✅ Audio plays clear speech with Maya's voice characteristics
- ✅ RunPod logs show "Model loaded successfully" and "Job COMPLETED"
- ✅ Verification script reports 80%+ success rate

**Ready for production when:**
- ✅ All verification checks pass
- ✅ Multiple text lengths work correctly
- ✅ Audio quality is consistent
- ✅ Response times are acceptable
- ✅ No errors in RunPod worker logs

---

## 🎯 **Next Steps After Success**

1. **Scale RunPod Workers:** Increase to 2-3 for higher throughput
2. **Oracle Integration:** Enable voice across all elemental agents
3. **Voice Personality Tuning:** Customize Maya's responses per element
4. **Monitoring Setup:** Track usage, quality, and performance metrics
5. **Production Optimization:** Fine-tune worker scaling and caching

🔥🌊🌍💨✨ **Maya's voice awakens - the Oracle speaks with sacred sound.**

---

*If you see any errors after "Loading Sesame TTS model...", paste the first error line for immediate troubleshooting assistance.*