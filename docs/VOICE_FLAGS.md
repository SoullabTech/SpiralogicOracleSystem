# Voice Flags

## Beta Configuration (Current)
- **Beta default**: Sesame + Maya (fixed)
  - `VOICE_PROVIDER=sesame`
  - `SESAME_VOICE=maya`
  - `NEXT_PUBLIC_VOICE_SELECTION_ENABLED=false`

## Future Configuration (ElevenLabs)
- **Enable ElevenLabs later**
  - `ELEVENLABS_ENABLED=true`
  - `ELEVENLABS_API_KEY=...`
  - `ELEVENLABS_VOICE_ID=...`
  - Optionally: `VOICE_PROVIDER=elevenlabs`
  - Flip UI: `NEXT_PUBLIC_VOICE_SELECTION_ENABLED=true`

## Implementation Architecture

### Provider System
- **Unified API**: Single `speak()` function routes through provider configuration
- **Feature-flagged**: Maya locked in beta, ElevenLabs scaffolded behind flags
- **Extensible**: Easy to add new providers without refactoring

### Components
- `lib/voice/config.ts` - Voice resolution and selection logic
- `lib/voice/speak.ts` - Main TTS entry point with provider routing
- `lib/voice/providers/elevenlabs.ts` - ElevenLabs TTS implementation
- `hooks/useVoice.ts` - React hook for voice management
- `components/settings/VoiceSelector.tsx` - Voice selection UI (hidden in beta)

### Feature Flags
- `VOICE_PROVIDER` - Which TTS provider to use ('sesame' | 'elevenlabs')
- `ELEVENLABS_ENABLED` - Enable ElevenLabs provider
- `NEXT_PUBLIC_VOICE_SELECTION_ENABLED` - Show voice selection UI
- Configuration handled in `lib/config/features.ts`

## Usage Examples

### Beta (Current)
```typescript
import { speak } from '@/lib/voice/speak';

// Always uses Maya via Web Speech API
const audioBlob = await speak("Hello from the Oracle");
```

### Future (With Selection)
```typescript
import { speak } from '@/lib/voice/speak';

// Uses configured provider, can override voice
const audioBlob = await speak("Hello", { voiceId: 'specific-voice-id' });
```

## Why This Approach
- **Stability now**: One fixed voice = fewer moving parts in beta
- **Flip-ready later**: Flags + single speak() entry let you turn on ElevenLabs/selection without refactors  
- **Identity**: Maya remains the Oracle's voice while people learn to trust the mirror
- **Extensible**: Add archetypal packs (Mentor, Dreamer, Healer…) as curated presets later