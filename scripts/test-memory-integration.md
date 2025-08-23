# Memory & Intelligence Integration Test

## Quick Integration Verification

### 1. Environment Check
```bash
# Verify MicroPsi is enabled
grep USE_MICROPSI_BACH .env.local
# Expected: USE_MICROPSI_BACH=true

# Check context budgets
grep CONTEXT_ .env.local
# Expected: CONTEXT_AIN_TOPK=6, etc.
```

### 2. API Health Check
```bash
# Verify enhanced turn endpoint
curl -s http://localhost:3000/api/oracle/turn | jq '.providers'
# Expected: micropsi should be listed if enabled

# Check debug endpoint
curl -s http://localhost:3000/api/debug/context | jq '.status'
# Expected: "ok"
```

### 3. Context Pack Test
```bash
# Test context building
curl -s -X POST http://localhost:3000/api/debug/context \
  -H 'Content-Type: application/json' \
  -d '{"text":"I need guidance","userId":"test"}' | jq '.'
```

Expected Response Structure:
```json
{
  "ain": 0,          // Memory count (0 if no history)
  "soul": 0,         // Soul memory count  
  "facetKeys": 6,    // Facet dimensions
  "nlu": {...},      // Sesame analysis
  "psi": true,       // PSI enabled
  "micropsi": {      // MicroPsi modulation
    "driveVector": {
      "clarity": 0.6,
      "safety": 0.55,
      "agency": 0.55,
      "connection": 0.5,
      "meaning": 0.55
    },
    "affect": {
      "valence": 0.5,
      "arousal": 0.5,
      "confidence": 0.65
    },
    "modulation": {
      "temperature": 0.7,
      "depthBias": 0.6,
      "inviteCount": 1
    }
  }
}
```

### 4. Full Turn Test with Modulation
```bash
# Test modulated turn
curl -s -X POST http://localhost:3000/api/oracle/turn \
  -H 'Content-Type: application/json' \
  -d '{"input":{"text":"I feel anxious about big decisions"},"conversationId":"test-mp"}' \
  | jq '.metadata.micropsi.modulation'
```

Expected Modulation:
- `temperature`: Should be adjusted based on arousal
- `depthBias`: Should reflect meaning drive
- `inviteCount`: 1 or 2 based on confidence and arousal

### 5. Memory Layer Verification

After several interactions, context should show:
```json
{
  "metadata": {
    "context": {
      "ain": 2,     // AIN memories recalled
      "soul": 1,    // Soul memories recalled  
      "facets": 6   // Facet dimensions
    }
  }
}
```

### 6. Drive Vector Impact Test

**High Meaning Drive:**
```bash
curl -X POST http://localhost:3000/api/oracle/turn \
  -H 'Content-Type: application/json' \
  -d '{"input":{"text":"What is the deeper purpose of my struggles?"}}'
```
Expected: `meaning` drive > 0.65, higher `depthBias`

**High Safety Drive:**
```bash
curl -X POST http://localhost:3000/api/oracle/turn \
  -H 'Content-Type: application/json' \
  -d '{"input":{"text":"I am terrified of making the wrong choice"}}'
```
Expected: `safety` drive > 0.7, possibly `inviteCount` = 2

## Success Criteria

✅ **Environment**: All MicroPsi variables set correctly  
✅ **Context Pack**: Debug endpoint returns full structure  
✅ **Modulation**: Turn responses include micropsi metadata  
✅ **Memory Layers**: AIN + Soul counts increase with history  
✅ **Drive Sensitivity**: Different inputs produce different drive vectors  
✅ **Parameter Impact**: Temperature/depth vary based on affect  

## Troubleshooting

**No micropsi in response:**
- Check `USE_MICROPSI_BACH=true` in .env.local
- Verify imports in context builder
- Check console for errors

**Context counts always 0:**
- Verify AIN/Soul memory providers exist
- Check user authentication for memory access
- Confirm conversation ID persistence

**No parameter modulation:**
- Check MicroPsi confidence threshold (MICROPSI_MIN_CONF)
- Verify Claude provider receives modulation
- Look for MicroPsi processing logs in development

---

*This test verifies that MicroPsi/Bach algorithms actively shape every Oracle turn with memory-aware context.*