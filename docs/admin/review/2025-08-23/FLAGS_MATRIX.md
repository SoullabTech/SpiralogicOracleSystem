# Feature Flags Matrix
_Generated: 2025-08-23_

## Source of Truth for Feature Flags

### Canonical Services Registry (flags.runtime.ts)

| Service Key | Label | Category | Current | Rollout % | Dependencies | Perf Cost |
|-------------|-------|----------|---------|-----------|--------------|-----------|
| `dreams` | Dream Journaling | UserFacing | `false` | 0% | - | med/low/10ms |
| `whispers` | Contextual Whispers | UserFacing | `false` | 0% | micro_memories | med/low/12ms |
| `micro_memories` | Quick Capture | UserFacing | `false` | 0% | - | low/low/6ms |
| `adhd_mode` | ADHD / Neurodivergent Mode | UserFacing | `false` | 0% | micro_memories, voice_maya | low/low/8ms |
| `voice_maya` | Maya Voice | Core | `false` | 0% | - | med/med/25ms |
| `retreat_facilitator` | Facilitator Tools | Facilitator | `false` | 0% | owner_console | med/med/20ms |
| `owner_console` | Owner Console | Core | `false` | 0% | - | low/low/5ms |
| `uploads` | Multimodal Uploads | Core | `false` | 0% | - | med/med/18ms |
| `beta_badges` | Beta Badges & Ceremonies | Experimental | `false` | 0% | - | low/low/5ms |
| `admin_docs` | Admin Docs | Debug | `true` | 100% | - | low/low/2ms |
| `weave_pipeline` | Oracle Weaving | Core | `true` | 100% | - | med/low/15ms |

### Legacy Environment Flags (being migrated)

### Development & Debug Flags

| Flag | Purpose | Safe for Prod | Default |
|------|---------|---------------|---------|
| `NEXT_PUBLIC_DEV_TOOLS` | Debug panels | No | `false` |
| `NEXT_PUBLIC_DEV_PERF` | Performance overlay | No | `false` |
| `NEXT_PUBLIC_DEV_MEMORY` | Memory debugging | No | `false` |
| `NEXT_PUBLIC_DEV_INLINE_REFLECTIONS` | Debug reflections | No | `false` |

### System Configuration

| Flag | Purpose | Type | Current | Notes |
|------|---------|------|---------|-------|
| `ADMIN_ALLOWED_EMAILS` | Admin access list | CSV | `user@example.com` | Environment only |
| `UPLOADS_ENABLED` | File upload system | Boolean | `true` | Hard toggle |
| `ELEVENLABS_ENABLED` | Voice synthesis | Boolean | `true` | Billing dependent |
| `BETA_BADGES_ENABLED` | Achievement system | Boolean | `true` | Beta feature |

## Flag Implementation Patterns

### Client-Side (Public)
```typescript
// lib/config/features.ts
export const features = {
  whispers: {
    enabled: process.env.NEXT_PUBLIC_WHISPERS_ENABLED === 'true',
    contextRanking: process.env.NEXT_PUBLIC_WHISPERS_CONTEXT_RANKING === 'true',
    rankingTimeoutMs: parseInt(process.env.NEXT_PUBLIC_WHISPERS_RANKING_TIMEOUT_MS || '200')
  }
}
```

### Server-Side (Private)
```typescript
// lib/config/server.ts  
export const serverConfig = {
  admin: {
    allowedEmails: process.env.ADMIN_ALLOWED_EMAILS?.split(',') || []
  },
  uploads: {
    enabled: process.env.UPLOADS_ENABLED === 'true',
    maxSizeMB: parseInt(process.env.MAX_UPLOAD_MB || '10')
  }
}
```

### Component Usage
```typescript
// hooks/useFeature.ts
export function useFeature(key: string): boolean {
  return useMemo(() => {
    return getFeatureFlag(key) || false
  }, [key])
}

// In components
const whispersEnabled = useFeature('whispers.enabled')
```

## Flag Lifecycle Management

### 1. Feature Development
- Create flag with `false` default
- Add to development environment only
- Gate all new code paths

### 2. Internal Testing
- Enable for admin emails only  
- Monitor error rates and performance
- Iterate on implementation

### 3. Beta Rollout
- Enable for beta participants
- Gradual rollout: 5% → 25% → 50% → 75%
- Monitor user feedback and metrics

### 4. GA Release
- 100% rollout for all users
- Set new default to `true`
- Plan flag removal (90 days post-GA)

