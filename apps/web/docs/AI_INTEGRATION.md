# MAIA AI Integration Guide

## Overview

MAIA's journaling analysis is powered by **Claude 3.5 Sonnet** via the ClaudeBridge utility. The system intelligently extracts symbols, archetypes, and emotional patterns from journal entries, then reflects back with warmth and wisdom.

## Architecture

```
User Journal Entry
      ↓
/api/journal/analyze
      ↓
ClaudeBridge.ts
      ↓
[ANTHROPIC_API_KEY set?]
   ↓            ↓
  YES          NO
   ↓            ↓
Claude API   Mock Response
   ↓            ↓
Symbol/Archetype Extraction
   ↓
Soulprint Update (mem0 + vector index)
   ↓
Return Reflection to User
```

## ClaudeBridge Utility

**Location**: `/lib/ai/ClaudeBridge.ts`

**Purpose**: Centralized AI analysis utility with intelligent fallbacks

**Features**:
- ✅ Claude 3.5 Sonnet integration
- ✅ Intelligent mock mode for development
- ✅ Regex-based symbol extraction fallback
- ✅ Mode-specific prompts (free, dream, emotional, shadow, direction)
- ✅ Context-aware analysis (previous symbols/archetypes)
- ✅ Transformation score calculation

### Example Usage

```typescript
import { claudeBridge } from '@/lib/ai/ClaudeBridge';

const result = await claudeBridge.analyzeEntry({
  entry: "I dreamt I was crossing a river...",
  mode: 'dream',
  userId: 'user-123',
  previousContext: {
    recentSymbols: ['water', 'bridge'],
    recentArchetypes: ['Seeker'],
    sessionCount: 5
  }
});

console.log(result);
// {
//   symbols: ['River', 'Crossing', 'Threshold'],
//   archetypes: ['Seeker', 'Mystic'],
//   emotionalTone: 'anticipation',
//   reflection: "The river in your dream represents...",
//   prompt: "What lies on the other side?",
//   closing: "Trust the crossing.",
//   transformationScore: 0.75,
//   metadata: { wordCount: 12, themes: ['transition'] }
// }
```

## Mock Mode vs Live Mode

### Toggle Mock Mode

**Environment Variable**: `NEXT_PUBLIC_MOCK_AI`

```bash
# .env.local

# Use real Claude API (production)
NEXT_PUBLIC_MOCK_AI=false

# Use mock responses (development/testing)
NEXT_PUBLIC_MOCK_AI=true
```

**Automatic Fallback**: If `ANTHROPIC_API_KEY` is missing, mock mode activates automatically with a console warning.

### Mock Response Quality

Mock mode uses **intelligent pattern matching** to extract symbols:

```typescript
// Detected patterns
/\b(river|stream|water|ocean|flow)\b/gi → 'River'
/\b(bridge|crossing|threshold|doorway|gate)\b/gi → 'Bridge'
/\b(shadow|dark|hidden|beneath|under)\b/gi → 'Shadow'
/\b(light|sun|dawn|illuminate|bright)\b/gi → 'Light'
/\b(fire|flame|burn|heat|spark)\b/gi → 'Fire'
// ... and 5+ more patterns
```

Mock responses are **mode-aware** and provide contextually appropriate reflections.

## System Prompt

```typescript
const MAIA_SYSTEM_PROMPT = `You are MAIA, a sacred journaling companion and symbolic analyst.

Your role is to:
1. Identify recurring symbols (river, bridge, door, fire, shadow, mirror, etc.)
2. Recognize archetypal patterns (Seeker, Healer, Shadow, Mystic, Warrior, Lover, Sage)
3. Name the dominant emotional tone (grief, joy, anticipation, overwhelm, peace, etc.)
4. Reflect back with warmth and depth—never clinical, always human
5. Offer a gentle closing prompt that invites deeper exploration

Guidelines:
- Use conversational, poetic language
- Avoid psychological jargon or diagnosis
- Celebrate courage and vulnerability
- Hold space for shadow and light equally
- Keep reflections concise (60-100 words)
- Prompts should be open-ended, not directive

