# 🎤 Voice Pipeline QA Ritual

## Purpose
Complete validation of Maya's voice pipeline: record → transcript → AI response → prosody shaping → CI shaping → TTS → audio playback.

## Prerequisites
- Frontend running on port 3000
- Backend running on port 3002  
- Sesame CI on port 8000 (optional)
- Browser developer console open
- Debug overlay visible (bottom-right corner)

---

## 🔍 Test Scenarios

### 1. Short Phrase Test (2.5s silence detection)
**Input**: "Hello Maya"

**Expected Console Logs**:
```
[VoiceRecorder] Final transcript: Hello Maya
[VoiceRecorder] Sending transcript to backend: Hello Maya
[Pipeline] Received transcript: Hello Maya
[Pipeline] Generating AI response...
[Pipeline] Draft response generated: [response]...
[Pipeline] Formatted for Maya with prosody hints
[Pipeline] Calling Sesame CI /ci/shape... (or Skipping CI shaping)
[Pipeline] Shaped response: [shaped text]...
[Pipeline] Sending shaped text to TTS...
[SesameTTS] TTS input: [text]...
[SesameTTS] TTS success, audio size: [bytes] bytes
[Pipeline] TTS completed: { audioUrl: 'Generated', ttsSeconds: X.X }
[VoiceRecorder] Backend response: [data]
```

**Debug Overlay Shows**:
- ✓ Voice Recording
- ✓ Pipeline Received
- ✓ AI Drafting  
- ✓ Prosody Shaping
- ✓ Sesame CI Shaping (if enabled)
- ✓ TTS Generation

---

### 2. Long Thought Test (6s silence detection)
**Input**: "I've been reflecting on the nature of consciousness and wondering about..."

**Expected Behavior**:
- Adaptive silence timeout ~6s for longer speech
- All pipeline steps complete as above
- Audio response plays after processing

**Console Markers**:
```
🔇 [VoiceRecorder] Silence detected - starting 6s (long) countdown
⏹️ [VoiceRecorder] Auto-stopping after 6s long silence
```

---

### 3. CI Enabled Test
**Setup**: `SESAME_CI_ENABLED=true` in `.env.local`

**Expected Logs**:
```
[Pipeline] Calling Sesame CI /ci/shape...
[SesameCI] Input for shaping: { text: ..., element: ..., archetype: ... }
[SesameCI] Calling /ci/shape endpoint: http://localhost:8000/ci/shape
[SesameCI] Payload: { ... }
[SesameCI] Response received: { status: 200, hasData: true }
[SesameCI] Shaping successful: [shaped text]...
```

---

### 4. CI Disabled Test  
**Setup**: `SESAME_CI_ENABLED=false` in `.env.local`

**Expected Logs**:
```
[Pipeline] Skipping CI shaping, SESAME_CI_ENABLED=false
```
- Pipeline continues without CI shaping step
- TTS still generates audio from unshaped text

---

### 5. Sesame Down Fallback Test
**Setup**: Stop Sesame container (`docker stop sesame-csm`)

**Expected Behavior**:
```
[SesameTTS] TTS synthesis failed: [error]
[SesameTTS] Falling back to direct ElevenLabs
```
- Audio still generates via fallback service
- Debug overlay shows TTS step with longer duration

---

### 6. Mock Supabase Mode Test
**Setup**: `MOCK_SUPABASE=true` via `./toggle-supabase.sh`

**Expected Logs**:
```
⚡ [SUPABASE] Mode: MOCK (stubbing DB calls)
   → No database writes, voice pipeline unblocked
```
- Voice pipeline works without database dependencies
- No persistence errors in console

---

## 📊 Debug Overlay Features

Located at **bottom-right corner** when in development mode:

### Visual Pipeline Steps
- **○** Pending (gray)
- **●** Active (yellow, pulsing)
- **✓** Completed (green)
- **✗** Error (red)

### Data Display
- **Transcript**: Shows first 100 chars of speech
- **Shaped Response**: Shows prosody-enhanced text
- **Audio Status**: ✓ Generated or ✗ Failed
- **Step Duration**: Time in ms for each step

### Controls
- **Expand/Collapse**: Click header to toggle
- **Clear**: Reset debug state between tests

---

## ✅ Success Criteria

### All Systems Go
- [ ] Voice recording captures speech correctly
- [ ] Transcript appears in console within 1-2s
- [ ] AI response generates without errors
- [ ] Prosody shaping applies (if CI enabled)
- [ ] TTS generates audio URL
- [ ] Audio plays in browser
- [ ] Debug overlay shows all steps green
- [ ] No error logs in console

### Performance Targets
- Voice → Transcript: < 2s
- Transcript → AI Response: < 3s  
- AI Response → TTS: < 2s
- Total pipeline: < 7s for short phrases

---

## 🚨 Common Issues & Fixes

### Issue: No transcript appears
**Fix**: Check microphone permissions in browser

### Issue: [Pipeline] logs missing
**Fix**: Verify backend is running on port 3002

### Issue: TTS fails with 404
**Fix**: Check Sesame is running on port 8000

### Issue: Audio doesn't play
**Fix**: Click anywhere on page to unlock audio context

### Issue: Debug overlay not visible
**Fix**: Ensure `NODE_ENV=development` is set

---

## 🔧 Quick Commands

```bash
# Start all services
./start-dev.sh

# Toggle mock/real Supabase
./toggle-supabase.sh

# Check Sesame status
curl http://localhost:8000/health

# Watch backend logs
tail -f backend/logs/*.log

# Clear browser console
Cmd+K (Mac) / Ctrl+L (Windows)
```

---

## 📝 Test Checklist

### Basic Flow
- [ ] Record → Transcript works
- [ ] Transcript → AI Response works
- [ ] AI Response → TTS works
- [ ] Audio playback works

### Adaptive Features
- [ ] Short phrases stop at ~2.5s silence
- [ ] Long thoughts allow ~6s silence
- [ ] 8s safety cutoff triggers

### Resilience
- [ ] Works with CI disabled
- [ ] Falls back when Sesame down
- [ ] Handles mock Supabase mode

### Debug Tools
- [ ] Console logs appear for each step
- [ ] Debug overlay updates in real-time
- [ ] Step durations are reasonable

---

## 🎯 Next Steps After QA

If all tests pass:
1. Maya's voice pipeline is production-ready
2. Consider disabling debug logs for production
3. Document any custom prosody patterns discovered

If issues found:
1. Check specific step that fails in debug overlay
2. Review corresponding service logs
3. Test that component in isolation

---

**Last Updated**: 2025-09-05
**Pipeline Version**: Sesame CI + Adaptive Prosody + Sacred Voice Embodiment