### 5. Cleanup
- Remove flag checks from code
- Update documentation
- Archive flag from admin panel

## Dynamic Flag Controls

### Admin Panel Integration
```
/admin/features → Toggle flags with impact preview
/admin/features/history → Audit log of changes
/admin/features/rollout → Gradual rollout controls
```

### API Endpoints
```
GET /api/admin/features → List all flags
POST /api/admin/features → Update flag values
GET /api/debug/flags → Debug current flag state
```

### Database Overrides
```sql
-- Table: feature_flags
CREATE TABLE feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL,
  rollout_percentage INTEGER DEFAULT 0,
  conditions JSONB DEFAULT '{}',
  updated_by TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Rollout Strategies

### Percentage Rollouts
```typescript
function isFeatureEnabled(userId: string, flag: string): boolean {
  const rolloutPercentage = getFlag(`${flag}.rollout`) || 0
  const hash = murmurhash3(userId + flag) % 100
  return hash < rolloutPercentage
}
```

### Cohort Targeting
```typescript
const targeting = {
  betaUsers: () => userIsBetaParticipant(),
  powerUsers: () => userEngagementScore() > 80,
  newUsers: () => accountAge() < 30,
  mobileUsers: () => isMobileDevice()
}
```

### Geographic Rollouts
```typescript
const geoFlags = {
  'feature.voice': {
    enabled: ['US', 'CA', 'UK', 'AU'],
    disabled: ['CN', 'RU'] // Regulatory restrictions
  }
}
```

## Monitoring & Alerts

### Flag Change Alerts
- Slack notification on any flag toggle
- Email digest of weekly flag changes  
- Dashboard showing flag adoption rates

### Performance Impact Tracking
```typescript
// Track flag performance impact
telemetry.gauge('feature_flag.performance_impact', duration, {
  flag: 'whispers.contextRanking',
  enabled: String(flagEnabled)
})
```

### Error Rate Correlation
```sql
-- Alert if error rate spikes after flag change
SELECT 
  flag_key,
  AVG(error_rate) as avg_error_rate,
  COUNT(*) as events
FROM telemetry 
WHERE timestamp > NOW() - INTERVAL '1 hour'
  AND flag_changed = true
GROUP BY flag_key
HAVING AVG(error_rate) > 0.05
```

## Flag Dependencies & Conflicts

### Dependency Tree
```
oracle.weaveEnabled
  ├── whispers.enabled
  │   └── whispers.contextRanking
  └── nd.enabled
      ├── nd.adhdDefault
      └── nd.digests
```

### Conflict Detection
```typescript
const conflicts = {
  'beta.enabled': {
    conflicts: ['beta.inviteRequired'],
    message: "Cannot enable beta access while requiring invites"
  }
}
```

## Security Considerations

### Sensitive Flags
- Never expose API keys or secrets as feature flags
- Use server-side only flags for security features
- Audit all flag changes with user attribution

### Flag Injection Prevention
```typescript
// Validate flag keys to prevent injection
const VALID_FLAG_PATTERN = /^[a-zA-Z][a-zA-Z0-9_.]*$/
if (!VALID_FLAG_PATTERN.test(flagKey)) {
  throw new Error('Invalid flag key format')
}
```

## Testing Strategy

### Flag Testing Matrix
```
Feature A: ON/OFF
Feature B: ON/OFF
Expected: 4 test combinations

Actual test coverage:
✅ A:ON, B:ON (main path)
✅ A:OFF, B:OFF (fallback)
❌ A:ON, B:OFF (missing)
❌ A:OFF, B:ON (missing)
```

### Integration Tests
```typescript
describe('Feature Flags', () => {
  it('disables whispers when parent flag is off', () => {
    setFlag('whispers.enabled', false)
    setFlag('whispers.contextRanking', true) // Should be ignored
    
    expect(isWhispersEnabled()).toBe(false)
    expect(isContextRankingEnabled()).toBe(false)
  })
})
```

## Documentation Standards

### Flag Documentation Template
```markdown
## Flag: `feature.newThing`

**Purpose**: Enable new thing for users
**Status**: Beta (50% rollout)
**Owner**: @username
**Metrics**: Click-through rate, error rate
**Dependencies**: feature.baseThing
**Rollout Plan**: 
  - Week 1: 10% beta users
  - Week 2: 25% all users  
  - Week 3: 50% all users
  - Week 4: 100% (GA)
**Cleanup Date**: 2025-12-01
```