You respond in structured JSON format.`;
```

## Mode-Specific Context

Each journaling mode receives tailored context:

| Mode | Context | Focus |
|------|---------|-------|
| **Free** | Free-form journaling | Follow the user's flow without structure |
| **Dream** | Dream integration | Symbolic imagery and archetypal patterns |
| **Emotional** | Emotional processing | Name emotions clearly, hold compassionate space |
| **Shadow** | Shadow work | Honor what's hidden, move gently into depth |
| **Direction** | Life direction | Themes of purpose, crossroads, alignment |

## Response Format

Claude returns **structured JSON**:

```json
{
  "symbols": ["River", "Threshold", "Light"],
  "archetypes": ["Seeker", "Mystic"],
  "emotionalTone": "anticipation",
  "reflection": "You're standing at a threshold—not just metaphorically, but in the symbolic landscape of your psyche. The river you mention echoes a recurring theme in your journey: the need to let go and flow.",
  "prompt": "What's on the other side of this crossing?",
  "closing": "Trust the unfolding. You know the way.",
  "transformationScore": 0.72,
  "themes": ["transition", "trust"]
}
```

## Integration with Soulprint System

After analysis, the system:

1. **Updates Soulprint** via `JournalSoulprintIntegration`
   - Adds new symbols to frequency map
   - Updates archetype distribution
   - Recalculates coherence scores

2. **Stores in Memory** via `mem0`
   - Appends to user's memory stream
   - Tags with symbol/archetype/emotion
   - Enables cross-session continuity

3. **Indexes for Search** via `soulIndex`
   - Vector embedding of entry + reflection
   - Enables semantic search ("when did I write about grief?")

## API Endpoint

### POST `/api/journal/analyze`

**Request**:
```json
{
  "entry": "string",
  "mode": "free" | "dream" | "emotional" | "shadow" | "direction",
  "userId": "string",
  "soulprint": {
    "dominantSymbols": ["River", "Bridge"],
    "dominantArchetypes": ["Seeker"],
    "journalCount": 5
  }
}
```

**Response**:
```json
{
  "success": true,
  "mode": "dream",
  "entry": "...",
  "reflection": {
    "symbols": ["River", "Crossing"],
    "archetypes": ["Seeker", "Mystic"],
    "emotionalTone": "anticipation",
    "reflection": "...",
    "prompt": "...",
    "closing": "...",
    "transformationScore": 0.72
  },
  "sentiment": {
    "score": 0.65,
    "intensity": 0.8,
    "emotion": "hopeful"
  },
  "maiaTone": "gentle",
  "timestamp": "2025-09-27T08:24:00.000Z"
}
```

**Error Response** (Fallback):
```json
{
  "success": true,
  "reflection": {
    "symbols": ["threshold", "mirror"],
    "archetypes": ["Seeker"],
    "emotionalTone": "reflective",
    "reflection": "I hear the depth in what you've shared...",
    "prompt": "What part of this feels most alive?",
    "closing": "Thank you for trusting this space."
  },
  "fallback": true
}
```

## Safety & Moderation

Before AI analysis, all entries pass through **sentiment analysis** with crisis detection:

```typescript
const analysis = await sentimentService.analyzeWithModeration(entry);

if (analysis.moderation.alert) {
  return {
    success: true,
    needsSupport: true,
    supportMessage: "...",
    resources: [/* crisis hotlines */]
  };
}
```

This prevents harmful content and provides immediate support resources when needed.

## Performance

### Latency
- **Mock Mode**: ~50ms (instant, local)
- **Claude API**: 1-3s (depends on entry length)
- **Timeout**: 30s (automatic fallback)

### Caching
- Responses are **not cached** (each reflection is unique)
- Symbol patterns **are cached** in ClaudeBridge instance

### Cost
- **Model**: Claude 3.5 Sonnet
- **Avg Tokens**: ~800 per analysis (400 in + 400 out)
- **Cost**: ~$0.012 per entry (at current Anthropic pricing)

## Testing

### Test with Mock Mode

