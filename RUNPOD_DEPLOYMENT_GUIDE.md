# RunPod Sesame TTS Deployment Guide

## 🚀 Quick Setup Checklist

Follow these exact steps to deploy a fresh Sesame TTS endpoint on RunPod.

### **1. Create the Endpoint**

**RunPod Console:** Serverless → Create Endpoint

| Setting | Value |
|---------|-------|
| **Name** | `sesame-tts` (or `SpiralogicOracleSystem-tts`) |
| **Source** | GitHub repository |
| **Repo** | `SoullabTech/SpiralogicOracleSystem` |
| **Branch** | `ian-fix/builds` |
| **Dockerfile Path** | `services/sesame-tts/Dockerfile.runpod` |
| **Build Context** | `/` (repo root) |

### **2. Runtime & GPU Configuration**

| Setting | Recommended Value |
|---------|-------------------|
| **GPU** | L4 or RTX 4090 (A5000 works but slower) |
| **Workers** | 1 |
| **Max Workers** | 1-2 (until stability confirmed) |
| **Concurrency** | Default (RunPod handles per-worker queuing) |

### **3. Environment Variables**

**⚠️ Critical:** Add these exact environment variables:

```bash
HUGGINGFACE_HUB_TOKEN=<your_hf_token>    # MayaSesame token with repo access
HF_TOKEN=<same_token_or_blank>           # Optional fallback
SESAME_MODEL=sesame/csm-1b
SESAME_FP16=1
TORCH_DTYPE=float16
PYTHONUNBUFFERED=1
HF_HUB_ENABLE_HF_TRANSFER=0              # Avoids missing hf_transfer package
FORCE_REBUILD=force-6                    # Cache-bust knob
```

**💡 Pro Tip:** Use RunPod Secrets for `HUGGINGFACE_HUB_TOKEN` to keep it secure.

**🔧 Cache Busting:** If you suspect stale builds, bump `FORCE_REBUILD` to `force-7`, `force-8`, etc.

### **4. Deploy & Build**

1. **Click Save** → Triggers image build
2. **Monitor Build:** Go to Builds → Active Build until completion
3. **Check Workers:** Ensure exactly 1 worker is "Running" on "Latest" release
4. **Clean Up:** Delete any "Outdated" workers (🗑️ button)

### **5. Verify Boot Sequence**

**Check Logs:** Workers → (...) → Logs

**✅ Success Boot Log:**
```
BOOT: starting in /app
SMOKE[A] ... SMOKE[D] ok  
BOOT: launching handler.py
--- Starting Serverless Worker | Version 1.7.13 ---
🔊 Booting Sesame RunPod worker...
📦 Model: sesame/csm-1b | Device: cuda | FP16: True
```

**On First Request:**
```
HF token present: True
🎤 Synthesizing: ...
BOOT[3] loading model...
Downloading (...)config.json: 100%
Model loaded successfully
```

### **6. Test the Endpoint**

**From your dev environment (Next.js running on :3001):**

```bash
curl -s 'http://localhost:3001/api/voice/sesame?provider=sesame-runpod&debug=1' \
  -H 'content-type: application/json' \
  -d '{"text":"Hello from Maya on Sesame"}' | jq .
```

**✅ Success Response:**
```json
{
  "success": true,
  "audioLength": 85000,  // > 50000 indicates real audio
  "isLikelyWAV": true,
  "provider": "sesame-runpod",
  "model": "sesame/csm-1b"
}
```

**📁 Check Generated Audio:** WAV file should be >100KB (not the 9KB fallback)

---

## 🛠️ Troubleshooting Guide

### **❌ Common Issues & Fixes**

| Problem | Symptoms | Solution |
|---------|----------|----------|
| **Token Permission Error** | `403 Forbidden`, `401 Unauthorized` | Fix HF token: Enable "Read access to contents of all public gated repos" |
| **Missing hf_transfer** | `hf_transfer not available` warning | Ensure `HF_HUB_ENABLE_HF_TRANSFER=0` is set |
| **Stale Build** | Old logs, wrong behavior | Bump `FORCE_REBUILD` to new value, Save, delete worker |
| **Tokenizer Error** | `untagged enum ModelWrapper` | Old handler deployed - force rebuild |
| **Small Audio Files** | 9KB WAV files | Model not loading - check token permissions |

### **🔍 Debug Steps**

1. **Check HF Token Scopes:**
   - Go to HuggingFace Settings → Access Tokens
   - Ensure "Read access to contents of all public gated repos you can access" is checked

2. **Force Fresh Build:**
   ```bash
   FORCE_REBUILD=force-7  # Increment number
   ```
   Save → Delete worker → New worker spawns

3. **Monitor Resource Usage:**
   - Check GPU memory in RunPod dashboard
   - L4: ~24GB should be sufficient
   - RTX 4090: ~24GB optimal

4. **Verify Model Download:**
   - First request should show download progress
   - Subsequent requests should be faster (cached)

---

## ✅ Final Deployment Checklist

- [ ] Endpoint shows "Running" with 1 worker on "Latest" release
- [ ] Logs show `Starting Serverless Worker | Version 1.7.13`
- [ ] Environment variables all set correctly
- [ ] HF token has proper repository access permissions
- [ ] First request triggers model download (or shows cached)
- [ ] Test curl returns large audio file (>50KB)
- [ ] Generated WAV files play actual speech (not silence)
- [ ] Response includes `audioLength > 50000` and `isLikelyWAV: true`

---

## 🌟 Production Optimization

### **Scaling Up:**
- **Workers:** Increase to 2-3 for higher throughput
- **Max Workers:** Set to 5-10 for production loads
- **GPU:** L4 provides best price/performance ratio

### **Monitoring:**
- Watch worker logs for errors
- Monitor response times (should be <10s for first request, <3s for subsequent)
- Check GPU utilization in RunPod dashboard

### **Cost Optimization:**
- Use Spot instances for development
- Scale workers based on traffic patterns
- Monitor GPU hours vs. requests ratio

---

## 🔗 Integration with Spiralogic Oracle

Once deployed, the Sesame TTS endpoint integrates seamlessly with the Oracle system:

- **Elemental Agents** use Sesame for voice synthesis
- **Dual-tone responses** delivered with Maya's voice personality
- **Real-time TTS** for immediate Oracle responses
- **Archetypal voice variations** through prompt engineering

The optimized Oracle system will automatically route voice synthesis through the RunPod endpoint, bringing Maya's voice to life across all elemental wisdom streams.

🔥🌊🌍💨✨ **Maya speaks with the voice of infinite wisdom.**