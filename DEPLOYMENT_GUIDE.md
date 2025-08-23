# Services Catalog Deployment Guide

This guide covers the staging verification and production rollout for the comprehensive services catalog system.

## 🚀 Staging Deploy

### 1. Environment Setup

**Vercel Environment Variables:**
```bash
# Required (public)
NEXT_PUBLIC_ADMIN_ALLOWED_EMAILS=your-email@domain.com,admin@domain.com

# Supabase (public)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase (secret) 
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Vercel Deployment:**
1. Point preview environment to `ian-fix/builds` branch
2. Run deployment: `vercel --prod` or through dashboard
3. Verify environment variables are set correctly

### 2. Database Migration

**Run pending migrations in Supabase SQL Editor:**
```sql
-- Feature flags table (if not exists)
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'feature_flags'
);

-- If false, run: supabase/migrations/20250823040000_feature_flags.sql
-- Optional usage tracking tables:
CREATE TABLE IF NOT EXISTS service_usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  service_key text NOT NULL,
  action text NOT NULL,
  metadata jsonb DEFAULT '{}',
  timestamp timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  service_key text NOT NULL,
  service_name text NOT NULL,
  status text DEFAULT 'pending',
  requested_at timestamptz DEFAULT now()
);
```

### 3. Feature Flag Setup

**Navigate to `/admin/services` and configure:**

**Core Services (100% rollout):**
- ✅ `oracle.chat` → 100% enabled
- ✅ `admin.services` → 100% enabled  
- ✅ `admin.docs` → 100% enabled
- ✅ `weave_pipeline` → 100% enabled

**Canary Features (10% rollout):**
- 🧪 `whispers` → 10% enabled
- 🧪 `dreams` → 10% enabled
- 🧪 `micro_memories` → 10% enabled

**Hidden/Experimental:**
- ❌ `adhd_mode` → 0% (keep in catalog but hidden)
- ❌ `beta_badges` → 0% (admin only)
- ❌ `retreat_facilitator` → 0% (admin only)

## 🧪 Smoke Tests

### Core Functionality
```bash
# 1. Catalog loads with search & filters
✅ Visit /services → sections render correctly
✅ Search functionality works
✅ Filter by section works

# 2. Admin panel functionality  
✅ Visit /admin/services → registry metadata displays
✅ Rollout sliders change percentages immediately
✅ Dependency validation prevents invalid states
✅ History panel shows changes with user attribution

# 3. Home page integration
✅ Visit / → featured services grid renders
✅ "More" drawer opens with additional services
✅ Service cards link to correct routes
```

### Cohort Testing (Two Users)
```bash
# Set Whispers to 10% rollout in admin
# User A: Visit /recap or where whispers appear
# User B: Same path → should be consistently enabled/disabled
# Change to 100% → both see it
# Change to 0% → neither sees it
```

### Dreams E2E
```bash
# 1. Create dream: /dreams/new → add segments → save
# 2. Weave: Click "Weave This Night" → recap returned
# 3. RLS: Log in as different user → cannot see other user's dreams
```

### Access Control
```bash
# 1. Visit /admin without proper email → redirected/403
# 2. Try disabling service with dependents → shows blocked message
# 3. Request access on experimental service → logs request
```

## 📊 Performance Validation

### Lighthouse Scores
- **Target**: >90 for Performance, Accessibility, Best Practices
- **Test pages**: `/`, `/services`, `/admin/services`

### Bundle Analysis
```bash
# Verify disabled services don't load heavy bundles
# Network tab: check no unnecessary requests when feature disabled
npm run analyze # or check Vercel bundle analyzer
```

### API Performance
- **Catalog load**: <200ms for /services page
- **Admin toggle**: <500ms for flag updates
- **Cohort check**: <50ms additional overhead

## 🚀 Production Rollout

### Phase 1: Core Launch (Day 1)
```bash
# Merge branch
git checkout main
git merge ian-fix/builds
git push origin main

# Deploy to production
# Enable core services to 100%
```

**Settings:**
- `oracle.chat` → 100%
- `admin.services` → 100% 
- `admin.docs` → 100%
- Catalog visibility → 100%

### Phase 2: Canary Services (Day 2-7)
**Week 1 Targets:**
- Whispers: 10% → 25% → 50%
- Dreams: 5% → 15% → 25%  
- Monitor: CTR, API latency, error rates

### Phase 3: Full Rollout (Day 7-14)
**Week 2 Targets:**
- Increase to 75% → 100% based on metrics
- Enable ADHD mode for beta users
- Promote successful services from "More" to Featured

## 📈 Monitoring & Metrics

### Key Performance Indicators
- **Adoption**: Service tile click rates
- **Performance**: API response times, page load speeds
- **Quality**: Error rates, user feedback
- **Engagement**: Session duration, feature usage depth

### Dashboard Queries
```sql
-- Service adoption over time
SELECT service_key, action, DATE(timestamp), COUNT(*) 
FROM service_usage_events 
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY service_key, action, DATE(timestamp);

-- Flag change audit trail
SELECT key, old_values, new_values, updated_at, updated_by
FROM admin_audit_log 
WHERE table_name = 'feature_flags'
ORDER BY updated_at DESC;
```

## 🆘 Emergency Procedures

### Circuit Breaker
```bash
# Immediate service disable
/admin/services → set rollout to 0%
# API immediately returns disabled state
```

### Rollback
```bash
# Revert to previous deployment
vercel rollback
# Or disable problematic flags in admin
```

### Support Escalation
1. Check `/admin/health` for system status
2. Review error logs in Vercel/Supabase dashboards  
3. Disable individual services via admin panel
4. Contact team with specific error details

## ✅ Success Criteria

### Launch Success
- [ ] All smoke tests passing
- [ ] Core services at 100% with <1% error rate
- [ ] Admin panel functional for flag management
- [ ] Cohort rollouts working consistently
- [ ] Performance targets met (>90 Lighthouse)

### Weekly Success
- [ ] Canary services showing positive adoption metrics
- [ ] No degradation in core service performance
- [ ] Admin actively using progressive rollout controls
- [ ] User feedback positive for new catalog UX

---

**Ready for staging when:**
✅ Branch deployed to preview environment  
✅ Database migrations applied  
✅ Environment variables configured  
✅ Initial feature flags set  

**Ready for production when:**
✅ All smoke tests passing  
✅ Performance metrics within targets  
✅ Admin panel fully functional  
✅ Cohort bucketing validated  