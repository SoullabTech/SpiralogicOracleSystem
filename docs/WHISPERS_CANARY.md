# Whispers Canary Rollout Plan

## Overview
Safe rollout of the contextual whispers memory system across production environments.

## Phase 1: Internal Testing (Day 0-2)
**Target**: Development team only
**Config**: 
- `NEXT_PUBLIC_WHISPERS_ENABLED=true` in staging only
- `NEXT_PUBLIC_WHISPERS_CONTEXT_RANKING=true`
- `NEXT_PUBLIC_WHISPERS_MAX=6`

**Success Criteria**:
- [ ] All QA scenarios pass (see `scripts/qa-whispers.js`)
- [ ] No ranking timeouts > 200ms
- [ ] Telemetry data flowing correctly
- [ ] Weight persistence working across devices
- [ ] Maya cue fires appropriately with cooldown

## Phase 2: Limited Beta (Day 3-7)
**Target**: 5-10 trusted beta users
**Config**: Same as Phase 1
**Selection**: Users with >10 micro-memories and high engagement

**Monitoring**:
- Error rate < 2% on `/api/whispers/context`
- Average response time < 100ms
- No weight fallback rate > 5%
- User feedback via in-app survey

**Success Criteria**:
- [ ] Zero critical bugs reported
- [ ] Ranking relevance > 80% (user feedback)
- [ ] Performance within budgets
- [ ] Positive user sentiment

## Phase 3: Gradual Rollout (Day 8-14)
**Target**: Progressive rollout to general users
**Schedule**:
- Day 8: 10% of active users
- Day 10: 25% of active users  
- Day 12: 50% of active users
- Day 14: 100% rollout

**Feature Flags**:
```env
# Production
NEXT_PUBLIC_WHISPERS_ENABLED=true
NEXT_PUBLIC_WHISPERS_CONTEXT_RANKING=true
NEXT_PUBLIC_WHISPERS_MAX=6
NEXT_PUBLIC_WHISPERS_RANKING_TIMEOUT_MS=200
```

## Rollback Triggers
Immediately disable if any occur:
- Error rate > 5% sustained for 10+ minutes
- Average response time > 300ms for 5+ minutes  
- User-reported data privacy concerns
- Database performance degradation
- Critical bug affecting core Oracle functionality

**Rollback Process**:
1. Set `NEXT_PUBLIC_WHISPERS_ENABLED=false`
2. Clear CDN cache for API routes
3. Monitor for 15 minutes to confirm rollback
4. Investigate root cause before re-enabling

## Success Metrics
**Technical**:
- API uptime > 99.5%
- P95 response time < 150ms
- Weight fallback rate < 2%
- Zero data privacy incidents

**User Experience**:
- Whispers click-through rate > 15%
- User retention same or better vs control
- Positive feedback score > 4.0/5.0
- No increase in support tickets

## Monitoring Dashboard
Key metrics to track in real-time:
```sql
-- API Performance
SELECT 
  date_trunc('minute', timestamp) as minute,
  count(*) as requests,
  avg(duration_ms) as avg_duration,
  count(*) filter (where status >= 400) as errors
FROM api_logs 
WHERE endpoint = '/api/whispers/context'
  AND timestamp > now() - interval '1 hour'
GROUP BY 1 ORDER BY 1 DESC;

-- User Engagement  
SELECT
  date_trunc('day', created_at) as day,
  count(distinct user_id) as active_users,
  count(*) filter (where event_type = 'whispers_shown') as impressions,
  count(*) filter (where event_type = 'whispers_used') as clicks
FROM telemetry
WHERE created_at > now() - interval '7 days'
GROUP BY 1 ORDER BY 1 DESC;
```

## Communication Plan
- **Week Before**: Announce to beta users via email
- **Day 0**: Internal team notification
- **Day 3**: Beta user survey sent
- **Day 8**: General rollout announcement in product
- **Day 14**: Success metrics shared with stakeholders

## Bug Report Template
**Title**: [Whispers] Brief description
**Environment**: Production/Staging
**User ID**: `user_xxxxx` (if applicable)
**Steps**: 
1. Go to recap page
2. Check for whispers section
3. ...

**Expected**: Relevant whispers shown with scores
**Actual**: Error/no whispers/wrong ranking
**Console Logs**: Include any errors
**Network**: Screenshot of API calls in DevTools
**Priority**: Critical/High/Medium/Low

## Post-Rollout Tasks
After successful 100% rollout:
- [ ] Remove feature flags (make whispers always-on)
- [ ] Optimize performance based on production metrics
- [ ] Consider raising `maxItems` limit if performance allows
- [ ] Plan advanced features (pinning, snoozing, etc.)
- [ ] Document lessons learned for future feature rollouts