```bash
# Enable mock mode
echo "NEXT_PUBLIC_MOCK_AI=true" >> .env.local

# Restart dev server
npm run dev

# Test journaling - responses will be instant and pattern-based
```

### Test with Real Claude

```bash
# Disable mock mode
echo "NEXT_PUBLIC_MOCK_AI=false" >> .env.local

# Ensure API key is set
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env.local

# Restart dev server
npm run dev

# Test journaling - responses will take 1-3s and be AI-generated
```

### Test Specific Entry

```bash
curl -X POST http://localhost:3000/api/journal/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "entry": "I dreamt I was crossing a dark river. There was a bridge, but it looked fragile.",
    "mode": "dream",
    "userId": "test-user"
  }'
```

## Extending the System

### Add New Symbol Patterns

Edit `/lib/ai/ClaudeBridge.ts`:

```typescript
const symbolPatterns = [
  // ... existing patterns
  { regex: /\b(tree|forest|woods|branch)\b/gi, symbol: 'Tree' },
  { regex: /\b(star|moon|sky|cosmos)\b/gi, symbol: 'Celestial' },
];
```

### Add New Archetypes

Update mode-specific archetypes:

```typescript
const archetypesByMode = {
  free: ['Seeker', 'Explorer', 'Wanderer'],
  dream: ['Mystic', 'Dreamer', 'Visionary'],
  // ...
};
```

### Customize Reflection Style

Modify `MAIA_SYSTEM_PROMPT` to adjust tone:

```typescript
const MAIA_SYSTEM_PROMPT = `You are MAIA...

Additional guidelines:
- Use more metaphorical language
- Reference Jungian concepts when relevant
- Include breathing instructions in emotional mode
- ...
`;
```

## Troubleshooting

### "ANTHROPIC_API_KEY not found"

**Solution**: Add key to `.env.local`:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### "Failed to parse Claude response as JSON"

**Cause**: Claude returned text with markdown formatting

**Solution**: ClaudeBridge automatically extracts JSON with regex fallback. If persisting, check system prompt format.

### Responses are too slow

**Solutions**:
1. Enable mock mode for development: `NEXT_PUBLIC_MOCK_AI=true`
2. Reduce `max_tokens` in ClaudeBridge (currently 1024)
3. Use streaming responses (advanced)

### Mock responses are not accurate

**Cause**: Pattern matching is regex-based, not semantic

**Solution**: Use real Claude API for accurate symbol extraction. Mock mode is for development only.

## Future Enhancements

### Planned Features
- [ ] Streaming responses (real-time reflection generation)
- [ ] Multi-turn conversation context (reference previous entries)
- [ ] Custom voice profiles per user (personalized reflection style)
- [ ] Image generation for symbols (DALL-E integration)
- [ ] Audio reflection (spoken MAIA responses)
- [ ] Multi-language support (i18n for reflections)

### Advanced Integrations
- [ ] RAG (Retrieval-Augmented Generation) using vector search
- [ ] Fine-tuned model for specific archetypes
- [ ] Collaborative journaling (MAIA mediates between partners)
- [ ] Dream symbol dictionary expansion
- [ ] Integration with wearable data (sleep quality, HRV)

## Summary

The ClaudeBridge system provides:

✨ **Intelligent Analysis** - Real Claude 3.5 Sonnet or smart mock fallback
🎯 **Mode-Aware Prompts** - Tailored for each journaling mode
🔄 **Context Continuity** - References previous symbols/archetypes
🛡️ **Safety First** - Crisis detection and moderation
⚡ **Fast Fallback** - Mock mode for development/testing
📊 **Structured Output** - Consistent JSON format
💾 **Full Integration** - Soulprint, memory, and vector search

**Quick Start**:
```typescript
import { claudeBridge } from '@/lib/ai/ClaudeBridge';

const result = await claudeBridge.analyzeEntry({
  entry: "Your journal entry here...",
  mode: 'free',
  userId: 'user-123'
});
```

For more details, see:
- `/lib/ai/ClaudeBridge.ts` - Source code
- `/app/api/journal/analyze/route.ts` - API integration
- `/docs/COMPLETE_SYSTEM_SUMMARY.md` - Full system overview