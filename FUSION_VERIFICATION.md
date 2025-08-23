# Memory & Intelligence Fusion Verification Guide

## 🚀 Quick Verification Commands

### 1. Start Development Environment
```bash
# Ensure containers are rebuilt with new environment
docker compose -f docker-compose.development.yml up --build

# Or if using local development
npm run dev
```

### 2. Context Pack Test
```bash
curl -s -X POST http://localhost:3000/api/debug/context \
  -H 'content-type: application/json' \
  -d '{"text":"I am split between safety and a big leap","userId":"u_demo"}' | jq
```

**Expected Response:**
```json
{
  "ain": 0,
  "soul": 0, 
  "facetKeys": 6,
  "nlu": {...},
  "psi": true,
  "micropsi": {
    "driveVector": {
      "clarity": 0.6,
      "safety": 0.7,    // Higher due to "safety" in text
      "agency": 0.55,
      "connection": 0.5,
      "meaning": 0.55
    },
    "affect": {
      "valence": 0.4,   // Lower due to internal conflict
      "arousal": 0.6,   // Higher due to decision stress
      "confidence": 0.75
    },
    "modulation": {
      "temperature": 0.74,  // Higher due to arousal
      "depthBias": 0.55,
      "inviteCount": 1
    }
  }
}
```

### 3. Turn with MicroPsi Influence
```bash
curl -s -X POST http://localhost:3000/api/oracle/turn \
  -H 'content-type: application/json' \
  -d '{"input":{"text":"I feel wired and stressed—too many deadlines"},"conversationId":"c-mp"}' | jq '.metadata.micropsi,.response.text'
```

**Expected Response:**
- Higher temperature in modulation (0.75+)
- 4-12 sentence response with calming tone
- 1-2 natural questions at the end
- metadata.micropsi showing drive vector and modulation

### 4. Conversational Feel Spot-Check

**Grounded Uncertainty:**
```bash
curl -s -X POST http://localhost:3000/api/oracle/turn \
  -H 'content-type: application/json' \
  -d '{"input":{"text":"I am not sure what is next and that is making me restless"},"conversationId":"c1"}' | jq -r '.response.text'
```

**High Arousal (should calm/structure):**
```bash
curl -s -X POST http://localhost:3000/api/oracle/turn \
  -H 'content-type: application/json' \
  -d '{"input":{"text":"Deadlines everywhere, my chest is tight and I cannot focus"},"conversationId":"c2"}' | jq -r '.response.text'
```

**Meaning Drive (should deepen):**
```bash
curl -s -X POST http://localhost:3000/api/oracle/turn \
  -H 'content-type: application/json' \
  -d '{"input":{"text":"I want my work to matter more but I am afraid to change"},"conversationId":"c3"}' | jq -r '.response.text'
```

## 🔍 Environment Verification

### Critical Environment Variables
```bash
# Check these are set in .env.local:
grep -E "(USE_CLAUDE|USE_MICROPSI_BACH|DEMO_PIPELINE_DISABLED|ATTENDING_ENFORCEMENT_MODE)" .env.local
```

Expected output:
```
USE_CLAUDE=true
USE_MICROPSI_BACH=true  
DEMO_PIPELINE_DISABLED=true
ATTENDING_ENFORCEMENT_MODE=relaxed
```

### Health Checks
```bash
# Oracle turn endpoint health
curl -s http://localhost:3000/api/oracle/turn | jq '.providers'

# Debug context endpoint health  
curl -s http://localhost:3000/api/debug/context | jq '.status'

# Bridge pulse (if backend running)
curl -s http://localhost:3000/debug/bridge | jq '.heartbeat'
```

## 🎯 Success Indicators

### ✅ MicroPsi Working
- **Context debug** returns micropsi object with modulation
- **Turn metadata** includes micropsi.driveVector and micropsi.modulation  
- **Temperature varies** based on arousal (0.6-0.9 range)
- **Depth bias** changes with meaning drive (0.3-0.8 range)
- **Invite count** adapts to confidence/arousal (1 or 2)

### ✅ Memory Layers Active
- **Context counts** show ain/soul/facets after interactions
- **Drive vector** reflects input content (safety higher for safety concerns)
- **Facet hints** populated with user trait scores
- **NLU analysis** shows intent/entities/sentiment

### ✅ Conversational Quality
- **4-12 sentences** per response (not 2-7)
- **Warm, natural tone** (not terse or robotic)
- **1-2 questions** when appropriate (not forced)
- **Greetings applied** on first turn of conversation
- **Validation relaxed** allowing natural flow

## 🚨 Troubleshooting

### No MicroPsi in Response
1. Check `USE_MICROPSI_BACH=true` in .env.local
2. Restart development server after env changes
3. Check console for import errors in context builder
4. Verify confidence threshold (MICROPSI_MIN_CONF=0.55)

### Old "Demo Bot" Feel
1. Confirm `DEMO_PIPELINE_DISABLED=true`
2. Verify `USE_CLAUDE=true` and Claude in providers list
3. Check `ATTENDING_ENFORCEMENT_MODE=relaxed`  
4. Restart containers: `docker compose -f docker-compose.development.yml up --build`

### Voice Not Working
1. Check MicHUD handler calls `/api/oracle/turn`
2. Verify CORS allows localhost:3000
3. Check Network tab in DevTools for POST requests
4. Confirm `sendToOracle` function usage

### Memory Not Recalled  
1. Verify user authentication for memory access
2. Check AIN/Soul memory providers exist
3. Confirm conversation ID persistence
4. Look for timeout errors (CONTEXT_SEMANTIC_TIMEOUT_MS)

## 📊 Performance Benchmarks

- **Context building**: < 300ms
- **Turn processing**: < 3000ms  
- **Memory recall**: < 200ms per layer
- **MicroPsi appraisal**: < 50ms

---

**The fusion is complete when all memory layers feed into MicroPsi-modulated, conversational responses that adapt to user affect and drives.**