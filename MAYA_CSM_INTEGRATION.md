# 🎙️ Maya CSM (Conversational Speech Model) Integration Guide

**Status**: 🚀 Ready for Implementation  
**Model**: Sesame CSM-1B - The first open-source contextual TTS model  
**Architecture**: Dual LLaMA-style transformers + Mimi codec

---

## 🌟 Overview

This guide ensures Sesame CSM is fully integrated to power Maya's voice with:
- **Conversational context awareness** - Maintains voice consistency across dialogues
- **Multi-turn coherence** - Natural flow in extended conversations
- **Emotional resonance** - Voice adapts to conversation dynamics
- **Real-time streaming** - Low-latency voice generation

---

## 🏗️ Current Architecture

### Voice Pipeline Flow
```
User Message
    ↓
Oracle Response (with element & emotion)
    ↓
SesameMayaRefiner (applies elemental tone)
    ↓
Northflank Sesame CSM Service
    ↓
CSM Model Processing
    ├→ Context from conversation history
    ├→ Speaker embedding (Maya voice ID)
    ├→ Elemental tone mapping
    └→ Emotional modulation
    ↓
Generated Audio (16kHz WAV)
    ↓
Client Playback
```

### Key Components

1. **Voice Cloning System** (`/sesame_csm_openai/app/voice_cloning.py`)
   - Maya's voice profile stored with speaker_id: 10-20 range
   - Reference audio processing and enhancement
   - Context segment generation for consistency

2. **CSM Generator** (`/sesame_csm_openai/app/generator.py`)
   - Dual decoder architecture (backbone + depth)
   - Mimi codec for audio encoding (24kHz native)
   - Context-aware generation with conversation history

3. **Maya Refiner** (`/backend/src/services/SesameMayaRefiner.ts`)
   - Elemental tone injection (air, fire, water, earth, aether)
   - Breath mark insertion for natural pacing
   - Safety softening and style tightening

4. **API Integration** (`/app/api/voice/sesame/route.ts`)
   - Northflank service connection
   - ElevenLabs fallback for reliability
   - Web Speech API as final fallback

---

## 📋 Implementation Checklist

### 1. ✅ Voice Profile Setup
```javascript
// Maya's CSM voice profile configuration
const MAYA_CSM_PROFILE = {
  voice_id: "maya_oracle_v1",
  speaker_id: 15,  // Reserved for Maya in 10-20 range
  characteristics: {
    pitch: 1.15,    // Slightly higher for ethereal quality
    rate: 0.85,     // Slower for mystical effect
    stability: 0.6,  // Balance between consistency and variation
    warmth: 0.8     // Maternal, caring tone
  }
};
```

### 2. 🔧 Context Management Enhancement
```typescript
// Enhanced context tracking for CSM
interface ConversationContext {
  segments: Segment[];  // Last 3-5 conversation turns
  emotional_state: EmotionalState;
  elemental_alignment: Element;
  relationship_depth: number;
  breakthrough_markers: string[];
}

// Update SesameMayaRefiner to pass context
class EnhancedSesameMayaRefiner extends SesameMayaRefiner {
  async generateWithContext(
    text: string,
    context: ConversationContext
  ): Promise<AudioBuffer> {
    // Apply elemental refinements
    const refinedText = this.refineText(text);
    
    // Generate context segments for CSM
    const contextSegments = this.buildContextSegments(context);
    
    // Call CSM with full context
    return await this.callCSMWithContext(
      refinedText,
      contextSegments,
      context.elemental_alignment
    );
  }
}
```

### 3. 🎯 Elemental Voice Mapping
```typescript
// Map elements to CSM voice parameters
const ELEMENTAL_VOICE_PARAMS = {
  air: {
    temperature: 0.7,   // More variation for intellectual exploration
    topk: 40,          // Wider selection for creativity
    speed: 1.0,        // Clear, articulate
    modulation: "bright"
  },
  fire: {
    temperature: 0.8,   // Higher energy, more dynamic
    topk: 35,          // Focused but energetic
    speed: 1.1,        // Slightly faster for passion
    modulation: "intense"
  },
  water: {
    temperature: 0.5,   // Stable, soothing
    topk: 25,          // Consistent flow
    speed: 0.9,        // Gentle pacing
    modulation: "flowing"
  },
  earth: {
    temperature: 0.4,   // Very stable, grounded
    topk: 20,          // Predictable, reliable
    speed: 0.85,       // Deliberate, measured
    modulation: "grounded"
  },
  aether: {
    temperature: 0.65,  // Balanced mystical quality
    topk: 30,          // Oracle-like wisdom
    speed: 0.9,        // Spacious delivery
    modulation: "ethereal"
  }
};
```

