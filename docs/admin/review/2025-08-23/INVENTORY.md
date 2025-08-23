# Feature Inventory - Spiralogic Oracle System
_Generated: 2025-08-23_

## Feature Services Matrix

| Key | Readiness | User Entry Points | API Routes | DB Tables | RLS | Flags/Env | Perf Cost |
|-----|-----------|-------------------|------------|-----------|-----|-----------|-----------|
| **Dreams Journaling** | Beta | `/dreams/*` | `/api/dreams/[id]/weave` | `dreams` | ✅ | - | Low |
| **Whispers System** | Beta | Recap views | `/api/whispers/*`, `/api/whispers/context` | `micro_memories`, `whisper_weights` | ✅ | `NEXT_PUBLIC_WHISPERS_ENABLED`, `NEXT_PUBLIC_WHISPERS_CONTEXT_RANKING` | Medium |
| **ADHD/ND Mode** | Beta | Settings, Quick Capture | `/api/micro-memories`, `/api/digests/daily`, `/api/recalls` | `micro_memories` | ✅ | `NEXT_PUBLIC_ND_ENABLED`, `NEXT_PUBLIC_ND_ADHD_DEFAULT` | Low |
| **Maya Voice** | GA | Oracle chat | `/api/oracle/voice`, `/api/oracle/greeting` | `oracle_sessions`, `oracle_messages` | ✅ | `NEXT_PUBLIC_ORACLE_MAYA_VOICE`, `NEXT_PUBLIC_ORACLE_VOICE_ENABLED` | High |
| **Oracle Weave** | GA | Oracle chat | `/api/oracle/weave`, `/api/oracle/turn` | `soul_memories`, `conversations` | ✅ | `NEXT_PUBLIC_ORACLE_WEAVE_ENABLED` | High |
| **Beta System** | GA | `/beta/*` | `/api/beta/*` | `beta_participants`, `beta_badges_catalog`, `beta_user_badges` | ✅ | `BETA_INVITE_REQUIRED` | Low |
| **Uploads System** | Beta | Library views | `/api/uploads/*` | `memory_items` | ✅ | `UPLOADS_ENABLED` | High |
| **Admin Panel** | Beta | `/admin/*` | `/api/admin/*` | - | ✅ | `ADMIN_ALLOWED_EMAILS` | Low |

## File Path References

### Dreams System
- **Components**: `components/dreams/DreamEditor.tsx`, `components/dreams/DreamTimeline.tsx`
- **API**: `app/api/dreams/[id]/weave/route.ts`
- **Schema**: `lib/dreams/schemas.ts`
- **Migrations**: `supabase/migrations/20250823021501_dreams_enhance_existing.sql`

### Whispers System
- **Components**: `components/recap/Whispers.tsx`, `components/micro/QuickCapture.tsx`
- **Hooks**: `hooks/useWhispers.ts`, `hooks/useContextWhispers.ts`, `hooks/useWhisperWeights.ts`
- **API**: `app/api/whispers/route.ts`, `app/api/whispers/context/route.ts`, `app/api/whispers/weights/route.ts`
- **Lib**: `lib/whispers/rankWhispers.ts`, `lib/whispers/weights.ts`, `lib/whispers/rankClient.ts`
- **Migrations**: `supabase/migrations/20250823024748_micro_memories_clean.sql`, `supabase/migrations/20250823030000_whisper_weights.sql`

### ADHD/ND Features
- **Components**: `components/settings/NeurodivergentMode.tsx`, `components/micro/QuickCaptureND.tsx`
- **API**: `app/api/micro-memories/route.ts`, `app/api/recalls/route.ts`, `app/api/digests/daily/route.ts`
- **Lib**: `lib/adhd/helpers.ts`, `lib/micro/whispers.ts`

### Maya Voice System
- **Components**: `components/maya/VoiceButton.tsx`, `components/maya/VoiceIndicator.tsx`
- **Lib**: `lib/voice/maya-cues.ts`, `lib/voice/speech.ts`
- **API**: `app/api/oracle/voice/route.ts`, `app/api/oracle/greeting/route.ts`

### Admin System
- **Components**: `components/admin/AdminLayout.tsx`, `components/admin/FeatureFlagPanel.tsx`, `components/admin/SystemHealthDashboard.tsx`, `components/admin/WhispersAdminPanel.tsx`
- **Pages**: `app/admin/page.tsx`, `app/admin/features/page.tsx`, `app/admin/whispers/page.tsx`, `app/admin/health/page.tsx`
- **API**: `app/api/admin/features/route.ts`, `app/api/admin/system/health/route.ts`, `app/api/admin/whispers/metrics/route.ts`

## Database Tables Summary

### Core Tables
- `user_profiles` - User account and preferences
- `conversations` - Chat conversations with Oracle
- `oracle_sessions` - Oracle interaction sessions
- `oracle_messages` - Individual Oracle messages
- `soul_memories` - Synthesized memories from weaving

### Feature Tables
- `dreams` - Dream journal entries with segments and techniques
- `micro_memories` - Quick capture memories for ADHD mode
- `whisper_weights` - User-specific ranking preferences
- `beta_participants` - Beta program enrollment
- `beta_user_badges` - User achievement tracking
- `memory_items` - Document and media uploads

### System Tables
- `telemetry` - Event tracking and analytics
- `api_telemetry` - API performance metrics
- `security_audit` - Security event logging

## Performance Considerations

### High Impact
- **Voice Processing**: Real-time audio transcription and synthesis
- **Oracle Weaving**: AI model calls for memory synthesis
- **Uploads Processing**: Document parsing and embedding generation

### Medium Impact
- **Whispers Ranking**: Contextual sorting algorithm (200ms budget)
- **Dream Weaving**: Integration with Oracle memory system

### Low Impact
- **Quick Capture**: Simple database inserts
- **Admin Panel**: Read-heavy dashboard queries
- **Beta Features**: Minimal overhead for feature flags