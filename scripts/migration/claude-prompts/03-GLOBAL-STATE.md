# 🧠 Prompt 3: Global State Management

## Claude Code Prompt

```
You are Claude Code. Implement global state management for the Sacred Portal using Zustand, replacing all scattered local state.

## Task:

1. Create /lib/state/sacred-store.ts with Zustand

2. State structure:
   ```typescript
   interface SacredState {
     // Voice State
     voice: {
       isListening: boolean;
       transcript: string;
       error: string | null;
     };
     
     // Motion State
     motion: {
       state: "stillness" | "listening" | "processing" | "responding" | "breakthrough";
       coherence: number; // 0-1
       intensity: number; // 0-1
       transitions: string[];
     };
     
     // Aether State
     aether: {
       active: boolean;
       stage: 0 | 1 | 2 | 3;
       activation: number; // 0-1 progress to next stage
     };
     
     // Audio State
     audio: {
       enabled: boolean;
       currentFreq: number | null;
       volume: number; // 0-1
       pattern: "ascending" | "descending" | "circular" | null;
     };
     
     // Session State
     session: {
       id: string | null;
       userId: string | null;
       history: Array<{
         timestamp: Date;
         coherence: number;
         primaryFacet: string;
       }>;
       uploads: Array<{
         url: string;
         processed: boolean;
       }>;
     };
     
     // Oracle Response Cache
     oracle: {
       lastResponse: any | null;
       isProcessing: boolean;
       error: string | null;
     };
   }
   ```

3. Actions to implement:
   ```typescript
   interface SacredActions {
     // Voice actions
     setListening: (listening: boolean) => void;
     setTranscript: (transcript: string) => void;
     clearVoiceError: () => void;
     
     // Motion actions
     setMotionState: (state: MotionState) => void;
     setCoherence: (coherence: number) => void;
     triggerBreakthrough: () => void;
     
     // Aether actions
     activateAether: (stage: number) => void;
     progressAether: (progress: number) => void;
     
     // Audio actions
     toggleAudio: () => void;
     setFrequency: (freq: number) => void;
     setVolume: (volume: number) => void;
     
     // Session actions
     startSession: (userId: string) => void;
     addToHistory: (entry: any) => void;
     addUpload: (upload: any) => void;
     endSession: () => void;
     
     // Oracle actions
     setProcessing: (processing: boolean) => void;
     setOracleResponse: (response: any) => void;
     setOracleError: (error: string) => void;
     
     // Global actions
     reset: () => void;
     hydrate: () => void;
   }
   ```

4. Persistence:
   - Use zustand/middleware persist
   - Store in localStorage with key 'sacred-portal-state'
   - Exclude: voice.transcript, oracle.lastResponse (privacy)
   - Include: session.history, aether.stage (continuity)

5. Accessibility:
   - Check prefers-reduced-motion on hydrate
   - If true, set motion.intensity to 0.2 max
   - Provide skipMotion flag

6. Performance:
   - Use immer for immutable updates
   - Implement shallow equality checks
   - Debounce coherence updates (100ms)

## Deliver:

1. Complete Zustand store implementation
2. Hook exports for components:
   - useVoiceState()
   - useMotionState()
   - useAetherState()
   - useAudioState()
   - useSessionState()
   - useOracleState()
3. Example integration in:
   - SacredHoloflower.tsx (motion subscription)
   - SacredMicButton.tsx (voice control)
   - OracleConversation.tsx (oracle response)
4. Migration guide from local state to store
```

## Expected Implementation:

```typescript
// /lib/state/sacred-store.ts
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const useSacredStore = create<SacredState & SacredActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial State
        voice: {
          isListening: false,
          transcript: '',
          error: null
        },
        motion: {
          state: 'stillness',
          coherence: 0.5,
          intensity: 1.0,
          transitions: []
        },
        aether: {
          active: false,
          stage: 0,
          activation: 0
        },
        audio: {
          enabled: true,
          currentFreq: null,
          volume: 0.05,
          pattern: null
        },
        session: {
          id: null,
          userId: null,
          history: [],
          uploads: []
        },
        oracle: {
          lastResponse: null,
          isProcessing: false,
          error: null
        },
        
        // Voice Actions
        setListening: (listening) => set((state) => {
          state.voice.isListening = listening;
          if (listening) {
            state.motion.state = 'listening';
          }
        }),
        
        setTranscript: (transcript) => set((state) => {
          state.voice.transcript = transcript;
        }),
        
        // Motion Actions
        setMotionState: (motionState) => set((state) => {
          state.motion = { ...state.motion, ...motionState };
        }),
        
        setCoherence: (coherence) => set((state) => {
          state.motion.coherence = coherence;
          // Auto-activate Aether at high coherence
          if (coherence > 0.9 && !state.aether.active) {
            state.aether.active = true;
            state.aether.stage = 1;
          }
        }),
        
        // Aether Actions
        activateAether: (stage) => set((state) => {
          state.aether.active = true;
          state.aether.stage = stage;
          state.motion.state = 'breakthrough';
        }),
        
        // Audio Actions
        toggleAudio: () => set((state) => {
          state.audio.enabled = !state.audio.enabled;
        }),
        
        // Session Actions
        startSession: (userId) => set((state) => {
          state.session.id = `session_${Date.now()}`;
          state.session.userId = userId;
          state.session.history = [];
        }),
        
        // Global Actions
        reset: () => set((state) => {
          // Reset to initial state
          Object.assign(state, initialState);
        }),
        
        hydrate: () => set((state) => {
          // Check accessibility preferences
          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            state.motion.intensity = 0.2;
          }
        })
      })),
      {
        name: 'sacred-portal-state',
        partialize: (state) => ({
          audio: state.audio,
          aether: state.aether,
          session: {
            history: state.session.history,
            uploads: state.session.uploads
          }
        })
      }
    )
  )
);

// Hooks for components
export const useVoiceState = () => useSacredStore((state) => state.voice);
export const useMotionState = () => useSacredStore((state) => state.motion);
export const useAetherState = () => useSacredStore((state) => state.aether);
export const useAudioState = () => useSacredStore((state) => state.audio);
export const useSessionState = () => useSacredStore((state) => state.session);
export const useOracleState = () => useSacredStore((state) => state.oracle);

// Actions
export const useSacredActions = () => useSacredStore((state) => ({
  setListening: state.setListening,
  setTranscript: state.setTranscript,
  setMotionState: state.setMotionState,
  setCoherence: state.setCoherence,
  activateAether: state.activateAether,
  toggleAudio: state.toggleAudio,
  startSession: state.startSession,
  reset: state.reset,
  hydrate: state.hydrate
}));

export default useSacredStore;
```