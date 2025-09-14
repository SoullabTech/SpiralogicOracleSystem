# Sacred Core Migration Map

## ✅ Sacred Core Components (Preserve)

| Component | Location | Purpose | Status |
|-----------|----------|---------|--------|
| **SacredHoloflower** | `/components/sacred/SacredHoloflower.tsx` | Core interactive holoflower visualization | Active |
| **SacredHoloflowerWithAudio** | `/components/sacred/SacredHoloflowerWithAudio.tsx` | Audio-enhanced holoflower | Active |
| **SacredOracleExperience** | `/components/sacred/SacredOracleExperience.tsx` | Complete oracle experience flow | Active |
| **HoloflowerMotion** | `/components/sacred/HoloflowerMotion.tsx` | Motion dynamics system | Active |
| **HoloflowerMotionWithAudio** | `/components/sacred/HoloflowerMotionWithAudio.tsx` | Audio-motion sync | Active |
| **MotionOrchestrator** | `/components/motion/MotionOrchestrator.tsx` | Core motion engine | Active |
| **SacredAudioSystem** | `/components/audio/SacredAudioSystem.tsx` | Maya voice integration | Active |
| **OracleConversation** | `/components/oracle/OracleConversation.tsx` | Chat interface | Active |
| **SacredMicButton** | `/components/audio/SacredMicButton.tsx` | Voice input control | Active |
| **Sacred Portal API** | `/app/api/sacred-portal/route.ts` | Unified oracle endpoint | Active |
| **Oracle Holoflower API** | `/app/api/oracle-holoflower/route.ts` | Holoflower-specific endpoint | Active |

## ❌ Legacy/Duplicates (Remove/Archive)

| Component | Location | Reason | Action |
|-----------|----------|--------|--------|
| **HoloflowerViz variants** | `/components/holoflower/*` | Multiple duplicate implementations | Archive |
| **oracle-beta API** | `/api/oracle-beta/route.ts` | Duplicate endpoint | Remove |
| **oracle-cascade API** | `/api/oracle-cascade/route.ts` | Duplicate endpoint | Remove |
| **oracle-unified API** | `/api/oracle-unified/route.ts` | Duplicate endpoint | Remove |
| **oracle-insights API** | `/api/oracle-insights/route.ts` | Duplicate endpoint | Remove |
| **Multiple dashboards** | `/app-backup/*/dashboard/` | Redundant implementations | Archive |
| **Legacy agents** | `/apps/api/backend/src-legacy-backup/agents/` | Old agent system | Archive |
| **Duplicate test stubs** | Various test files | Testing artifacts | Remove |

## 🌙 Latent APIs (Preserve but Dormant)

| API | Location | Purpose | Activation Path |
|-----|----------|---------|-----------------|
| **Shadow API** | `/lib/sacred-apis/shadow.ts` | Shadow work integration | Feature flag: `ENABLE_SHADOW` |
| **Aether API** | `/lib/sacred-apis/aether.ts` | Ethereal connections | Feature flag: `ENABLE_AETHER` |
| **Docs API** | `/lib/sacred-apis/docs.ts` | Document intelligence | Feature flag: `ENABLE_DOCS` |
| **Collective API** | `/lib/sacred-apis/collective.ts` | Collective consciousness | Feature flag: `ENABLE_COLLECTIVE` |
| **Resonance API** | `/lib/sacred-apis/resonance.ts` | Vibrational matching | Feature flag: `ENABLE_RESONANCE` |

## 📚 Documentation Structure

| Category | Current Location | New Location | Content |
|----------|-----------------|--------------|---------|
| **Architecture** | Scattered `.md` files | `/docs/architecture/` | System diagrams, API specs |
| **UX/UI** | Various locations | `/docs/ux/` | Storyboards, motion specs |
| **Sacred/Philosophy** | Root and scattered | `/docs/sacred/` | Whitepapers, ritual design |
| **Business** | Root directory | `/docs/business/` | Market analysis, roadmap |
| **Developer** | Root directory | `/docs/developer/` | Setup guides, API docs |

## 🔄 Migration Steps

1. **Extract Sacred Core** → `/sacred-core/`
2. **Preserve Latent APIs** → `/sacred-core/src/sacred-apis/`
3. **Unify Oracle API** → Single endpoint with mode switching
4. **Reorganize Docs** → Clean `/docs/` structure
5. **Archive Legacy** → `/legacy-archive/` (not in new repo)

## 🎯 Final Structure

```
sacred-core/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── oracle/           # Unified API
│   │   ├── sacred-oracle/        # Main experience
│   │   └── page.tsx              # Landing
│   ├── components/
│   │   ├── sacred/               # Core components
│   │   ├── motion/               # Motion system
│   │   ├── audio/                # Audio system
│   │   └── oracle/               # Oracle UI
│   ├── sacred-apis/              # Latent APIs (dormant)
│   │   ├── shadow.ts
│   │   ├── aether.ts
│   │   ├── docs.ts
│   │   ├── collective.ts
│   │   └── resonance.ts
│   └── lib/
│       └── utils/
├── docs/
│   ├── architecture/
│   ├── ux/
│   ├── sacred/
│   ├── business/
│   └── developer/
└── public/
    └── assets/
```

## 🔐 Safeguards

- Latent APIs remain code-complete but UI-hidden
- Feature flags control activation
- No prescriptive guidance in active state
- Reflective prompts only
- User sovereignty preserved