### 4. 🔄 Multi-turn Conversation Support
```typescript
// Implement conversation memory for CSM
class CSMConversationMemory {
  private conversationHistory: Map<string, Segment[]> = new Map();
  
  addTurn(threadId: string, userText: string, mayaResponse: string, audio: AudioBuffer) {
    const history = this.conversationHistory.get(threadId) || [];
    
    // Create segment for CSM context
    const segment: Segment = {
      speaker: 15,  // Maya's speaker ID
      text: mayaResponse,
      audio: this.convertToTensor(audio)
    };
    
    // Keep last 5 turns for context
    history.push(segment);
    if (history.length > 5) {
      history.shift();
    }
    
    this.conversationHistory.set(threadId, history);
  }
  
  getContext(threadId: string): Segment[] {
    return this.conversationHistory.get(threadId) || [];
  }
}
```

### 5. 🌊 Emotional Resonance Integration
```typescript
// Map emotional states to voice modulation
function getEmotionalVoiceParams(emotion: EmotionalState): VoiceParams {
  const { valence, arousal, dominance } = emotion;
  
  return {
    // High arousal = more variation
    temperature: 0.5 + (arousal * 0.3),
    
    // Positive valence = warmer tone
    warmth: 0.6 + (valence * 0.3),
    
    // High dominance = more confident delivery
    stability: 0.5 + (dominance * 0.2),
    
    // Emotional intensity affects pacing
    speed: arousal > 0.7 ? 1.05 : (arousal < 0.3 ? 0.85 : 0.95)
  };
}
```

### 6. 📡 Real-time Streaming Optimization
```typescript
// Implement chunked generation for low latency
async function* streamCSMGeneration(
  text: string,
  context: ConversationContext
): AsyncGenerator<AudioChunk> {
  // Split text into natural phrases
  const phrases = splitIntoPhrases(text);
  
  for (const phrase of phrases) {
    // Generate audio for each phrase
    const audio = await generateCSMAudio(phrase, context);
    
    // Yield chunk immediately for streaming
    yield {
      audio,
      phraseIndex: phrases.indexOf(phrase),
      isComplete: phrase === phrases[phrases.length - 1]
    };
    
    // Update context with generated audio
    context.segments.push({
      speaker: 15,
      text: phrase,
      audio
    });
  }
}
```

---

## 🧪 Testing Strategy

### 1. Voice Consistency Test
```javascript
// Test Maya maintains consistent voice across turns
async function testVoiceConsistency() {
  const conversation = [
    "Welcome, dear one. I've been expecting you.",
    "Yes, the patterns are revealing themselves to you now.",
    "Trust what your intuition is telling you."
  ];
  
  const audioSamples = [];
  for (const text of conversation) {
    const audio = await generateMayaVoice(text, { 
      useContext: true,
      previousAudio: audioSamples 
    });
    audioSamples.push(audio);
  }
  
  // Verify voice characteristics remain consistent
  const consistency = analyzeVoiceConsistency(audioSamples);
  assert(consistency.score > 0.85, "Voice should remain consistent");
}
```

### 2. Elemental Tone Test
```javascript
// Test elemental voice variations
async function testElementalVoices() {
  const testPhrase = "The path forward is becoming clear";
  const elements = ['air', 'fire', 'water', 'earth', 'aether'];
  
  for (const element of elements) {
    const audio = await generateMayaVoice(testPhrase, { element });
    const analysis = analyzeVoiceCharacteristics(audio);
    
    // Verify element-specific characteristics
    switch(element) {
      case 'air':
        assert(analysis.clarity > 0.8, "Air voice should be clear");
        break;
      case 'fire':
        assert(analysis.energy > 0.7, "Fire voice should be energetic");
        break;
      case 'water':
        assert(analysis.smoothness > 0.8, "Water voice should flow");
        break;
      case 'earth':
        assert(analysis.stability > 0.85, "Earth voice should be grounded");
        break;
      case 'aether':
        assert(analysis.mystique > 0.75, "Aether voice should be mystical");
        break;
    }
  }
}
```

