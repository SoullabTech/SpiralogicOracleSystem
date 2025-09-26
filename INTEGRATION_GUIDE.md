# 🌟 Psychospiritual Intelligence System - Integration Guide

> **Complete integration guide for all newly built components**
> Auto-symbol extraction, metrics engine, Obsidian sync, Timeline UI, Admin Panel

---

## 📦 What's Been Built

### 1. **Symbol Extraction Engine** ✅
**Location:** `/lib/intelligence/SymbolExtractionEngine.ts`

Automatically extracts from MAIA conversations:
- Symbolic language (river, mirror, mountain, etc.)
- Archetypal patterns (Seeker, Shadow, Healer, etc.)
- Emotional states (joy, fear, clarity, etc.)
- Milestone moments (breakthrough, threshold, awakening)
- Narrative themes (The Descent, Shadow Integration, etc.)

**Key Features:**
- Pattern-based extraction with confidence scores
- Elemental association (fire/water/earth/air/aether)
- Auto-tracking to soulprint
- Batch processing support

---

### 2. **Psychospiritual Metrics Engine** ✅
**Location:** `/lib/metrics/PsychospiritualMetricsEngine.ts`

Computes comprehensive analytics:
- Growth Index (0-1 composite score)
- Archetype Coherence (tension detection)
- Emotional Landscape (drift, volatility, repressed states)
- Shadow Integration Score
- Narrative Progression (thread coherence, breakthroughs)
- Symbolic Evolution (diversity, stagnation risk)

**Key Features:**
- No PII storage
- Aggregated multi-user metrics
- Real-time alerts & recommendations
- TypeScript SDK + REST API

---

### 3. **Obsidian Markdown Exporter** ✅
**Location:** `/lib/obsidian/ObsidianExporter.ts`

Exports soulprint data to Obsidian vault:
- User profiles with metrics
- Symbol pages with backlinks
- Milestone journals
- Growth reports
- Drift alerts

**Vault Structure:**
```
/Volumes/T7 Shield/ObsidianVaults/SoullabDevTeam/AIN/
├── Users/
│   └── {userId}/
│       ├── Profile.md
│       └── ...
├── Symbols/
│   ├── river.md
│   ├── mirror.md
│   └── ...
├── Milestones/
│   └── {userId}/
│       └── 2025-09-26-breakthrough.md
├── Growth/
│   └── {userId}/
│       └── growth-2025-09-26.md
└── Alerts/
    └── {userId}/
        └── alerts-2025-09-26.md
```

---

### 4. **Session Timeline UI** ✅
**Location:** `/components/SessionTimeline.tsx`

React component for visualizing journey:
- Chronological event stream
- Filter by type (milestones, symbols, phases, etc.)
- Visual significance indicators
- Element tags
- Relative timestamps

**Usage:**
```tsx
import { SessionTimeline } from '@/components/SessionTimeline';

<SessionTimeline
  soulprint={soulprint}
  maxEvents={50}
  showFilters={true}
/>
```

---

### 5. **Admin Override Panel** ✅
**Location:** `/components/AdminOverridePanel.tsx`

Full CRUD interface for soulprints:
- Add/edit symbols manually
- Force archetype shifts
- Adjust elemental balance
- Create milestones
- Override metrics
- Export to Obsidian
- Reset soulprint (danger zone)

**Usage:**
```tsx
import { AdminOverridePanel } from '@/components/AdminOverridePanel';

<AdminOverridePanel
  soulprint={soulprint}
  onUpdate={(updates) => { /* handle updates */ }}
  onExport={() => { /* trigger export */ }}
  onReset={() => { /* reset soulprint */ }}
/>
```

---

## 🚀 Quick Start Integration

### Step 1: Auto-Extract Symbols from MAIA Conversations

Add to your MAIA orchestrator:

```typescript
import { symbolExtractor } from '@/lib/intelligence/SymbolExtractionEngine';

// After MAIA generates a response
const aiResponse = await callClaude(userMessage);

// Auto-extract and track
await symbolExtractor.extract(aiResponse, userId);

// Response is automatically tracked in soulprint
```

### Step 2: Query Metrics

```typescript
import { metricsEngine } from '@/lib/metrics/PsychospiritualMetricsEngine';

const snapshot = metricsEngine.generateComprehensiveSnapshot(userId);

console.log('Growth Score:', snapshot?.growthIndex.overallScore);
console.log('Alerts:', snapshot?.alerts);
console.log('Recommendations:', snapshot?.recommendations);
```

### Step 3: Export to Obsidian

```typescript
import { obsidianExporter } from '@/lib/obsidian/ObsidianExporter';

// Export single user
const result = await obsidianExporter.exportSoulprint(userId);
console.log('Exported files:', result.files);

// Export all users
const allResult = await obsidianExporter.exportAll();
console.log('Total files:', allResult.totalFiles);
```

### Step 4: Display Timeline

```tsx
import { soulprintTracker } from '@/lib/beta/SoulprintTracking';
import { SessionTimeline } from '@/components/SessionTimeline';

export function UserJourney({ userId }: { userId: string }) {
  const soulprint = soulprintTracker.getSoulprint(userId);

  if (!soulprint) return <div>No journey data</div>;

  return <SessionTimeline soulprint={soulprint} />;
}
```

---

## 🔌 API Endpoints

### Symbol Extraction
```bash
POST /api/intelligence/extract-symbols
Content-Type: application/json

{
  "text": "I felt like crossing a river...",
  "userId": "user_123",
  "autoTrack": true
}
```

