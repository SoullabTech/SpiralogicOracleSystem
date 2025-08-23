# Manual Beta Test - Copy & Paste Commands

## 🚦 Prep (One Time Setup)

### 1. Start Stack
```bash
cd "/Volumes/T7 Shield/Projects/SpiralogicOracleSystem"
export DCYML=docker-compose.development.yml
docker compose -f "$DCYML" up --build
```

### 2. Verify Services
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080/api/soul-memory/health

### 3. Environment Variables (Already Set)
✅ `USE_CLAUDE=true`
✅ `DEMO_PIPELINE_DISABLED=true`
✅ `ATTENDING_ENFORCEMENT_MODE=relaxed`
✅ `TURN_MIN_SENTENCES=4`
✅ `TURN_MAX_SENTENCES=12`
✅ `MAYA_FORCE_NAME=Kelly`
✅ `MAYA_GREETING_TONE=casual-wise`

---

## 🧪 Round 1: Greeting + Conversational Depth

**Goal**: Warm "Hey Kelly…" greeting appears once; response is 4–12 sentences with 1–2 natural questions.

### First Turn (Should Greet)
```bash
curl -s -X POST "http://localhost:3000/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"I am not sure what is next for me."},"conversationId":"c-greet"}' \
  | jq -r '.response.text'
```

**Expect**: 
- Starts with "Hey Kelly, let's take this one layer at a time..." or similar
- 4–12 sentences, modern/warm tone
- Ends with 1–2 natural questions

### Follow-up Turn (No Greeting)
```bash
curl -s -X POST "http://localhost:3000/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"I am torn between two options."},"conversationId":"c-greet"}' \
  | jq -r '.response.text'
```

**Expect**: No greeting, still conversational

---

## 🧪 Round 2: Tone Adaptation

**Goal**: Auto-tone from archetype/threshold signals; still conversational.

### Seeker Cue
```bash
curl -s -X POST "http://localhost:3000/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"I keep circling a big question and I am curious where it leads."},"conversationId":"c-tones"}' \
  | jq -r '.response.text'
```

### Warrior Cue
```bash
curl -s -X POST "http://localhost:3000/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"I finally drew a boundary at work and it was hard but right."},"conversationId":"c-tones"}' \
  | jq -r '.response.text'
```

### Threshold Cue
```bash
curl -s -X POST "http://localhost:3000/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"I am standing at a big life change and it feels real."},"conversationId":"c-tones"}' \
  | jq -r '.response.text'
```

**Expect**: Subtle tone shift (curiosity/courage/doorway energy), not mystical or stiff.

---

## 🧪 Round 3: Validator Relaxation Check

**Goal**: Allow 1–2 invites when input is vague; enforce 4–12 sentences.

### Vague Input
```bash
curl -s -X POST "http://localhost:3000/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"Honestly I do not even know what to say."},"conversationId":"c-validate"}' \
  | jq -r '.response.text'
```

**Expect**:
- Still 4–12 sentences
- May include two gentle questions (since input is vague)
- Natural phrasing (no "As an AI…")

---

## 🧪 Round 4: Thread Conversation

**Goal**: See conversational continuity across multiple turns.

### Turn 1
```bash
curl -s -X POST "http://localhost:3000/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"I am stretched thin but excited about what is coming."},"conversationId":"c-thread"}' \
  | jq -r '.response.text'
```

### Turn 2
```bash
curl -s -X POST "http://localhost:3000/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"I said yes to too much again and I am trying to reset."},"conversationId":"c-thread"}' \
  | jq -r '.response.text'
```

### Turn 3
```bash
curl -s -X POST "http://localhost:3000/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"I want a steadier rhythm without losing momentum."},"conversationId":"c-thread"}' \
  | jq -r '.response.text'
```

**Expect**: Conversational continuity, building understanding across turns.

---

## 🧪 Round 5: System Health Checks

### Soul Memory Health
```bash
curl -s "http://localhost:8080/api/soul-memory/health" | jq .
```

### Latest Memory Record
```bash
curl -s "http://localhost:8080/api/soul-memory/memories" | jq '.[-1].metadata.ain_id'
```

### Bridge Health UI
Visit: http://localhost:3000/debug/bridge
**Expect**: Green heartbeat, p95 ≤ 350ms

---

## 🧪 Round 6: Debug Metadata Check

```bash
curl -s -X POST "http://localhost:3000/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"debug check"},"debug":true,"conversationId":"c-debug"}' \
  | jq '.metadata.pipeline'
```

**Expected Debug Output**:
```json
{
  "demoDisabled": true,
  "claudePrimary": true,
  "greetingEnabled": true,
  "greetingApplied": true,
  "greetingText": "Hey Kelly, let's take this one layer at a time.",
  "validationMode": "relaxed",
  "sentenceLimits": {
    "min": 4,
    "max": 12
  }
}
```

---

## 🧯 Quick Fixes If Something's Off

### Too Short/Pithy
```bash
# Confirm environment
echo $USE_CLAUDE
echo $DEMO_PIPELINE_DISABLED
```

### No Greeting
```bash
# Check name override
echo $MAYA_FORCE_NAME
echo $MAYA_GREETING_TONE
```

### Greeting Repeats
- Make sure you reuse the same `conversationId` for follow-up turns

### Bridge Slow
```bash
# Temporarily disable sync enrichment
export SOUL_MEMORY_ENRICH_SYNC=false
```

### Restart Stack
```bash
docker compose -f docker-compose.development.yml down
docker compose -f docker-compose.development.yml up --build
```

---

## 🎯 Success Criteria

✅ **Greeting Applied**: First turn starts with "Hey Kelly..." 
✅ **No Repetition**: Follow-up turns don't repeat greeting
✅ **Conversational Length**: 4-12 sentences (not terse)
✅ **Modern Tone**: Sounds like wise friend, not clinical coach
✅ **Question Flow**: 1-2 natural questions per response
✅ **Tone Adaptation**: Responds to seeker/warrior/threshold cues

---

## 🚀 Admin Dashboards

- **Overview**: http://localhost:3000/admin/overview
- **Health Matrix**: http://localhost:3000/admin/health  
- **Canary Tests**: http://localhost:3000/admin/canary

**Expect**: Most tiles green/amber (dev acceptable), metrics increment as you chat.

---

When you've run these tests, note which step didn't match expectations and share the response - we can pinpoint exactly what needs adjustment! 🎯