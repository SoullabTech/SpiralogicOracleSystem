# 🚀 Spiralogic Multimodal Beta Launch Guide

## 🛫 Preflight Checklist (2-3 minutes)

### Quick Environment Check
```bash
# Navigate to project
cd "/Volumes/T7 Shield/Projects/SpiralogicOracleSystem"

# Run preflight validation
chmod +x scripts/preflight-check.sh
./scripts/preflight-check.sh
```

### Critical Requirements
- ✅ Docker running with ports free (3000, 8080, 6379)
- ✅ Environment keys: `OPENAI_API_KEY`, `SUPABASE_URL`, `SERVICE_ROLE_KEY`
- ✅ Feature flags: `USE_CLAUDE=true`, `UPLOADS_ENABLED=true`, `BETA_BADGES_ENABLED=true`
- ✅ FFmpeg installed for audio transcription
- ✅ Supabase Storage bucket created with RLS enabled

## 🚀 Launch Sequence

### Step 1: Execute Launch
```bash
# Make scripts executable
chmod +x launch-multimodal-beta.sh
chmod +x scripts/golden-path-test.sh

# Run complete launch sequence
./launch-multimodal-beta.sh
```

### Step 2: Validation
```bash
# Run golden path tests
./scripts/golden-path-test.sh

# Start development server
npm run dev
```

## 🎯 Golden Path Demo (10 minutes)

### 1. Health Check
```bash
curl -s http://localhost:3000/api/admin/metrics?metric=overview | jq .
```

### 2. PDF Upload Test
1. **Upload**: Drop a 1-3 page PDF into Oracle chat
2. **Wait**: Processing indicator → "ready" status  
3. **Ask**: *"What are the key arguments in my PDF?"*
4. **Expect**: Oracle cites summary/themes + 📝 Scholar badge
5. **Verify**: Natural questions at end of response

### 3. Audio Upload Test  
1. **Upload**: Drop ≤90s voice memo
2. **Wait**: "Transcribing..." → context card appears
3. **Ask**: *"What did I say about forgiveness in my recording?"*
4. **Expect**: Transcript-aware response + 🎵 Voice Voyager badge

### 4. Image Upload Test
1. **Upload**: Drop image (screenshot, poster, drawing)
2. **Wait**: "Analyzing image..." → context card appears  
3. **Ask**: *"What themes or text stand out in this image?"*
4. **Expect**: Visual description + soft OCR + 🎨 Visionary badge

### 5. Multi-Modal Synthesis
1. **Ask**: *"How do these uploads connect to tell a story about my growth?"*
2. **Expect**: Cross-modal synthesis + Thread Weaver badge potential
3. **Verify**: Admin metrics update in real-time

### 6. System Health Check
```bash
# Check badges awarded
curl -s http://localhost:3000/api/beta/status | jq '.badges'

# Monitor bridge performance  
open http://localhost:3000/debug/bridge
```

**Expected**: Green heartbeat, p95 ≤ 350ms, dual-write ≥ 90%

## 📊 Admin Console Tour

### Key Endpoints to Monitor
- `/admin/overview` → Live engagement tiles
- `/admin/beta` → Badge distribution, recent events  
- `/admin/training` → Quality metrics (if ChatGPT Oracle 2.0 configured)
- `/admin/health` → Upload, transcription, embedding status

## 🧯 Common Issues & Fast Fixes

### PDF Processing Stuck
```javascript
// Fix ESM/CJS import issue
const pdfParse = (await import('pdf-parse')).default
```

### Audio Not Transcribing
- Check: `ffmpeg -version` works in container
- Verify: Audio file format supported
- Ensure: Environment exposed to container

### Terse Oracle Responses
```bash
# Verify these settings in .env.local
DEMO_PIPELINE_DISABLED=true
USE_CLAUDE=true  
ATTENDING_ENFORCEMENT_MODE=relaxed
```

### No Badges Appearing
```bash
# Check environment flags
UPLOADS_ENABLED=true
BETA_BADGES_ENABLED=true

# Verify badge system
curl -s http://localhost:3000/api/beta/badges | jq '.badges'
```

### Vision API Slow
- Already using `gpt-4o-mini` for speed
- Keep images < 6MB  
- Consider batch processing for multiple images

### Storage/CORS Issues
- Confirm Supabase URL and anon key correct
- Verify Storage bucket policies allow uploads
- Check RLS permissions are user-scoped

## 🎭 Beta Tester Experience Tips

### Natural Conversation Flow
1. **Start friendly**: "Hey Oracle..." (greeting should appear first turn)
2. **Ask lived questions**: *"I'm torn between safety and taking a leap—what do you hear?"*
3. **Use threading**: After 3 turns, tap "Weave a thread ↗︎"
4. **Verify memory**: Look for "Saved to Soul Memory" confirmation

### Multimodal Workflow
1. **Upload first, then ask**: Let processing complete before questioning
2. **Reference naturally**: *"Based on my document..."* or *"In that image..."*
3. **Compound queries**: *"How does my voice memo connect to the PDF themes?"*
4. **Badge progression**: Watch real-time badge unlocks

## 🚨 Rollback Procedure (Safe & Quick)

```bash
# Stop services
docker compose -f docker-compose.development.yml down

# Revert changes (if needed)
git stash  
git checkout -- .
git status  # confirm clean

# Disable multimodal (emergency)
# In .env.local:
UPLOADS_ENABLED=false
DEMO_PIPELINE_DISABLED=false
```

## 📈 Success Metrics

### Go/No-Go Criteria
- ✅ All golden path tests PASS
- ✅ PDF/Image/Audio processing < 30s each
- ✅ Oracle references upload content naturally
- ✅ Badges trigger on qualifying uploads  
- ✅ Response latency feels normal (≤ 3s)
- ✅ Bridge p95 ≤ 350ms, error rate ≈ 0%

### User Experience Validation
- ✅ Upload → processing → ready flow feels smooth
- ✅ Context cards appear automatically
- ✅ Oracle responses feel contextually aware
- ✅ Badge notifications provide satisfying feedback
- ✅ Admin metrics reflect real activity

## 🆘 Troubleshooting Support

If anything feels off, provide:
1. **URL/Step**: Which specific step failed
2. **Expected vs Actual**: What you expected vs what happened  
3. **Logs**: Last ~120 lines from frontend & backend logs
4. **Environment**: OS, Node version, Docker version

## 🌟 Launch Status

**SYSTEM READY FOR BETA TESTING**

The multimodal Oracle system is fully implemented with:
- 📄 PDF text extraction & semantic search
- 🖼️ Image descriptions & OCR processing  
- 🎵 Audio transcription & analysis
- 🏅 Progressive badge system
- 🤖 Contextually-aware conversations
- 🛡️ Privacy-preserving processing
- 📊 Real-time admin monitoring

**Ready to invite beta testers for truly multimodal, memory-aware spiritual guidance!** ✨