# 🧪 Sacred Core Testing Suite

## Prompt 6 — Automated Testing for Sacred Pipeline

```markdown
You are the Sacred Core Test Engineer.
Task: Create comprehensive test suite for voice → motion → oracle flow.

## Test Coverage Required:

### 1. Unit Tests (/tests/unit/)
- Sacred Pipeline components
- Motion Orchestrator states
- Oracle API responses
- Latent API gating

### 2. Integration Tests (/tests/integration/)
- Voice input → Motion response
- Motion → Oracle coherence
- API endpoint validation
- Supabase persistence

### 3. E2E Tests (/tests/e2e/)
- Complete user journey
- Holoflower interaction
- Session persistence
- Performance metrics

### 4. Performance Tests (/tests/performance/)
- Bundle size < 300KB
- FPS >= 30
- Load time < 2s
- Memory usage stable

## Test Implementation:

```typescript
// tests/sacred-pipeline.test.ts
import { describe, it, expect } from '@jest/globals';
import { runSacredPipeline } from '@/app/api/oracle/route';

describe('Sacred Pipeline', () => {
  it('processes voice input to motion state', async () => {
    const input = "I seek guidance on my path";
    const result = await runSacredPipeline(input, 'voice');
    
    expect(result.motion).toBeDefined();
    expect(result.motion.coherence).toBeGreaterThan(0.5);
    expect(result.audio.voice).toBe('maya');
  });

  it('maintains non-prescriptive responses', async () => {
    const input = "What should I do?";
    const result = await runSacredPipeline(input, 'oracle');
    
    expect(result.response.prescriptive).toBe(false);
    expect(result.response.reflective).toBe(true);
  });

  it('gates latent APIs correctly', async () => {
    process.env.ENABLE_SHADOW = 'false';
    const input = "shadow work";
    const result = await runSacredPipeline(input, 'oracle');
    
    expect(result.latent?.shadow).toBeUndefined();
  });
});

// tests/supabase-persistence.test.ts
describe('Supabase Persistence', () => {
  it('saves session state', async () => {
    const session = await createSession();
    const saved = await saveToSupabase(session);
    
    expect(saved.id).toBeDefined();
    expect(saved.timestamp).toBeDefined();
  });

  it('retrieves session history', async () => {
    const history = await getSessionHistory(userId);
    
    expect(Array.isArray(history)).toBe(true);
    expect(history[0].motion).toBeDefined();
  });
});

// tests/performance.test.ts
describe('Performance Metrics', () => {
  it('maintains 30+ FPS during motion', async () => {
    const fps = await measureFPS();
    expect(fps).toBeGreaterThanOrEqual(30);
  });

  it('loads within 2 seconds', async () => {
    const loadTime = await measureLoadTime();
    expect(loadTime).toBeLessThan(2000);
  });
});
```

## Test Commands:

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:e2e": "jest tests/e2e",
    "test:performance": "jest tests/performance",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "npm run test:coverage && npm run test:e2e"
  }
}
```

## CI/CD Pipeline (.github/workflows/test.yml):

```yaml
name: Sacred Core Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:ci
      - run: npm run build
```

## Success Metrics:
✅ All tests passing
✅ Code coverage > 80%
✅ Performance benchmarks met
✅ No prescriptive responses
✅ Latent APIs properly gated
```

---

# 📚 Sacred Library Tab Implementation

## Phase 3, Part 1 — Sacred Library View

```markdown
You are the Sacred Library Architect.
Task: Create a browsable, filterable Library View for all uploaded assets.

## Requirements:

### 1. Library Tab Component (/components/library/SacredLibrary.tsx)

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface LibraryAsset {
  id: string;
  title: string;
  type: 'document' | 'image' | 'audio' | 'video';
  element: 'earth' | 'water' | 'fire' | 'air' | 'ether';
  uploadDate: Date;
  tags: string[];
  thumbnail?: string;
  insights?: string[];
  linkedSessions?: string[];
}

