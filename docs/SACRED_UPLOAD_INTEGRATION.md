# 🌸 Sacred Upload Integration Guide

Complete flow for uploading files through the Sacred Portal and integrating them with the Holoflower Timeline.

## Architecture Overview

```
📂 User File Upload
    ↓
🌸 SacredUpload.tsx (Ritual UI)
    ↓
📊 Supabase Storage + Database
    ↓
🔮 document-analysis.ts Pipeline
    ↓
✨ Sacred Library + Timeline Integration
```

## 1. Database Schema

The system uses these tables:

```sql
-- Core documents table
sacred_documents (
  id, user_id, filename, file_type,
  element, aether_resonance, coherence_score,
  petal_mapping, wisdom_quotes, themes
)

-- Assets linked to sessions
sacred_assets (
  id, document_id, session_id, 
  title, type, element, aether_resonance
)

-- Timeline sessions
holoflower_sessions (
  id, user_id, petal_states,
  coherence_score, aether_stage, dominant_element
)

-- Extracted wisdom
wisdom_quotes (
  id, document_id, quote_text,
  petal_associations, element_resonance
)
```

## 2. Upload Flow

### Step 1: User Interaction
```tsx
// In your main app component
import { SacredUpload } from '@/components/sacred/SacredUpload';

<SacredUpload
  userId={user.id}
  sessionId={currentSession?.id}
  onUploadComplete={(fileId) => {
    console.log('Sacred offering complete:', fileId);
    // Trigger analysis pipeline
    analyzeDocument(fileId);
    // Refresh timeline
    refreshTimeline();
  }}
/>
```

### Step 2: File Processing
```tsx
// SacredUpload component flow:

1. User drops file → Glowing orb animation
2. File uploads to Supabase Storage
3. Record inserted into sacred_documents table
4. Status: 'pending' → 'processing' → 'analyzed'
5. Petal ripple animation triggers
6. Preview card shows with analysis results
```

### Step 3: Analysis Pipeline
```typescript
// lib/pipelines/document-analysis.ts

export async function analyzeDocument(documentId: string) {
  // 1. Extract text from file
  const text = await extractText(filePath, fileType);
  
  // 2. Analyze with Claude
  const analysis = await analyzeWithClaude(text, filename);
  
  // 3. Map to 12-petal system
  const petalMapping = {
    'Fire1_Life': 0.8,      // High creativity
    'Water2_Intuition': 0.9, // Strong intuitive content
    'Aether': 0.7           // Mystical resonance
  };
  
  // 4. Extract wisdom quotes
  const wisdomQuotes = [
    "The river of consciousness flows through all dreams",
    "In silence, we find the voice of the soul"
  ];
  
  // 5. Update database
  return { element, aetherResonance, coherenceScore, wisdomQuotes };
}
```

## 3. Timeline Integration

### Enhanced Session Data
```typescript
// Session now includes linked assets
const sessionWithAssets: Session = {
  id: 'session-123',
  date: '2025-01-07',
  checkIns: { Fire1: 0.8, Water2: 0.9 },
  dominantElement: 'Water',
  coherence: 0.85,
  aetherStage: 2,
  assets: [
    {
      id: 'asset-456',
      type: 'doc',
      title: 'Dream Journal Entry',
      metadata: {
        element: 'Water',
        aetherResonance: 0.87,
        wisdomQuotes: ['The void speaks in symbols...']
      }
    }
  ]
};
```

### Timeline Display
```tsx
// components/EnhancedHoloflowerTimeline.tsx

// Sessions with assets get golden rings
{hasAssets && (
  <motion.div className="golden-ring" />
)}

// Expandable asset grid
{isExpanded && (
  <div className="assets-grid">
    {session.assets.map(asset => (
      <SacredAssetPreview 
        key={asset.id}
        {...asset}
        onPreview={() => openAssetModal(asset)}
      />
    ))}
  </div>
)}
```

## 4. Sacred Library Integration

### Full Library View
```tsx
// components/SacredLibrary.tsx

const [filteredAssets] = useState(() => {
  return allAssets
    .filter(asset => {
      // Filter by element
      if (elementFilter !== 'all') {
        return asset.metadata?.element === elementFilter;
      }
      
      // Filter by high Aether content
      if (showHighAether) {
        return (asset.metadata?.aetherResonance || 0) > 0.7;
      }
      
      // Search wisdom quotes
      if (searchQuery) {
        return asset.metadata?.wisdomQuotes?.some(quote =>
          quote.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'aether':
          return (b.metadata?.aetherResonance || 0) - (a.metadata?.aetherResonance || 0);
        case 'date':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        default:
          return 0;
      }
    });
});
```

