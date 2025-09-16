# 🎙️ Sesame CSM Production Runbook
**Get Real Sesame Voice Online in 15 Minutes**

---

## 🎯 **Priority 1: Real Sesame CSM (Not Mock)**

Right now Maya is using a **mock Sesame server**. This runbook gets the **real CSM model** running so you have true conversational speech with context awareness.

---

## 🚀 **Step 1: Immediate Offline Deployment (5 minutes)**

This gets Sesame running locally with cached models - no external dependencies.

### **1.1 Run the Setup Script**
```bash
# Navigate to project root
cd /Volumes/T7\ Shield/Projects/SpiralogicOracleSystem

# Run the comprehensive offline setup
./backend/scripts/setup-sesame-offline.sh
```

**What this does:**
- ✅ Downloads `facebook/blenderbot-1B-distill` model locally
- ✅ Builds Docker image with CUDA support  
- ✅ Creates offline-ready configuration
- ✅ Tests the deployment end-to-end
- ✅ Updates `.env.local` with offline settings

### **1.2 Verify the Setup**
```bash
# Check if Sesame container is running
docker ps | grep sesame-csm

# Test the health endpoint
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","model_loaded":true,"engine":"sesame"}
```

### **1.3 Start the Full Stack**
```bash
# This now auto-detects offline mode and uses real Sesame
./scripts/start-beta.sh
```

**Expected Output:**
```
🎤 Checking Sesame CSM Server...
🔍 Offline setup detected, defaulting to offline mode
✅ Sesame server already running (detected mock or real server)
✅ Sesame model loaded and ready
```

---

## 🔧 **Step 2: Verify Real Voice Generation (2 minutes)**

### **2.1 Test Via Voice Engine Status**
- Open http://localhost:3000/oracle  
- Look for the **voice engine indicator** in the top right
- Should show: 🟢 **Sesame Local**
- Click **Test Voice** button in voice controls

### **2.2 Test Via API**
```bash
# Test the enhanced voice API with real text
curl -X POST http://localhost:3000/api/voice/unified \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello! I am Maya, powered by real Sesame CSM. This is not a mock server.",
    "voiceEngine": "auto",
    "fallbackEnabled": true
  }'
```

**Success Response:**
```json
{
  "success": true,
  "engine": "sesame",
  "model": "facebook/blenderbot-1B-distill",
  "processingTimeMs": 1247,
  "fallbackUsed": false,
  "audioData": "base64-encoded-audio...",
  "metadata": {
    "engineAttempts": ["sesame-success"]
  }
}
```

---

## 🩺 **Step 3: Troubleshooting (if needed)**

### **3.1 Container Issues**
```bash
# If container failed to start
docker logs sesame-csm

# Common fixes:
# - Insufficient disk space (need 2GB+)
# - Port 8000 already in use: sudo lsof -i :8000
# - GPU issues: Check nvidia-smi or use CPU mode
```

### **3.2 Model Loading Issues**
```bash
# Check if models were downloaded
ls -la backend/models/sesame/

# Re-download if missing
cd backend/models/sesame
wget https://huggingface.co/facebook/blenderbot-1B-distill/resolve/main/config.json
```

### **3.3 Voice API Issues** 
```bash
# Check voice router logs
tail -f backend/backend.log | grep VoiceRouter

# Should show:
# [VoiceRouter:abc123] 🎤 Starting voice synthesis
# [VoiceRouter:abc123] ✅ Sesame synthesis successful (1200ms)
```

---

## 📊 **Step 4: Monitoring & Validation (3 minutes)**

### **4.1 Real-Time Status**
- Voice engine indicator shows: 🟢 **Sesame Local**  
- Response times: **< 2 seconds** for typical queries
- No fallbacks to HuggingFace or ElevenLabs
- Console shows: `✅ Sesame succeeded (XXXms)`

### **4.2 Performance Benchmarks**
```bash
# Quick performance test
curl -w "@curl-format.txt" -X POST http://localhost:8000/api/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"text":"Performance test"}'

# Expected timing: < 2 seconds total
```

### **4.3 Full Conversation Test**
- Go to http://localhost:3000/oracle
- Ask: "Maya, speak to me using your real voice"
- Should hear: Natural speech, not robotic TTS
- Voice engine status: **Sesame Local (active)**

---

## 🔄 **Alternative: Cloud Deployment (if local fails)**

If local deployment has issues, deploy to cloud:

### **Option A: Northflank (Recommended)**
1. Fork: https://github.com/SesameAILabs/csm
2. Deploy to Northflank with environment:
   ```
   MODEL_NAME=facebook/blenderbot-1B-distill
   API_KEY=your-secure-key
   PORT=8000
   ```
3. Update `.env.local`:
   ```env
   SESAME_URL=https://your-csm.northflank.app/api/v1/generate
   SESAME_API_KEY=your-secure-key
   SESAME_MODE=online
   ```

### **Option B: Use HuggingFace Inference (Immediate)**
```bash
# Validate your token first
./backend/scripts/validate-hf-token.sh

# Force HuggingFace mode in .env.local
echo "SESAME_MODE=online" >> .env.local
echo "SESAME_FALLBACK_ENABLED=true" >> .env.local
```

---

## ✅ **Success Criteria**

You'll know Sesame CSM is working when:

1. **🟢 Status Indicator**: Shows "Sesame Local" 
2. **⚡ Performance**: Voice generation < 2 seconds
3. **🎤 Audio Quality**: Natural speech, not robotic
4. **📝 Logs**: Console shows `✅ Sesame succeeded (XXXms)`
5. **🚫 No Fallbacks**: No ElevenLabs or HuggingFace usage
6. **💾 Offline**: Works without internet connection

---

## 🎯 **Next Steps (Priority 2)**

Once Sesame is working:
1. **Test Supabase**: `curl -s $SUPABASE_URL/rest/v1/ | jq .`
2. **Fix persistence** if needed (new project or DNS fix)
3. **Add monitoring** for production reliability

---

**🚨 If you hit any issues, this runbook has solutions for the 3 most common problems:**
- Docker/container issues
- Model download problems  
- API routing failures

**Time to completion: 15 minutes max** ⏰