export function SacredLibrary() {
  const [assets, setAssets] = useState<LibraryAsset[]>([]);
  const [filter, setFilter] = useState({
    type: 'all',
    element: 'all',
    search: ''
  });

  return (
    <div className="sacred-library">
      {/* Filter Bar */}
      <div className="filter-bar">
        <ElementFilter onChange={setFilter} />
        <TypeFilter onChange={setFilter} />
        <SearchBar onChange={setFilter} />
      </div>

      {/* Asset Grid */}
      <div className="asset-grid">
        {filteredAssets.map(asset => (
          <AssetCard 
            key={asset.id}
            asset={asset}
            onClick={() => openAssetModal(asset)}
          />
        ))}
      </div>

      {/* Asset Modal */}
      <AssetModal />
    </div>
  );
}
```

### 2. Asset Card Component

```typescript
function AssetCard({ asset, onClick }) {
  const elementColors = {
    earth: 'border-green-600',
    water: 'border-blue-600',
    fire: 'border-red-600',
    air: 'border-yellow-400',
    ether: 'border-purple-600'
  };

  return (
    <div 
      className={`asset-card ${elementColors[asset.element]} border-2 p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all`}
      onClick={onClick}
    >
      <div className="thumbnail">
        {asset.thumbnail ? (
          <img src={asset.thumbnail} alt={asset.title} />
        ) : (
          <AssetIcon type={asset.type} />
        )}
      </div>
      
      <h3 className="font-semibold mt-2">{asset.title}</h3>
      
      <div className="metadata flex gap-2 mt-2">
        <ElementBadge element={asset.element} />
        <TypeBadge type={asset.type} />
      </div>
      
      <div className="tags flex flex-wrap gap-1 mt-2">
        {asset.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
```

### 3. Asset Modal with Timeline Link

```typescript
function AssetModal({ asset, isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="asset-detail">
        {/* Preview */}
        <div className="preview">
          <AssetPreview asset={asset} />
        </div>

        {/* Metadata */}
        <div className="metadata">
          <h2>{asset.title}</h2>
          <p>Uploaded: {asset.uploadDate}</p>
          <ElementBadge element={asset.element} />
        </div>

        {/* AI Insights */}
        <div className="insights">
          <h3>Oracle Insights</h3>
          {asset.insights?.map(insight => (
            <p key={insight}>{insight}</p>
          ))}
        </div>

        {/* Linked Sessions */}
        <div className="linked-sessions">
          <h3>Referenced in Sessions</h3>
          {asset.linkedSessions?.map(sessionId => (
            <SessionLink key={sessionId} sessionId={sessionId} />
          ))}
        </div>

        {/* Actions */}
        <div className="actions">
          <button onClick={() => downloadAsset(asset)}>
            Download
          </button>
          <button onClick={() => addToTimeline(asset)}>
            Add to Timeline
          </button>
          <button onClick={() => shareAsset(asset)}>
            Share
          </button>
        </div>
      </div>
    </Modal>
  );
}
```

### 4. Supabase Schema

```sql
-- Library assets table
CREATE TABLE library_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('document', 'image', 'audio', 'video')),
  element TEXT CHECK (element IN ('earth', 'water', 'fire', 'air', 'ether')),
  file_url TEXT,
  thumbnail_url TEXT,
  tags TEXT[],
  insights JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session-asset relationships
CREATE TABLE session_assets (
  session_id UUID REFERENCES oracle_sessions(id),
  asset_id UUID REFERENCES library_assets(id),
  context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (session_id, asset_id)
);

-- Indexes for performance
CREATE INDEX idx_assets_user ON library_assets(user_id);
CREATE INDEX idx_assets_element ON library_assets(element);
CREATE INDEX idx_assets_type ON library_assets(type);
CREATE INDEX idx_assets_tags ON library_assets USING GIN(tags);
```

### 5. Integration with Timeline

```typescript
// In Timeline component
function Timeline() {
  const [sessions, setSessions] = useState([]);
  const [linkedAssets, setLinkedAssets] = useState({});

  // When rendering session
  return (
    <div className="timeline">
      {sessions.map(session => (
        <TimelineNode key={session.id}>
          <SessionContent session={session} />
          
          {/* Linked Assets */}
          {linkedAssets[session.id]?.map(asset => (
            <LinkedAssetPreview 
              asset={asset}
              onClick={() => openLibrary(asset.id)}
            />
          ))}
        </TimelineNode>
      ))}
    </div>
  );
}
```

## Success Metrics:
✅ Assets load in < 500ms
✅ Filtering is instant (< 100ms)
✅ Element tagging 100% accurate
✅ Timeline integration seamless
✅ Search returns relevant results
```

---

# 🎯 Complete Roadmap Structure

## CLAUDE_PROMPTS_ROADMAP.md

```markdown
# Sacred Portal Development Roadmap

## Core Principles
- Modular, independent features
- Performance metrics baked in
- Sacred UX preserved
- Complexity debt eliminated

## Phase Timeline

### Phase 1: Foundation (Weeks 1-4) ✅
- Sacred Core extraction
- Unified Oracle API
- Testing suite
- Performance baselines

### Phase 2: Intelligence (Weeks 5-8)
- Document upload system
- AI context enhancement
- Session persistence
- Memory optimization

### Phase 3: Library (Weeks 9-12)
- Sacred Library Tab
- Asset management
- Timeline integration
- Search & filtering

### Phase 4: Evolution (Weeks 13-16)
- Collective features
- Advanced analytics
- Community tools
- Scaling preparation

## Performance Guardrails
- Bundle size: < 300KB
- FPS: >= 30
- Load time: < 2s
- Memory: < 100MB
- API response: < 500ms

## Development Workflow
1. Feed prompt to Claude Code
2. Review generated code
3. Run test suite
4. Check performance metrics
5. Deploy if all green

## Success Indicators
- User engagement up 40%
- Session duration increased
- Performance metrics maintained
- Zero complexity debt
- Modular architecture preserved
```

Would you like me to create additional implementation prompts for any specific phase, or shall we proceed with setting up the performance monitoring dashboard?

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Create automated testing prompt for Sacred Core", "status": "completed", "activeForm": "Creating automated testing prompt for Sacred Core"}, {"content": "Create Sacred Library Tab implementation prompt", "status": "completed", "activeForm": "Creating Sacred Library Tab implementation prompt"}, {"content": "Document the complete roadmap structure", "status": "completed", "activeForm": "Documenting the complete roadmap structure"}, {"content": "Create performance monitoring setup", "status": "in_progress", "activeForm": "Creating performance monitoring setup"}]