## 5. Real-time Updates

### WebSocket Integration (Optional)
```typescript
// Real-time analysis updates
const supabase = createClient(/* ... */);

useEffect(() => {
  const channel = supabase
    .channel('document-analysis')
    .on('postgres_changes', 
      { event: 'UPDATE', schema: 'public', table: 'sacred_documents' },
      (payload) => {
        if (payload.new.status === 'analyzed') {
          // Update UI with analysis results
          setDocuments(prev => prev.map(doc => 
            doc.id === payload.new.id ? payload.new : doc
          ));
          
          // Trigger celebration animation
          celebrateAnalysis(payload.new);
        }
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);
```

## 6. Example Usage

### Complete Integration
```tsx
import { useState } from 'react';
import { SacredUpload } from '@/components/sacred/SacredUpload';
import { EnhancedHoloflowerTimeline } from '@/components/EnhancedHoloflowerTimeline';
import { SacredLibrary } from '@/components/SacredLibrary';
import { analyzeDocument } from '@/lib/pipelines/document-analysis';

export default function SacredPortal() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'library' | 'upload'>('timeline');
  const [timeline, setTimeline] = useState<Timeline>(initialTimeline);
  const [assets, setAssets] = useState<SacredAsset[]>([]);

  const handleUploadComplete = async (fileId: string) => {
    try {
      // Trigger analysis
      const analysis = await analyzeDocument(fileId);
      
      // Update timeline with new asset
      const newAsset: SacredAsset = {
        id: fileId,
        type: analysis.element === 'Aether' ? 'video' : 'doc',
        title: `Sacred Offering ${new Date().toLocaleDateString()}`,
        metadata: {
          element: analysis.element,
          aetherResonance: analysis.aetherResonance,
          wisdomQuotes: analysis.wisdomQuotes
        }
      };
      
      setAssets(prev => [...prev, newAsset]);
      
      // Refresh timeline
      refreshTimeline();
      
      // Show success notification
      toast.success('🌸 Sacred offering integrated into your journey');
      
    } catch (error) {
      console.error('Upload processing error:', error);
      toast.error('Analysis pipeline encountered an issue');
    }
  };

  return (
    <div className="sacred-portal">
      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('timeline')}
          className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
        >
          🌸 Journey Timeline
        </button>
        <button 
          onClick={() => setActiveTab('library')}
          className={`tab ${activeTab === 'library' ? 'active' : ''}`}
        >
          📚 Sacred Library
        </button>
        <button 
          onClick={() => setActiveTab('upload')}
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
        >
          ✨ Upload Offering
        </button>
      </div>

      {/* Content */}
      {activeTab === 'timeline' && (
        <EnhancedHoloflowerTimeline
          timeline={timeline}
          onSessionSelect={loadSession}
          onAssetUpload={(sessionId) => {
            setActiveTab('upload');
            setTargetSession(sessionId);
          }}
        />
      )}

      {activeTab === 'library' && (
        <SacredLibrary
          assets={assets}
          onAssetSelect={openAssetViewer}
          onUpload={() => setActiveTab('upload')}
        />
      )}

      {activeTab === 'upload' && (
        <SacredUpload
          userId={user.id}
          sessionId={targetSession}
          onUploadComplete={handleUploadComplete}
          onClose={() => setActiveTab('timeline')}
        />
      )}
    </div>
  );
}
```

## 7. Environment Setup

### Required Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Claude API
ANTHROPIC_API_KEY=your_anthropic_key

# Optional: For transcription
OPENAI_API_KEY=your_openai_key
```

### Package Dependencies
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.1",
    "@anthropic-ai/sdk": "^0.61.0",
    "framer-motion": "^10.16.16",
    "lucide-react": "^0.303.0",
    "formidable": "^3.5.1"
  }
}
```

## 8. Migration Command

```bash
# Apply database schema
npx supabase db push

# Or apply specific migration
npx supabase db push --file supabase/migrations/001_sacred_documents_schema.sql
```

## 🌟 Result

Users can now:
1. **Upload files** through the ritualized Sacred Upload interface
2. **See analysis results** as wisdom cards with elemental coloring
3. **Browse timeline** with asset indicators and expandable previews
4. **Search library** by element, Aether resonance, or wisdom quotes
5. **Experience seamless integration** between uploads and their Holoflower journey

The system creates a living, breathing library where every uploaded file becomes part of the user's sacred digital ecosystem! ✨