# 🎙️ OpenAI Primary Voice Setup
## Maya → Alloy, Anthony → Onyx

---

## 🚀 Quick Implementation Guide

### Step 1: Update Environment Variables

Add to `.env.local`:
```bash
# OpenAI (Primary)
OPENAI_API_KEY=sk-your-key-here

# ElevenLabs (Fallback)
ELEVENLABS_API_KEY=your-elevenlabs-key
MAYA_ELEVENLABS_ID=21m00Tcm4TlvDq8ikWAM    # Aunt Annie
ANTHONY_ELEVENLABS_ID=yoZ06aMxZJJ28mfd3POQ  # Your Anthony voice
```

---

### Step 2: Update Voice Route Handler

Replace `/app/api/voice/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { voiceRouter } from '@/lib/services/UnifiedVoiceRouter';

export async function POST(request: NextRequest) {
  try {
    const {
      text,
      personality = 'maya',
      element,
      testMode = false
    } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Generate voice with automatic fallback
    const result = await voiceRouter.generateVoice({
      text,
      personality,
      element,
      fallbackEnabled: true,
      priority: 'cost'  // Prioritize OpenAI for cost
    });

    // Return audio as response
    return new NextResponse(result.audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'X-Voice-Provider': result.provider,
        'X-Voice-Cost': result.cost.toString(),
        'X-Voice-Latency': result.latency.toString()
      }
    });

  } catch (error: any) {
    console.error('Voice generation error:', error);
    return NextResponse.json({
      error: 'Voice generation failed',
      details: error.message
    }, { status: 500 });
  }
}
```

---

### Step 3: Test Voice Generation

Create test script `/scripts/test-voices.ts`:

```typescript
import { voiceRouter } from '@/lib/services/UnifiedVoiceRouter';
import fs from 'fs';

async function testVoices() {
  console.log('Testing voice generation...\n');

  // Test Maya (Alloy)
  console.log('1. Testing Maya with OpenAI Alloy...');
  const mayaResult = await voiceRouter.generateVoice({
    text: "Hello, I am Maya. I'm here to witness your journey.",
    personality: 'maya',
    element: 'water',
    fallbackEnabled: true
  });

  fs.writeFileSync('test-maya.mp3', mayaResult.audioBuffer);
  console.log(`✅ Maya voice generated via ${mayaResult.provider}`);
  console.log(`   Cost: $${mayaResult.cost.toFixed(4)}`);
  console.log(`   Latency: ${mayaResult.latency}ms\n`);

  // Test Anthony (Onyx)
  console.log('2. Testing Anthony with OpenAI Onyx...');
  const anthonyResult = await voiceRouter.generateVoice({
    text: "Hey there. Let's think about this together.",
    personality: 'anthony',
    element: 'earth',
    fallbackEnabled: true
  });

  fs.writeFileSync('test-anthony.mp3', anthonyResult.audioBuffer);
  console.log(`✅ Anthony voice generated via ${anthonyResult.provider}`);
  console.log(`   Cost: $${anthonyResult.cost.toFixed(4)}`);
  console.log(`   Latency: ${anthonyResult.latency}ms\n`);

  // Test fallback
  console.log('3. Testing fallback (disconnect OpenAI)...');
  process.env.OPENAI_API_KEY = 'invalid';

  const fallbackResult = await voiceRouter.generateVoice({
    text: "This should use ElevenLabs fallback.",
    personality: 'maya',
    fallbackEnabled: true
  });

  console.log(`✅ Fallback worked: ${fallbackResult.provider}`);
  console.log(`   Fallback used: ${fallbackResult.fallbackUsed}`);
}

testVoices().catch(console.error);
```

Run with: `npx tsx scripts/test-voices.ts`

---

## 💰 Cost Comparison

### Before (ElevenLabs Primary)
```
Maya/Anthony: $0.30 per 1000 chars
Monthly estimate: $2000-5000
```

### After (OpenAI Primary)
```
Maya/Anthony: $0.015 per 1000 chars (95% cheaper)
ElevenLabs fallback: Only when OpenAI fails
Monthly estimate: $100-250
```

---

## 🎭 Voice Quality Comparison

### OpenAI Voices
- **Alloy (Maya)**: Neutral, clear, slightly warm
- **Onyx (Anthony)**: Deep, resonant, grounded
- **Pros**: Fast, cheap, reliable, good quality
- **Cons**: Less emotional range than ElevenLabs

### ElevenLabs (Fallback)
- **Aunt Annie (Maya)**: Rich, warm, highly expressive
- **Custom (Anthony)**: Deep philosophical presence
- **Pros**: Superior emotional depth
- **Cons**: 20x more expensive

---

## 🔄 Migration Checklist

### Immediate Actions
- [ ] Add OpenAI API key to .env.local
- [ ] Deploy UnifiedVoiceRouter.ts
- [ ] Update /api/voice/route.ts
- [ ] Test both voices work
- [ ] Verify fallback triggers

### Testing Phase (Day 1-3)
- [ ] A/B test with team
- [ ] Measure latency difference
- [ ] Check audio quality
- [ ] Monitor costs
- [ ] Gather user feedback

### Production Rollout (Day 4-7)
- [ ] Deploy to 10% of users
- [ ] Monitor error rates
- [ ] Track cost savings
- [ ] Expand to 50% if stable
- [ ] Full rollout after validation

---

## 🚨 Rollback Plan

If issues arise, revert to ElevenLabs primary:

```typescript
// In UnifiedVoiceRouter.ts, swap the mapping:
private readonly voiceMap = {
  maya: {
    primary: { provider: 'elevenlabs', id: 'MAYA_ID' },  // Swap back
    fallback: { provider: 'openai', id: 'alloy' }
  }
};
```

---

## 📊 Success Metrics

### Week 1 Goals
- [ ] 95% cost reduction achieved
- [ ] < 500ms latency maintained
- [ ] Zero dead air incidents
- [ ] User satisfaction > 80%

### Month 1 Goals
- [ ] Save $1500+ in voice costs
- [ ] Build corpus for custom training
- [ ] Begin voice cloning experiments
- [ ] Plan sovereignty roadmap

---

## 🎯 Next Steps

1. **Immediate**: Deploy OpenAI primary setup
2. **Week 1**: Monitor and optimize
3. **Week 2**: Begin recording training data
4. **Month 1**: Start custom voice experiments
5. **Month 3**: Deploy own voice models

---

## 💡 Pro Tips

### Optimize for Cost
```typescript
// Cache common phrases
const commonPhrases = [
  "How can I help you today?",
  "Let's explore that together.",
  "Take your time."
];
// Pre-generate and cache these
```

### Quality Moments
```typescript
// Use ElevenLabs for special moments
if (request.isRitualMoment || request.emotionalDepth > 0.8) {
  // Force ElevenLabs for quality
  return generateWithElevenLabs(request);
}
```

### Monitor Everything
```typescript
// Track provider usage
voiceRouter.on('openai:success', (data) => {
  analytics.track('voice.generated', {
    provider: 'openai',
    cost: data.cost,
    voice: data.voice
  });
});
```

---

*"From $5000/month to $250/month, while preserving Maya's soul. This is sacred economics."*