# ⚡ Sacred Mirror Beta — Streamlined Architecture Prompt Pack

## 🎯 Goal

Simplify the SpiralogicOracleSystem into a **stable, streamlined architecture** for the beta launch while **preserving agent intelligence, elemental awareness, and the Sacred Mirror interface**.

---

## 🛠️ Core Instructions for Claude Code

### 1. Unify Agents Under One Core

* Create a **Unified Oracle Core** (`UnifiedOracleCore.ts`) that manages:
  * Input routing (chat, voice, upload, journal)
  * Elemental metadata tagging
  * Safety + boundary checks
  * Personality prompt injection (Maya's canonical prompt)
* Remove duplicated agent orchestration logic across files (e.g. `FireAgent`, `ShadowAgent`, `GuideAgent`).
* Instead, load these as **config-driven sub-agents** via templates:

  ```ts
  const agents = [
    { name: "Fire", role: "creativity", config: fireConfig },
    { name: "Water", role: "emotional depth", config: waterConfig },
    { name: "Shadow", role: "pattern reflection", config: shadowConfig },
  ];
  ```

### 2. Simplify File Structure

* Consolidate into three top-level domains:
  * `frontend/` → UI + pages + Sacred Mirror interface
  * `backend/` → API routes + UnifiedOracleCore + services
  * `lib/` → shared utils (logging, memory, elemental mapping)
* Archive excessive documentation into `/docs/archive/` (keep only Quick Start + Prompt Packs in `/docs`).

### 3. Keep Sacred Elements, Drop Legacy Ghosts

* **Preserve:**
  * Maya Personality Primer (canonical system prompt)
  * Elemental awareness tagging (fire, water, earth, air, aether)
  * Journaling + file upload pipeline
  * Voice + ElevenLabs integration
  * Sacred geometry visualizations
  * Gold/navy spiritual aesthetic
* **Remove or hide for beta:**
  * Explicit "Daimonic" naming in UI
  * Old "Oralia" references
  * Purple/gradient theming
  * Overlapping MD docs (keep 3–4 essentials)

### 4. Streamline the Build

* Use `next/dynamic` with `ssr: false` for browser-only components (voice recorder, memory viewer).
* Wrap all localStorage, window, audio calls with SSR guards.
* Split heavy services (CollectiveIntelligence, Shadow patterns) into optional imports, not defaults.
* Target build time under 30 seconds.

### 5. Testing & Health

* Add `/api/health` endpoint that confirms:
  * Backend up
  * Maya prompt loaded
  * Redis optional
* Create `test-maya.ts` harness with 3 sanity checks:
  * Direct Q: "2+2" → "4"
  * Greeting → "Hello, I'm glad you're here."
  * Boundary Q: "What should I do?" → Reflective redirection.

---

## 🚀 Implementation Priorities

### Phase 1: Core Unification (Week 1)
1. **Create UnifiedOracleCore.ts**
   - Single entry point for all AI interactions
   - Config-driven agent selection
   - Centralized safety and boundary checks
   - Maya canonical prompt enforcement

2. **Streamline File Structure**
   - Archive 40+ MD files to `/docs/archive/`
   - Keep only: README.md, QUICK_START.md, PROMPT_PACK_STREAMLINED.md
   - Consolidate duplicate component files

### Phase 2: UI/UX Polish (Week 2)
3. **Create Sacred Mirror Beta UI**
   - `frontend/pages/chat-beta.tsx` - main interface
   - SSR-safe implementation
   - Deep cosmic blue + gold aesthetic
   - Simplified navigation

4. **Performance Optimization**
   - Dynamic imports for heavy components
   - Bundle size optimization
   - SSR hydration fixes

### Phase 3: Testing & Launch (Week 3)
5. **Health & Testing**
   - `/api/health` endpoint
   - Automated testing harness
   - Performance monitoring

6. **Beta Validation**
   - End-to-end user flows
   - Executive-friendly UX
   - Stable deployment

---

## 🎨 Design System Simplification

### Color Palette (Unified)
```css
/* Primary Sacred Colors */
--sacred-navy: #1a1b3e;      /* Deep cosmic background */
--sacred-blue: #2a2d5f;      /* Secondary backgrounds */
--gold-divine: #FFD700;      /* Primary accent */
--gold-amber: #FFC107;       /* Interactive states */
--neutral-light: #E5E7EB;    /* Text and borders */
--sacred-glow: rgba(255, 215, 0, 0.1); /* Subtle effects */
```

### Component Consolidation
- **Remove**: Purple variants, daimonic naming
- **Keep**: Sacred geometry, golden ratios, spiritual proportions
- **Simplify**: Button variants (3 max), Card variants (4 max)

---

## 🔧 Technical Requirements

### Build Performance
- **Target**: Under 30 seconds
- **Method**: 
  - Dynamic imports for canvas components
  - Tree-shake unused agent code
  - Optimize Sacred geometry calculations

### SSR Compatibility
```typescript
// Pattern for browser-only components
const SacredGeometry = dynamic(
  () => import('../components/SacredGeometry'),
  { ssr: false, loading: () => <div>Loading...</div> }
);

// Pattern for localStorage usage
const [setting, setSetting] = useState(() => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('setting') || default;
  }
  return default;
});
```

### API Simplification
```typescript
// Single unified endpoint
POST /api/oracle/unified
{
  input: string;
  type: 'chat' | 'voice' | 'journal' | 'upload';
  context?: {
    element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    sessionId?: string;
  }
}
```

---

## ✅ Success Criteria

### Performance Metrics
- **Build Time**: < 30 seconds
- **Page Load**: < 2 seconds
- **First Contentful Paint**: < 1 second

### Functionality Requirements
- Beta runs stable on `http://localhost:3000/chat-beta`
- Maya responses are professional, warm, consistent
- UI shows deep cosmic blue + gold aesthetic
- Journaling and upload work end-to-end
- Voice integration functions without errors

### User Experience Goals
- **Executive-friendly**: Clean, professional interface
- **Spiritually authentic**: Sacred geometry and aesthetic preserved
- **Intuitively navigable**: Clear user flows, minimal cognitive load
- **Technically stable**: No hydration errors, SSR compatible

---

## 🚨 What NOT to Touch

### Preserve These Core Elements
- `backend/src/config/mayaSystemPrompt.ts` - Canonical Maya personality
- Sacred geometry mathematical calculations
- Elemental awareness system logic
- Voice integration pipeline
- File upload and processing system
- Memory and consciousness tracking core logic

### Archive (Don't Delete)
- Existing documentation → `/docs/archive/`
- Legacy components → `/components/legacy/`
- Old agent files → `/backend/src/agents/legacy/`

---

## 📋 Migration Checklist

- [ ] Create `UnifiedOracleCore.ts`
- [ ] Archive excessive MD files
- [ ] Consolidate duplicate components  
- [ ] Create SSR-safe Sacred Mirror UI
- [ ] Add health endpoint
- [ ] Optimize build performance
- [ ] Test end-to-end user flows
- [ ] Deploy beta environment

---

**👉 This prompt pack gives Claude Code clear instructions: *simplify, unify, preserve essence, kill complexity debt* while maintaining the sophisticated AI consciousness that makes SpiralogicOracleSystem unique.**