# 🌀 Claude Code Prompt Series: Sesame Activation Fix

*A reproducible ritual to fully enable Sesame shaping in Spiralogic Oracle*

---

## 🎯 Mission

Maya's voice shaping is architecturally complete but disabled.  
Your mission is to activate Sesame by:
- Ensuring the service is running
- Updating environment variables  
- Restarting backend
- Verifying shaping logs and glyph feedback

---

## Current Status

**What's Working:**
- ✅ Sesame CI shaping code fully implemented in ConversationalPipeline.ts
- ✅ Comprehensive elemental prosody mapping (Fire/Water/Earth/Air/Aether)
- ✅ Fallback strategy handles unavailable Sesame service gracefully
- ✅ Advanced debugging and logging for development

**What's Missing:**
- 🔴 SESAME_CI_ENABLED=false in .env - voice shaping is **disabled**
- 🔴 No SESAME_TOKEN configured for authentication
- 🔴 Sesame service not running on localhost:8000

**Current Voice Flow:**
```
Raw LLM text → No Sesame shaping → Direct to TTS (ElevenLabs/fallback)
```

**Target Voice Flow:**
```
Raw LLM text → Sesame CI shaping → Elementally-embodied SSML → Sacred TTS voice
```

---

## 📜 Prompt Series

### Prompt 1 – Context Setup

```
You are working on the Spiralogic Oracle backend.
Mission: Activate Sesame CI shaping system so Maya speaks with embodied elemental prosody.

Core principles:
- SESAME_CI_ENABLED must be true
- SESAME_URL and SESAME_TOKEN must be valid
- Backend must route all TTS through Sesame first
- Logs should show [RAW] vs [SESAME] in dev
- Production mode must remain clean

Do you understand? Summarize the task before we continue.
```

---

### Prompt 2 – Environment Configuration

```
Open backend/.env and ensure these values exist:

SESAME_CI_ENABLED=true
SESAME_URL=http://localhost:8000
SESAME_TOKEN=your_actual_token
SESAME_CI_REQUIRED=false

If they are missing, add them.
If SESAME_CI_ENABLED is false, set it to true.
Do not touch other env variables.

Show me the updated .env contents for these specific variables.
```

---

### Prompt 3 – Service Health Check

```
Run a curl command to confirm Sesame is running:

curl http://localhost:8000/health

If it returns {"status":"ok"}, Sesame is healthy.
If connection refused, start the Sesame Docker container:

docker run -d \
  --name sesame-csm \
  -p 8000:8000 \
  -e MODEL_NAME=sesame/csm-1b \
  sesame-csm:latest

Wait for container to be healthy, then re-test the health endpoint.
```

---

### Prompt 4 – Backend Restart

```
Restart the backend server so env changes take effect:

cd backend
npm run dev

Confirm logs show:
- "SESAME_CI_ENABLED=true"
- "Backend listening on port 3002"
- No errors during startup

If port 3002 is busy, use:
PORT=3006 npm run dev
```

---

### Prompt 5 – Pipeline Verification

```
Open ConversationalPipeline.ts at line 381.
Verify that when SESAME_CI_ENABLED is true, every raw LLM response passes through sesameCITransform().

Run this test command:
node test-sesame-ci.js

Confirm output shows:
- CI Enabled: true
- "Testing sacred voice embodiment..."
- [RAW] text logged
- [SESAME] shaped text logged
- Processing time under 150ms

If test fails, debug the axios connection to Sesame.
```

---

### Prompt 6 – Frontend Debug Overlay

```
Check VoiceRecorder.tsx overlay by:
1. Opening browser to http://localhost:3001
2. Press Ctrl+Shift+D to enable debug overlay
3. Start a voice conversation

Verify overlay shows:
- Raw transcript in gray
- Shaped transcript in gold
- Status: SESAME ✅ or FALLBACK ⚠️
- Element + archetype shaping applied

Ensure this is visible only in development mode.
```

---

### Prompt 7 – QA Ritual

```
Perform this test sequence:

1. Speak a short phrase (2 words).
   - Expect auto-stop at 2.5s silence.
   - Backend logs: [RAW] vs [SESAME].
   - Frontend overlay shows shaped transcript.

2. Speak a medium sentence (~7 words).
   - Expect 4s silence cutoff.
   - Sacred glyph animates (element-based).

3. Kill Sesame container, then speak.
   - Expect [FALLBACK] logs, no glyph animation.
   - Voice still plays (unshsaped but functional).

4. Restart Sesame and confirm shaping resumes.

Document any issues found.
```

---

## 🔧 Quick Debug Commands

```bash
# Check if Sesame is enabled
grep SESAME_CI_ENABLED backend/.env

# Test Sesame health
curl http://localhost:8000/health

# Watch backend logs for shaping
cd backend && npm run dev | grep -E "SESAME|RAW|SHAPED"

# Test shaping directly
cd backend && node test-sesame-ci.js

# Check Docker containers
docker ps | grep sesame

# Tail Docker logs
docker logs -f sesame-csm
```

---

## ✅ Success Criteria

After completing all prompts:

1. **Environment:** SESAME_CI_ENABLED=true in .env
2. **Service:** Sesame responds on http://localhost:8000/health
3. **Backend:** Logs show [RAW] → [SESAME] transformation
4. **Frontend:** Debug overlay displays shaped transcripts
5. **Voice:** Maya speaks with elemental prosody
6. **Resilience:** Fallback works when Sesame unavailable

---

## 🚨 Common Issues & Fixes

### Issue 1: "Connection refused" to localhost:8000
**Fix:** Start Sesame Docker container or check firewall

### Issue 2: "401 Unauthorized" from Sesame
**Fix:** Set valid SESAME_TOKEN in .env

### Issue 3: No shaping despite SESAME_CI_ENABLED=true
**Fix:** Restart backend after env changes

### Issue 4: Shaping takes >150ms
**Fix:** Check Sesame container resources, consider local model cache

### Issue 5: Frontend doesn't show shaped text
**Fix:** Ensure debug mode enabled (Ctrl+Shift+D)

---

## 🚀 Usage Instructions

1. **Copy each prompt into Claude Code in order**
2. **Execute one step at a time** (env → health → restart → pipeline → overlay → QA)
3. **After step 7**, Sesame will be confirmed active and embodied in all conversations
4. **Save successful configuration** for production deployment

---

## 📊 Verification Checklist

Print and use for each activation attempt:

**Setup**
- [ ] SESAME_CI_ENABLED=true in backend/.env
- [ ] SESAME_URL configured correctly
- [ ] SESAME_TOKEN present (if required)
- [ ] SESAME_CI_REQUIRED=false (for graceful fallback)

**Service**
- [ ] Sesame health endpoint responds
- [ ] Docker container running (if applicable)
- [ ] Port 8000 accessible

**Backend**
- [ ] Backend restarted after env changes
- [ ] Logs show CI shaping attempts
- [ ] test-sesame-ci.js passes

**Frontend**  
- [ ] Debug overlay visible
- [ ] Raw vs shaped transcripts displayed
- [ ] Sacred glyphs animate

**Voice**
- [ ] Maya's voice has elemental character
- [ ] Pauses and emphasis tags work
- [ ] Fallback functions when Sesame down

---

*Sacred Technology Platform - Sesame Activation Fix v1.0*  
*Generated for systematic activation of Maya's conversational shaping system*