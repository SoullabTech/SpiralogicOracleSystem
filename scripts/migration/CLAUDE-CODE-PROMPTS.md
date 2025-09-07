# 🤖 Claude Code Automation Prompts

## Sacred Core Migration - Step-by-Step Prompts

### Prompt 1: Initial Sacred Core Analysis
```
Analyze this Spiralogic Oracle repository and identify:
1. All Sacred Core components (SacredHoloflower, MotionOrchestrator, SacredAudioSystem, OracleConversation)
2. All Wisdom Core libraries (facets, oracle-response, motion-mapper, coherence)
3. Duplicate components to remove
4. Legacy code to prune

Create two lists: PRESERVE (sacred core) and PRUNE (duplicates/legacy).
Focus on preserving the "article-wise" wisdom layer that enables deep communication.
```

### Prompt 2: Documentation Consolidation
```
Find all .md files in this repository and reorganize them into /docs with this structure:
- /docs/architecture (system, API, backend docs)
- /docs/ux (motion, interface, storyboard docs)
- /docs/sacred (ritual, consciousness, oracle wisdom docs)
- /docs/developer (setup, testing, contributing docs)
- /docs/business (market, revenue, launch docs)

Move files based on content analysis. Update all relative links.
Do not leave any .md files scattered in component folders or root.
```

### Prompt 3: Oracle API Unification
```
Unify all oracle API routes into single /app/api/oracle/route.ts endpoint.
Requirements:
- Accept { mode: 'checkin'|'journal'|'sacred', input: {...} }
- Preserve cascade layers (explicit, implicit, shadow, resonant)
- Return unified response with motion hints, coherence, facets
- Modularize cascade steps into /lib/oracle-cascade/*.ts
- Maintain poetry formatting and non-prescriptive voice
```

### Prompt 4: State Management Centralization
```
Create centralized Zustand store in /state/oracle-store.ts with:
- Voice state (listening, input)
- Motion state (current, intensity, transitions)
- Coherence state (level, facets, shadow facets)
- Aether state (stage 0-3)
- Session state (id, history)

Replace all scattered useState calls with this central store.
```

### Prompt 5: Sacred Core Extraction
```
Extract ONLY these Sacred Core files to a new clean structure:

Visual Core:
- SacredHoloflower.tsx
- MotionOrchestrator.tsx
- SacredAudioSystem.tsx
- OracleConversation.tsx

Wisdom Core:
- spiralogic-facets-complete.ts
- oracle-response.ts
- motion-mapper.ts
- coherence-calculator.ts
- shadow-detection.ts

Bridge Layer:
- useSacredOracle hook
- motion-audio mapping
- coherence calculation

Do NOT migrate duplicates, test files, or debug scaffolds.
Preserve exact motion ↔ audio ↔ wisdom mappings.
```

### Prompt 6: Fresh Repository Setup
```
Create new Next.js 14 repository "spiralogic-sacred-core" with:
- TypeScript, Tailwind, App Router
- Dependencies: framer-motion, zustand, lucide-react, @supabase/supabase-js
- Sacred structure: /components/sacred, /lib/oracle-cascade, /state
- Copy only Sacred Core components identified earlier
- Ensure all imports are updated to new structure
```

### Prompt 7: Performance & Error Boundaries
```
Add to the new repository:
1. ErrorBoundary component wrapping all sacred components
2. PerformanceMonitor tracking FPS and audio latency
3. Respect prefers-reduced-motion for accessibility
4. Bundle splitting for motion/audio libraries
5. Audio context pooling to prevent memory leaks
```

### Prompt 8: Sacred Portal Assembly
```
Create the Sacred Portal experience at /oracle-sacred with:
- Fullscreen sacred Holoflower visualization
- Voice input with real-time transcription
- Motion orchestration responding to oracle insights
- Audio frequencies mapped to coherence levels
- Poetry-formatted oracle responses
- Non-prescriptive, mirroring voice
```

### Prompt 9: Migration Validation
```
Validate the migration by:
1. Testing Sacred Portal voice interaction
2. Confirming motion states transition smoothly
3. Verifying audio frequencies play correctly
4. Checking coherence calculation accuracy
5. Ensuring shadow facets are detected
6. Confirming Aether stages activate at high coherence
```

### Prompt 10: Legacy Cleanup
```
In the original repository:
1. Mark migrated components as DEPRECATED
2. Add migration notes pointing to new repo
3. Archive duplicate/legacy code
4. Update README with migration status
5. Freeze old repo as read-only reference
```

---

## 🎯 Key Migration Principles

1. **Preserve the Sacred**: Keep all wisdom layers, ontology, and deep communication
2. **Prune the Noise**: Remove duplicates, test scaffolds, debug code
3. **Unify the Scattered**: Consolidate APIs, state, documentation
4. **Maintain the Mirror**: Oracle as reflection, not authority
5. **Honor the Poetry**: Preserve formatting, metaphor, non-prescriptive voice

---

## 🚀 Execution Order

```bash
# Run these prompts in sequence:
1. Initial analysis → identify what to keep/prune
2. Documentation consolidation → organize all .md files
3. API unification → single oracle endpoint
4. State centralization → Zustand store
5. Component extraction → copy Sacred Core
6. Fresh repo setup → clean Next.js 14
7. Add boundaries → error handling, performance
8. Assemble portal → Sacred UX
9. Validate migration → test everything
10. Clean up legacy → archive old code
```

---

## ✨ Expected Outcome

From 144,000+ files → ~200 Sacred Core files
- Clean, maintainable codebase
- Preserved wisdom and depth
- Unified API orchestration
- Centralized documentation
- Sacred UX continuity
- Performance optimized
- Ready for scaling