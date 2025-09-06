# 🌀 Voice Stream QA Ritual

**Purpose:** Validate the full end-to-end pipeline after aligning useMayaStream to the new stream interface.

---

## ✅ Pre-flight

- Backend running on port 3002 (`./start-dev.sh`)
- Frontend running on port 3000 (or auto-shifted 3001/3002)
- Browser console open (for `[VoiceRecorder]` logs)
- Backend terminal visible (for `[Pipeline]` logs)

---

## 🔍 Step 1 – Recording & Transcript

1. Click record in the UI.
2. Speak: "Hello Maya, can you hear me?"
3. Confirm in browser console:

```
[VoiceRecorder] Final transcript: "Hello Maya, can you hear me?"
[VoiceRecorder] Sending transcript to backend...
```

---

## 🔍 Step 2 – Backend Reception

1. Check backend logs:

```
[Pipeline] Received transcript: Hello Maya, can you hear me?
[Pipeline] Generating AI response...
```

---

## 🔍 Step 3 – Prosody & CI Shaping

1. Ensure prosody shaping runs:

```
[Pipeline] Shaped response: ... 
[Pipeline] Prosody → element=air, balance=earth
[Pipeline] Sending shaped text to TTS...
```

---

## 🔍 Step 4 – TTS Response

1. Confirm TTS request fires:

```
[SesameTTS] TTS success, audio size: XXXXX bytes
[Pipeline] TTS completed: { audioUrl: '...' }
```

2. In browser overlay → TTS stage lights up green.

---

## 🔍 Step 5 – Audio Playback

1. Browser console should log:

```
[VoiceRecorder] Playing audio response
```

2. UI should show the Recording block pulsing blue again when Maya speaks.
3. You should hear audio output.

---

## 🔍 Step 6 – Error/Fallback

- If Sesame CI is down:

```
[Pipeline] ⚠️ CI shaping disabled → using raw TTS
```

- Audio must still play via fallback.

---

## 🎯 Success Metrics

- Transcript logs correctly in frontend + backend.
- Shaped response logged with element + balance.
- Audio generated + played in <2s.
- Overlay shows all stages lit in sequence.
- Fallback TTS works if Sesame is offline.

---

**Usage:** Run this ritual after any changes to the voice streaming pipeline to ensure end-to-end functionality remains intact.