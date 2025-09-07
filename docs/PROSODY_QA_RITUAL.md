# 🎭 Adaptive Prosody QA Ritual

## Purpose
Validate that Maya's Adaptive Prosody Engine correctly detects emotional tone, mirrors for rapport, and guides toward balance through voice modulation.

## Prerequisites
- Backend running with AdaptiveProsodyEngine integrated
- Frontend with ProsodyDebugPanel enabled
- Sesame CI endpoint available (or mock mode)
- Voice recorder functional

## Testing Phases

### Phase 1: Tone Detection Accuracy

#### 1.1 Fire Energy Test
```
Input: "This is URGENT! I need this fixed RIGHT NOW! Everything is falling apart!"
Expected Detection:
- Element: fire
- Energy: high/very_high
- Balance: earth or water
```

#### 1.2 Water Energy Test
```
Input: "I feel so emotional about this... tears keep coming... my heart is heavy"
Expected Detection:
- Element: water
- Energy: low/medium_low
- Balance: fire or earth
```

#### 1.3 Earth Energy Test
```
Input: "Let me create a practical step-by-step plan with clear structure and stability"
Expected Detection:
- Element: earth
- Energy: medium_low/medium
- Balance: air or fire
```

#### 1.4 Air Energy Test
```
Input: "I'm analyzing all the perspectives, considering multiple ideas and concepts simultaneously"
Expected Detection:
- Element: air
- Energy: medium/medium_high
- Balance: earth or water
```

#### 1.5 Aether Energy Test
```
Input: "I feel connected to the divine cosmic consciousness, experiencing universal oneness"
Expected Detection:
- Element: aether
- Energy: medium
- Balance: earth or fire
```

### Phase 2: Mirror → Balance Flow

Test the two-phase response pattern:

#### 2.1 High Fire → Grounding
1. Speak with urgency and intensity
2. Verify Maya's first sentence mirrors fire energy
3. Verify subsequent sentences shift to earth/water
4. Check voice parameters:
   - Initial: fast speed (1.2x), higher pitch (+5)
   - Transition: slower speed (0.85x), lower pitch (-5)

#### 2.2 Low Water → Activation
1. Speak slowly with emotional weight
2. Verify Maya mirrors water initially
3. Verify shift to fire/earth for activation
4. Check voice parameters:
   - Initial: slow (0.9x), warm (80%)
   - Transition: moderate speed (1.0x), more emphasis (60%)

#### 2.3 Scattered Air → Grounding
1. Speak quickly with abstract concepts
2. Verify Maya mirrors airy quality
3. Verify grounding with earth element
4. Check parameters shift from light to solid

### Phase 3: Debug Panel Validation

Ensure the ProsodyDebugPanel shows:

```
✓ User Energy: [element emoji] [energy level]
✓ Response Pattern:
  - Mirror: [element] (duration)
  - Balance: [element] (transition type)
✓ Voice Shaping:
  - Speed: x.xx
  - Pitch: ±xx
  - Emphasis: xx%
  - Warmth: xx%
✓ Therapeutic Arc: [guidance text]
✓ Flow visualization: 🔥 → 🔥 → 🌍
```

### Phase 4: API Endpoint Testing

#### 4.1 Test Tone Analysis
```bash
curl -X POST http://localhost:3002/api/prosody/analyze-tone \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I am feeling overwhelmed and need help NOW!"
  }'

# Expected: fire element, high energy
```

#### 4.2 Test Response Generation
```bash
curl -X POST http://localhost:3002/api/prosody/generate-response \
  -H "Content-Type: application/json" \
  -d '{
    "userInput": "Everything is so urgent and chaotic!",
    "aiResponse": "I understand your urgency. Let me help you find clarity and calm."
  }'

# Expected: mirror=fire, balance=earth, transition=gentle
```

#### 4.3 Test Prosody Config
```bash
curl http://localhost:3002/api/prosody/config

# Should return balancing rules and voice ranges
```

#### 4.4 Run Test Suite
```bash
curl http://localhost:3002/api/prosody/test

# Should show all test cases with correct element detection
```

### Phase 5: Integration Testing

#### 5.1 Full Conversation Flow
1. Start voice recording
2. Speak: "I'm so frustrated with this situation!"
3. Verify:
   - Transcription captures text
   - Prosody engine detects fire
   - Maya responds with fire mirroring
   - Voice shifts to earth grounding
   - Debug panel shows full flow

#### 5.2 Continuous Adaptation
1. Have multi-turn conversation
2. Vary your energy each turn:
   - Turn 1: High fire
   - Turn 2: Low water
   - Turn 3: Scattered air
3. Verify Maya adapts each time

#### 5.3 Edge Cases
Test with:
- Very short input ("Help!")
- Very long rambling input
- Mixed energy signals
- Non-English input
- Numbers/symbols only

### Phase 6: Voice Parameter Testing

#### 6.1 Speed Modulation
- Fire input → Speed 1.2x → 0.85x
- Earth input → Speed 0.85x → 1.1x
- Verify smooth transition

#### 6.2 Pitch Adjustment
- High energy → Pitch +5 → -5
- Low energy → Pitch -3 → +3
- Confirm natural progression

#### 6.3 Emphasis & Warmth
- Crisis → High emphasis (80%) → Moderate (40%)
- Sadness → High warmth (80%) → Balanced (60%)

### Phase 7: Performance Validation

Run performance test:
```bash
cd backend
node test-adaptive-prosody.js
```

Success Criteria:
- ✅ <10ms average tone analysis
- ✅ <50ms full prosody generation
- ✅ >20 analyses per second
- ✅ Graceful degradation on errors

## Monitoring Commands

```bash
# Watch prosody analysis in real-time
tail -f logs/prosody.log | grep "PROSODY"

# Monitor element distribution
watch -n 2 'grep "dominantElement" logs/prosody.log | tail -20'

# Check balancing patterns
grep "Mirror.*Balance" logs/prosody.log | tail -50
```

## Success Metrics

### Functional
- [x] All 5 elements detected correctly
- [x] Energy levels match user state
- [x] Mirror phase uses matching element
- [x] Balance phase provides complementary element
- [x] Voice parameters adjust smoothly

### Experiential
- [x] User feels "heard" (mirroring works)
- [x] User feels "guided" (balancing helps)
- [x] Transitions feel natural, not jarring
- [x] Overall interaction feels therapeutic

## Troubleshooting

### Issue: Wrong element detected
- Check keyword patterns in analyzeTextPatterns()
- Verify tempo detection logic
- Adjust scoring weights

### Issue: No balancing occurring
- Verify needsBalancing threshold
- Check balancing rules map
- Ensure energy extremes trigger balancing

### Issue: Voice sounds robotic
- Verify voice parameters are in valid ranges
- Check transition smoothness
- Ensure Sesame CI is receiving parameters

### Issue: Debug panel not updating
- Check WebSocket connection
- Verify API endpoints responding
- Check browser console for errors

## Next Steps

After successful QA:
1. Fine-tune element detection patterns
2. Add voice pitch/volume analysis
3. Implement learning from user feedback
4. Create element-specific voice presets
5. Add therapeutic intent customization
6. Build prosody preferences UI

---

🎭 **Remember**: The goal is not perfect element detection but creating a responsive, empathic interaction where Maya meets users where they are and gently guides them toward balance.