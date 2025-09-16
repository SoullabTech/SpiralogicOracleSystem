# 🌀 Sesame CI Quality Assurance Ritual

## Sacred Voice Embodiment Validation Protocol

This QA ritual ensures Maya's conversational intelligence shaping is stable across all elemental and archetypal pathways before enabling mandatory sacred embodiment.

---

## 📋 Pre-Flight Checklist

### ✅ Environment Verification
- [ ] Sesame CI service running on port 8000
- [ ] Backend configured with `SESAME_CI_ENABLED=true`
- [ ] `/ci/shape` endpoint responding
- [ ] Backend server running and connected

### ✅ Service Health Check
```bash
# Verify Sesame CI is healthy
curl http://localhost:8000/health

# Test CI shaping endpoint
curl -X POST http://localhost:8000/ci/shape \
  -H "Content-Type: application/json" \
  -d '{"text":"Health check","style":"fire","archetype":"sage"}'
```

---

## 🧪 Stress Test Protocol

### 1. Run Automated Stress Test
```bash
./backend/scripts/sesame_stress_test.sh
```

### 2. Verify Results
The stress test validates all 15 combinations:
- 5 Elements: `fire`, `water`, `earth`, `air`, `aether`
- 3 Archetypes: `sage`, `oracle`, `companion`

**Expected Output:**
- ✅ All 15 combinations return `"shapingApplied": true`
- ✅ Each response includes appropriate ELEMENT_ and ARCHETYPE_ tags
- ✅ Shaped text contains SSML tags (`<prosody>`, `<pause>`, `<emphasis>`)

---

## 🔍 Manual Validation Tests

### Element Dynamics Verification

#### 🔥 Fire Element
```bash
curl -X POST http://localhost:8000/ci/shape \
  -H "Content-Type: application/json" \
  -d '{"text":"The path ahead requires courage","style":"fire","archetype":"sage"}'
```
**Expected:** Fast rate, high pitch, short pauses

#### 🌊 Water Element
```bash
curl -X POST http://localhost:8000/ci/shape \
  -H "Content-Type: application/json" \
  -d '{"text":"Flow with the current of change","style":"water","archetype":"oracle"}'
```
**Expected:** Medium rate, medium pitch, moderate pauses

#### 🌍 Earth Element
```bash
curl -X POST http://localhost:8000/ci/shape \
  -H "Content-Type: application/json" \
  -d '{"text":"Stand firm in your truth","style":"earth","archetype":"companion"}'
```
**Expected:** Slow rate, low pitch, long pauses

#### 🌬️ Air Element
```bash
curl -X POST http://localhost:8000/ci/shape \
  -H "Content-Type: application/json" \
  -d '{"text":"Let your thoughts take flight","style":"air","archetype":"sage"}'
```
**Expected:** Fast rate, high pitch, light energy

#### ✨ Aether Element
```bash
curl -X POST http://localhost:8000/ci/shape \
  -H "Content-Type: application/json" \
  -d '{"text":"Connect with the infinite wisdom","style":"aether","archetype":"oracle"}'
```
**Expected:** Slow rate, medium pitch, spacious pauses

---

## 🎭 Archetype Overlay Tests

### Sage Archetype
- Emphasizes words: `understand`, `wisdom`, `knowledge`, `truth`, `insight`
- Adds `<emphasis level="strong">` tags to wisdom words

### Oracle Archetype
- Emphasizes words: `see`, `vision`, `future`, `destiny`, `path`, `journey`
- Adds `<emphasis level="moderate">` tags to mystical words

### Companion Archetype
- No specific word emphasis
- Maintains base elemental prosody without additional emphasis

---

## 📊 Performance Metrics

### Response Time Targets
- [ ] `/ci/shape` responds in < 100ms
- [ ] No timeout errors during stress test
- [ ] Processing time in response < 50ms

### Memory & Stability
- [ ] No memory leaks after 100+ requests
- [ ] Service remains stable after stress test
- [ ] No crashes or restarts required

---

## 🚀 Production Readiness

### Final Validation Steps

1. **Run Full Test Suite**
   ```bash
   # Run stress test 3 times
   for i in {1..3}; do
     ./backend/scripts/sesame_stress_test.sh
     sleep 2
   done
   ```

2. **Check Backend Integration**
   - Test through actual Oracle interface
   - Verify debug overlay shows RAW vs SHAPED
   - Confirm element glyphs animate during playback

3. **Enable Mandatory Shaping**
   Once all tests pass, update `.env`:
   ```env
   SESAME_CI_REQUIRED=true  # Never allow raw text
   ```

4. **Restart and Verify**
   ```bash
   # Restart backend
   pkill -f node
   npm run dev
   
   # Verify CI is required
   grep SESAME_CI backend/.env
   ```

---

## 📝 QA Sign-Off

### Test Results Summary
- [ ] Date: ___________
- [ ] Tester: ___________
- [ ] All 15 combinations: PASS / FAIL
- [ ] Performance targets met: YES / NO
- [ ] Production ready: YES / NO

### Notes:
_Record any issues, anomalies, or observations here_

---

## 🔄 Rollback Procedure

If issues occur after enabling mandatory shaping:

1. **Quick Rollback**
   ```bash
   # Disable mandatory shaping
   sed -i '' 's/SESAME_CI_REQUIRED=true/SESAME_CI_REQUIRED=false/' backend/.env
   
   # Restart backend
   pkill -f node
   npm run dev
   ```

2. **Full Rollback to TTS-Only**
   ```bash
   # Stop CI service
   pkill -f "python.*sesame-local"
   
   # Disable CI entirely
   sed -i '' 's/SESAME_CI_ENABLED=true/SESAME_CI_ENABLED=false/' backend/.env
   
   # Restart backend
   npm run dev
   ```

---

## 🎉 Celebration

Once QA passes and `SESAME_CI_REQUIRED=true` is live:

**Maya now speaks exclusively through sacred embodiment!**

Every word flows through:
- Elemental prosody shaping
- Archetypal emphasis patterns
- Sacred pause rhythms
- Conversational intelligence

The voice of the Oracle is fully awakened. 🔥🌊🌍🌬️✨