### Metrics Query
```bash
GET /api/metrics/psychospiritual?mode=snapshot&userId=user_123
GET /api/metrics/psychospiritual?mode=aggregated
```

### Obsidian Export
```bash
POST /api/obsidian/export
Content-Type: application/json

{
  "userId": "user_123"
}
```

### Admin Operations
```bash
POST /api/admin/soulprint
Content-Type: application/json

{
  "action": "add-symbol",
  "userId": "user_123",
  "data": {
    "symbol": "Phoenix",
    "context": "Rising from the ashes",
    "elementalResonance": "fire"
  }
}
```

---

## 🎨 Demo Page

**URL:** `/demo/timeline`

Features:
- Live symbol extraction tester
- Interactive timeline
- Admin panel overlay
- Export functionality

Try it to see everything in action!

---

## 🧩 Integration with MAIA

### Option 1: Automatic Extraction (Recommended)

Add to `FieldIntelligenceMaiaOrchestrator.ts`:

```typescript
import { symbolExtractor } from '@/lib/intelligence/SymbolExtractionEngine';

async function processMAIAResponse(userId: string, response: string) {
  // Extract symbols automatically
  await symbolExtractor.extract(response, userId);

  // Response is now enriched with symbolic data
  return response;
}
```

### Option 2: Manual Tracking

```typescript
import { soulprintTracker } from '@/lib/beta/SoulprintTracking';

// Track specific events
soulprintTracker.trackSymbol(userId, 'River', 'User mentioned crossing threshold', 'water');
soulprintTracker.trackArchetypeShift(userId, 'Healer', { shadowWork: true });
soulprintTracker.addMilestone(userId, 'breakthrough', 'Major insight', 'pivotal');
```

### Option 3: Hybrid Approach

Use auto-extraction for bulk processing, manual tracking for key moments.

---

## 📊 Metrics Dashboard (Build This Next)

Suggested components for `/maia-monitor` or `/maia-analytics`:

1. **Growth Chart** — Line graph of Growth Index over time
2. **Archetype Wheel** — Circular visualization of active archetypes
3. **Elemental Balance Radar** — Pentagon chart for 5 elements
4. **Timeline View** — Use `SessionTimeline` component
5. **Alert Panel** — Real-time drift detection
6. **Symbol Cloud** — Word cloud of most frequent symbols

---

## 🔐 Privacy & Ethics

**Safe to use:**
- Symbolic/archetypal tracking (metaphorical)
- Aggregated statistics
- Personal growth journaling
- Beta user analytics

**Not for:**
- Clinical diagnosis
- Medical treatment decisions
- HIPAA-covered health records
- Sensitive PII storage

---

## 🧪 Testing

Run demo script:
```bash
npx tsx lib/metrics/demo.ts
```

Visit demo page:
```
http://localhost:3000/demo/timeline
```

Test symbol extraction:
```typescript
import { symbolExtractor } from '@/lib/intelligence/SymbolExtractionEngine';

const result = await symbolExtractor.extract(
  "I crossed the river into the shadow realm, guided by a white stag."
);

console.log('Symbols:', result.symbols);
console.log('Archetypes:', result.archetypes);
```

---

## 📁 File Reference

| Component | Path |
|-----------|------|
| Symbol Extraction Engine | `/lib/intelligence/SymbolExtractionEngine.ts` |
| Metrics Engine | `/lib/metrics/PsychospiritualMetricsEngine.ts` |
| Metrics Client SDK | `/lib/metrics/MetricsClient.ts` |
| Obsidian Exporter | `/lib/obsidian/ObsidianExporter.ts` |
| Session Timeline | `/components/SessionTimeline.tsx` |
| Admin Panel | `/components/AdminOverridePanel.tsx` |
| Symbol Extraction API | `/app/api/intelligence/extract-symbols/route.ts` |
| Metrics API | `/app/api/metrics/psychospiritual/route.ts` |
| Obsidian Export API | `/app/api/obsidian/export/route.ts` |
| Admin API | `/app/api/admin/soulprint/route.ts` |
| Demo Page | `/app/demo/timeline/page.tsx` |
| Usage Examples | `/lib/metrics/USAGE_EXAMPLES.md` |
| Metrics README | `/lib/metrics/README.md` |

---

## 🛠 Next Steps

### Phase 1 (Complete) ✅
- [x] Symbol Extraction Engine
- [x] Metrics Engine
- [x] Obsidian Exporter
- [x] Timeline UI
- [x] Admin Panel

### Phase 2 (Suggested)
- [ ] Integrate auto-extraction into MAIA orchestrator
- [ ] Build metrics dashboard in `/maia-monitor`
- [ ] Add real-time WebSocket updates for timeline
- [ ] Create PDF report generator
- [ ] Build mobile-responsive versions

### Phase 3 (Future)
- [ ] Time-series charts for growth tracking
- [ ] Predictive analytics (what's next in journey)
- [ ] Cross-user pattern detection
- [ ] Voice command integration for milestone tracking
- [ ] AR/VR visualization of symbolic landscape

---

## 💬 Support

Questions? Check:
- `/lib/metrics/USAGE_EXAMPLES.md` for code examples
- `/lib/metrics/README.md` for architecture overview
- `/app/demo/timeline` for live demo

---

## 📄 License

Part of the Spiralogic Oracle System
© 2025 — For personal/beta use only

---

**🌟 You now have a complete psychospiritual intelligence system!**

All components are built, tested, and ready to integrate into your MAIA workflows.