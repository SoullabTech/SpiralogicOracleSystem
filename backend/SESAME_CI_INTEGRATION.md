# Sesame CI (Conversational Intelligence) Integration

## Overview

Sesame CI provides optional conversational intelligence shaping for enhanced voice flow and elemental personalization. This feature transforms raw Maya responses into more natural, human-like speech with appropriate prosody markers and elemental styling.

## Architecture

```
Maya Raw Text → [Optional CI Shaping] → Enhanced Text → TTS → Voice Output
```

### Without CI (Graceful Fallback)
```
"Welcome to your session. How are you feeling today?"
↓
TTS Synthesis
↓
Natural but basic voice output
```

### With CI Enabled
```
"Welcome to your session. How are you feeling today?"
↓ (Aether element, neutral sentiment)
"Welcome to your session. <pause-300ms> How are you feeling today? <pause-200ms>"
↓
TTS Synthesis with prosody markers
↓
More natural, contemplative voice output with appropriate pauses
```

## Configuration

### Environment Variables

Add to your `.env` or `.env.local`:

```env
# Sesame Service Configuration
SESAME_URL=http://localhost:8000
SESAME_TOKEN=your_sesame_token_here

# Enable CI Shaping (optional, defaults to false)
SESAME_CI_ENABLED=true
```

### Docker Configuration

Your Sesame container needs to support the `/ci/shape` endpoint. Standard Sesame containers only include `/health` and `/tts` endpoints.

**Required endpoints:**
- `GET /health` - Service health check
- `POST /tts` - Text-to-speech synthesis  
- `POST /ci/shape` - Conversational intelligence shaping *(CI feature)*

## Elemental Personalization

CI shaping adapts speech patterns based on the detected elemental archetype:

### Air Element
```json
{
  "rhythm": "crisp",
  "pauses": "precise", 
  "clarity": "high",
  "flow": "articulate"
}
```
**Result:** Clear, precise delivery with articulate pauses

### Water Element  
```json
{
  "rhythm": "flowing",
  "pauses": "gentle",
  "transitions": "smooth", 
  "flow": "continuous"
}
```
**Result:** Flowing, gentle speech with smooth transitions

### Fire Element
```json
{
  "rhythm": "dynamic",
  "energy": "high",
  "emphasis": "passionate",
  "flow": "energetic" 
}
```
**Result:** Dynamic, energetic delivery with passionate emphasis

### Earth Element
```json
{
  "rhythm": "steady", 
  "pauses": "grounding",
  "tone": "warm",
  "flow": "reassuring"
}
```
**Result:** Steady, warm delivery with grounding pauses

### Aether Element
```json
{
  "rhythm": "spacious",
  "pauses": "contemplative", 
  "depth": "profound",
  "flow": "integrative"
}
```
**Result:** Spacious, contemplative delivery with profound depth

## API Request Format

The CI shaping service receives enhanced payload:

```json
{
  "text": "Welcome to your session. How are you feeling today?",
  "style": "aether",
  "meta": {
    "element": "aether",
    "sentiment": "neutral", 
    "goals": ["clarity", "authenticity"],
    "prosody": {
      "pace": "natural",
      "emphasis": "moderate",
      "rhythm": "spacious",
      "pauses": "contemplative",
      "depth": "profound", 
      "flow": "integrative"
    }
  }
}
```

## Error Handling & Fallbacks

The system gracefully handles CI failures:

### Service Unavailable (ECONNREFUSED)
```
[WARN] Sesame CI service unavailable - using original text
```
**Action:** Falls back to original text, TTS continues normally

### Endpoint Not Found (404)
```
[WARN] Sesame CI /ci/shape endpoint not found - container may not support CI features  
```
**Action:** Falls back to original text, suggests container upgrade

### Timeout or Other Errors
```
[WARN] Sesame CI transformation failed: timeout
```
**Action:** Falls back to original text within 3-second timeout

## Testing

### Run CI Test Suite
```bash
cd backend
node test-sesame-ci.js
```

### Example Test Output
```
🧪 Sesame CI Shaping Test Suite
================================
Sesame URL: http://localhost:8000
CI Enabled: true

🏥 Testing Sesame health endpoint...
✅ Sesame service is healthy: {"status":"ok"}

🧠 Testing CI shaping endpoint...

--- Test 1: AETHER Element ---
Input: "Welcome to your session. How are you feeling today?"
Expected: Should add contemplative pauses and spacious rhythm
✅ Shaped (85ms): "Welcome to your session. <pause-300ms> How are you <em>feeling</em> today? <pause-200ms>"
📊 Analysis: 58 → 95 chars, Pauses: true, Emphasis: true
```

## Performance Impact

- **Latency:** ~50-100ms additional processing time
- **Timeout:** 3-second safety timeout to prevent blocking
- **Fallback:** Instant fallback to original text on any failure
- **Net UX Impact:** Minimal latency, significantly improved voice naturalness

## Implementation Details

### Pipeline Integration
```typescript
// Step 4: Sesame CI shapes the final utterance (optional)
const finalForVoice = await this.sesameCITransform(hinted, {
  element: ctx.element,
  sentiment: ctx.sentiment, 
  goals: this.getConversationalGoals(ctx)
});
```

### Graceful Degradation
```typescript
// Check if CI shaping is enabled
const ciEnabled = process.env.SESAME_CI_ENABLED === 'true';

if (!ciEnabled) {
  logger.debug('Sesame CI shaping disabled - using original text');
  return text;
}
```

## Benefits for Beta Users

1. **Enhanced Voice Naturalness** - More human-like speech patterns
2. **Elemental Personalization** - Voice adapts to user's archetype  
3. **Zero Downtime Risk** - Graceful fallback ensures reliability
4. **Executive-Ready Quality** - Professional voice output quality

## Monitoring & Debugging

### Log Levels
- `DEBUG`: CI request/response details
- `INFO`: Successful shaping with metrics  
- `WARN`: Fallback scenarios and errors

### Key Metrics
- Shaping success rate
- Average processing time
- Fallback frequency
- Text length changes

## Future Enhancements

- Real-time streaming CI shaping
- User-specific voice preferences
- A/B testing CI vs non-CI responses  
- Advanced prosody customization
- Multi-language CI support