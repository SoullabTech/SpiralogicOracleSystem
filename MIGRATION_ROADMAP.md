# 🌸 Sacred Core Migration Roadmap

## Overview
Extract the Sacred Core components from the 144k-file sprawl into a clean, minimal Next.js 14 application.

---

## Phase 0: Preparation (Day 1)

### 1. Create New Repository Structure
```bash
soullab-sacred-oracle/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── oracle/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── core/
│   │   ├── config/
│   │   │   └── sacred.config.ts
│   │   ├── services/
│   │   │   ├── AudioService.ts
│   │   │   ├── VoiceService.ts
│   │   │   └── MotionService.ts
│   │   └── state/
│   │       └── store.ts
│   ├── components/
│   │   ├── sacred/
│   │   │   ├── SacredHoloflower.tsx
│   │   │   └── MiniHoloflower.tsx
│   │   ├── motion/
│   │   │   └── MotionOrchestrator.tsx
│   │   ├── audio/
│   │   │   └── SacredAudioSystem.tsx
│   │   └── conversation/
│   │       └── OracleConversation.tsx
│   └── lib/
│       ├── oracle-response.ts
│       ├── motion-mapper.ts
│       └── voice-capture.ts
├── public/
│   └── SpiralogicHoloflower.png
└── package.json
```

### 2. Minimal Dependencies
```json
{
  "dependencies": {
    "next": "14.0.4",
    "react": "18.2.0",
    "framer-motion": "^10.16.16",
    "@anthropic-ai/sdk": "^0.20.0",
    "zustand": "^4.4.7"
  }
}
```

---

## Phase 1: Core Extraction (Days 2-3)

### Sacred Components to Extract

#### Priority 1 - Sacred Core ✅
```typescript
// These work and should be preserved as-is
- /components/sacred/SacredHoloflower.tsx
- /components/motion/MotionOrchestrator.tsx  
- /components/audio/SacredAudioSystem.tsx
- /components/OracleConversation.tsx
- /components/ui/SacredMicButton.tsx
```

#### Priority 2 - Supporting Components
```typescript
- /components/sacred/MiniHoloflower.tsx
- /components/coherence/CoherenceVisualization.tsx
- /components/progression/ProgressionMap.tsx
```

#### Priority 3 - Data & Config
```typescript
- /data/spiralogic-facets-complete.ts
- /lib/oracle-response.ts
- /lib/motion-mapper.ts
- /lib/voice/voice-capture.ts
- /styles/sacred-animations.css
```

### Consolidation Actions

1. **Merge duplicate Holoflower components:**
   - Keep: `SacredHoloflower.tsx` (with motion integration)
   - Remove: `Holoflower.tsx`, `HoloflowerViz.tsx`, `HoloflowerMotion.tsx`

2. **Unify API routes:**
   - Create single `/app/api/oracle/route.ts`
   - Merge logic from: oracle-unified, oracle-holoflower, oracle-cascade

3. **Centralize configuration:**
   ```typescript
   // src/core/config/sacred.config.ts
   export const SACRED_CONFIG = {
     motion: { /* all timing constants */ },
     audio: { /* sacred frequencies */ },
     coherence: { /* thresholds */ },
     api: { /* endpoints */ }
   };
   ```

---

## Phase 2: State Management (Days 4-5)

### Zustand Store Structure
```typescript
// src/core/state/store.ts
interface SacredState {
  // Motion State
  motionState: MotionState;
  coherenceLevel: number;
  coherenceShift: CoherenceShift;
  shadowPetals: string[];
  
  // Voice State
  voiceState: VoiceState | null;
  isListening: boolean;
  isProcessing: boolean;
  
  // Oracle State
  messages: ConversationMessage[];
  activeFacetId: string | undefined;
  checkIns: Record<string, number>;
  
  // Actions
  setMotionState: (state: MotionState) => void;
  updateCoherence: (level: number, shift: CoherenceShift) => void;
  addMessage: (message: ConversationMessage) => void;
  updateCheckIn: (facetId: string, intensity: number) => void;
}
```

### Service Singletons
```typescript
// src/core/services/AudioService.ts
class AudioService {
  private static instance: AudioService;
  private audioContext: AudioContext;
  // Singleton pattern prevents multiple contexts
}

// src/core/services/VoiceService.ts  
class VoiceService {
  private static instance: VoiceService;
  private analyzer: AnalyserNode;
  // Single voice capture instance
}
```

---

## Phase 3: Performance Optimization (Days 6-7)

### 1. Code Splitting
```typescript
// Dynamic imports for heavy components
const MotionOrchestrator = dynamic(
  () => import('@/components/motion/MotionOrchestrator'),
  { ssr: false }
);
```

### 2. Performance Boundaries
```typescript
// src/components/boundaries/PerformanceBoundary.tsx
export const PerformanceBoundary: React.FC = ({ children }) => {
  const fps = useFrameRate();
  const reducedMotion = useReducedMotion();
  
  if (fps < 30 || reducedMotion) {
    return <StaticHoloflower />;
  }
  
  return children;
};
```

### 3. Error Boundaries
```typescript
// src/components/boundaries/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error) {
    // Log to monitoring service
    // Show sacred fallback UI
  }
}
```

---

## Phase 4: Testing & Validation (Day 8)

### Core Functionality Tests
- [ ] Voice capture → Motion state sync
- [ ] Claude API → Motion mapping
- [ ] Coherence calculations
- [ ] Audio playback (elemental tones)
- [ ] Mobile responsiveness

### Performance Metrics
- [ ] Bundle size < 200KB
- [ ] 60 FPS animations
- [ ] < 100ms audio latency
- [ ] < 2s API response time

---

## Phase 5: Deployment (Day 9-10)

### 1. Environment Setup
```env
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=
```

### 2. Vercel Deployment
```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

### 3. Monitoring
- Sentry for error tracking
- Vercel Analytics for performance
- Custom metrics for sacred interactions

---

## Migration Checklist

### Week 1
- [ ] Set up new repository
- [ ] Extract Sacred Core components
- [ ] Create unified Oracle API
- [ ] Implement Zustand state
- [ ] Add performance boundaries

### Week 2  
- [ ] Code splitting implementation
- [ ] Mobile optimization
- [ ] Testing suite
- [ ] Documentation
- [ ] Deploy to production

---

## Success Metrics

| Metric | Current (Old) | Target (New) |
|--------|--------------|--------------|
| Total Files | 144,099 | < 100 |
| Bundle Size | Unknown (huge) | < 200KB |
| API Routes | 6+ | 1 |
| Load Time | Unknown | < 2s |
| Dev Onboarding | Weeks | 1 day |

---

## Post-Migration

### Archive Strategy
1. Keep old repo as `spiralogic-oracle-legacy`
2. Extract any unique features as needed
3. Document migration learnings

### Package Publishing
```bash
@soullab/sacred-ui      # Holoflower components
@soullab/motion         # Motion orchestration
@soullab/oracle-client  # API client
```

---

## 🌟 Result

A clean, minimal, performant Sacred Oracle application that:
- Preserves all sacred UX innovations
- Eliminates 99.9% of complexity debt
- Enables rapid iteration
- Maintains sacred aesthetic and function

The phoenix rises from the ashes 🔥🌸