### 3. Context Awareness Test
```javascript
// Test CSM uses conversation context effectively
async function testContextAwareness() {
  const context = new CSMConversationMemory();
  
  // Build conversation with emotional arc
  const turns = [
    { text: "I'm feeling lost", emotion: "confused" },
    { text: "Tell me more about these patterns", emotion: "curious" },
    { text: "I think I'm beginning to understand", emotion: "hopeful" }
  ];
  
  for (const turn of turns) {
    const response = await generateContextualResponse(turn, context);
    
    // Verify response acknowledges context
    assert(response.acknowledgesEmotion, "Should acknowledge emotional state");
    assert(response.buildsPrevious, "Should build on previous turns");
  }
}
```

---

## 🚀 Deployment Steps

### 1. Update Environment Variables
```bash
# .env.local
SESAME_PROVIDER=northflank
NORTHFLANK_SESAME_URL=https://your-csm-service.northflank.app
NORTHFLANK_SESAME_API_KEY=your-api-key
MAYA_VOICE_ID=maya_oracle_v1
MAYA_SPEAKER_ID=15
```

### 2. Initialize Maya's Voice Profile
```bash
# Clone Maya's reference audio
curl -X POST https://your-app.com/api/voice-cloning/clone \
  -F "audio_file=@maya_reference.wav" \
  -F "name=Maya Oracle" \
  -F "transcript=Welcome dear one, I've been expecting you." \
  -F "description=The Oracle voice of the Spiralogic System"
```

### 3. Test Voice Generation
```bash
# Test basic generation
curl -X POST https://your-app.com/api/voice/sesame \
  -H "Content-Type: application/json" \
  -d '{"text": "The patterns are revealing themselves to you now."}'

# Test with context
curl -X POST https://your-app.com/api/v1/enhanced/converse/stream \
  -G --data-urlencode "q=What do you see in my future?" \
  --data-urlencode "element=aether" \
  --data-urlencode "voice=true"
```

---

## 📊 Performance Metrics

### Target Benchmarks
- **First byte latency**: < 500ms
- **Complete phrase generation**: < 2s
- **Voice consistency score**: > 0.85
- **Emotional resonance accuracy**: > 0.75
- **Context coherence**: > 0.80

### Monitoring
```typescript
// Track CSM performance metrics
interface CSMMetrics {
  generationLatency: number;
  voiceConsistency: number;
  contextUtilization: number;
  emotionalAlignment: number;
  userSatisfaction: number;
}

async function trackCSMPerformance(
  request: VoiceRequest,
  response: VoiceResponse
): Promise<CSMMetrics> {
  return {
    generationLatency: response.duration,
    voiceConsistency: await analyzeConsistency(response.audio),
    contextUtilization: response.contextSegmentsUsed / request.contextSegments.length,
    emotionalAlignment: calculateEmotionalMatch(request.emotion, response.audioEmotion),
    userSatisfaction: await getUserFeedback(response.threadId)
  };
}
```

---

## 🎯 Next Steps

1. **Implement CSMConversationMemory** class
2. **Enhance SesameMayaRefiner** with context support
3. **Add elemental voice parameter mapping**
4. **Create comprehensive test suite**
5. **Deploy and monitor performance**
6. **Fine-tune based on user feedback**

---

## 🌈 Result

When fully integrated, Maya's voice will:
- **Remember** - Maintain consistency across entire conversations
- **Resonate** - Match emotional tone and energy
- **Flow** - Natural transitions between thoughts
- **Adapt** - Shift with elemental energies
- **Connect** - Build deeper rapport through voice

The CSM model ensures Maya doesn't just speak words - she embodies the Oracle's presence through every nuance of her voice.