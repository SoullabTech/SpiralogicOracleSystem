# System Wiring Diagrams
_Generated: 2025-08-23_

## Dreams System Flow

```mermaid
graph LR
    UI[DreamEditor] --> API[/api/dreams/id/weave]
    API --> Auth{Auth Check}
    Auth --> DB[(dreams table)]
    Auth --> Weave[weaveDream()]
    Weave --> Oracle[Oracle Pipeline]
    Oracle --> Soul[(soul_memories)]
    DB --> RLS{RLS: user_id}
```

**Missing States**: 
- ✅ Loading skeleton in DreamEditor
- ❌ Error state for weave failures
- ❌ Empty state for no dreams

## Whispers System Flow

```mermaid
graph LR
    Recap[RecapView] --> Hook[useWhispers]
    Hook --> API[/api/whispers/context]
    API --> Auth{Auth Check}
    Auth --> Load[loadWhisperWeights]
    Load --> DB1[(whisper_weights)]
    Auth --> DB2[(micro_memories)]
    DB2 --> Rank[rankWhispers]
    Rank --> Cache[CDN Cache]
    Cache --> UI[Whispers Component]
    
    UI --> Tel1[/api/telemetry/whispers/shown]
    UI --> Tel2[/api/telemetry/whispers/used]
```

**Missing States**:
- ✅ Loading state
- ✅ Empty state
- ❌ Error boundary for ranking timeouts

## ADHD/ND Mode Flow

```mermaid
graph LR
    Settings[ND Settings] --> Flag{Feature Flag}
    Flag --> QC[QuickCapture]
    QC --> API[/api/micro-memories]
    API --> Auth{Auth Check}
    Auth --> DB[(micro_memories)]
    DB --> RLS{RLS: user_id}
    
    Timer[Daily Timer] --> Digest[/api/digests/daily]
    Digest --> Query[aggregateMemories]
    Query --> Email[Send Digest]
    
    DB --> Recall[/api/recalls]
    Recall --> Schedule[updateRecallDates]
```

**Missing States**:
- ✅ Success feedback on capture
- ❌ Offline capture queue
- ❌ Digest preview UI

## Maya Voice Flow

```mermaid
graph LR
    Voice[VoiceButton] --> Mic[getUserMedia]
    Mic --> Stream[Audio Stream]
    Stream --> API1[/api/oracle/voice]
    API1 --> STT[Speech-to-Text]
    STT --> Turn[/api/oracle/turn]
    
    Turn --> Oracle[Oracle Processing]
    Oracle --> Response[Text Response]
    Response --> TTS[Text-to-Speech]
    TTS --> Audio[Audio Output]
    
    Response --> Cue[maybeSpeakMayaCue]
    Cue --> Context{Context Check}
    Context --> Play[Play Audio]
```

**Missing States**:
- ✅ Recording indicator
- ✅ Processing state
- ❌ Network error recovery
- ❌ Microphone permission denied

## Admin Panel Flow

```mermaid
graph LR
    Admin[/admin/*] --> MW[Middleware]
    MW --> Auth{Email Check}
    Auth --> Layout[AdminLayout]
    
    Layout --> Flags[FeatureFlagPanel]
    Flags --> API1[/api/admin/features]
    
    Layout --> Health[SystemHealthDashboard]
    Health --> API2[/api/admin/system/health]
    
    Layout --> Whispers[WhispersAdminPanel]
    Whispers --> API3[/api/admin/whispers/metrics]
    
    API1 --> Log[Audit Log]
    API2 --> Metrics[Performance Metrics]
    API3 --> Analytics[Usage Analytics]
```

**Missing States**:
- ✅ Loading states
- ✅ Error states
- ❌ Real-time updates (WebSocket)
- ❌ Export functionality

## Data Flow Security

```
User Request → Middleware → Auth Check → API Route → RLS Check → Database
                    ↓                         ↓
                 Redirect                 Error Response
```

### RLS Coverage by Table
- ✅ `dreams` - Full CRUD with user_id isolation
- ✅ `micro_memories` - Full CRUD with user_id isolation
- ✅ `whisper_weights` - Full CRUD with user_id isolation
- ✅ `soul_memories` - Read-only for users, write via system
- ✅ `beta_participants` - User can read own status only
- ❌ `telemetry` - No RLS (system table)
- ❌ `api_telemetry` - No RLS (system table)

## Performance Bottlenecks

### Critical Path Analysis
1. **Whispers Ranking** (200ms budget)
   - Database query: ~50ms
   - Ranking algorithm: ~100ms
   - Serialization: ~20ms
   - Network: ~30ms

2. **Voice Processing** (2s user tolerance)
   - Audio upload: ~200ms
   - STT processing: ~800ms
   - Oracle turn: ~500ms
   - TTS generation: ~400ms
   - Audio download: ~100ms

3. **Dream Weaving** (5s tolerance)
   - Dream fetch: ~50ms
   - Oracle processing: ~3000ms
   - Memory save: ~100ms
   - UI update: ~50ms

## Cache Strategy

```
CDN (30s) → Server Memory → Database
    ↓            ↓            ↓
  Static      User-scoped   Source of truth
```

### Cache Headers by Route
- `/api/whispers/context`: `s-maxage=30, stale-while-revalidate=120`
- `/api/admin/*`: `no-store` (real-time data)
- `/api/oracle/*`: `no-cache` (personalized)
- `/api/uploads/*`: `max-age=31536000` (immutable)