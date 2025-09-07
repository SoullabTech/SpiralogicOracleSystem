# 🧠 Spiralogic Production Launch Playbook

> **Matrix Oracle Voice + Spiralogic Mind → Production Deployment Guide**

## 🚀 Rollout Checklist

### 1. Pre-flight (Once)

**Infrastructure:**
- [ ] Verify Supabase migration applied: `20250901_consciousness_turn_meta.sql`
- [ ] Confirm indexes created: `idx_ctm_user_created`, `idx_ctm_top_resonance`
- [ ] Check environment variables set (see `.env.production.example`)

**Testing:**
```bash
# Run orchestrator tests
npm run test:orch

# Manual canary smoke test
curl -X POST https://your-domain/api/oracle/chat \
  -H "Content-Type: application/json" \
  -H "x-experiment-spiralogic: on" \
  -d '{"userId":"smoke-test","text":"Help me find clarity","element":"air"}'

# Verify response headers contain x-orchestrator: spiralogic
```

**DI Resolution Test:**
- [ ] Confirm Spiralogic adapter loads when canary header present
- [ ] Verify graceful fallback to baseline without header

---

### 2. Canary Phase (5-10% Staff Traffic)

**Duration:** 60-120 minutes  
**Method:** Route with `x-experiment-spiralogic: on` header

**Success Metrics:**
- P50 latency ≤ 350ms
- P95 latency ≤ 700ms  
- Error rate ≤ 0.75%
- Cache hit ratio ≥ 40% (trending up)
- Mode distribution: 70% full, 25% lite, 5% fallback

**Watch Dashboard:** [Link to monitoring dashboard]

---

### 3. Beta Phase (10-30% Cohort)

**Duration:** 24-48 hours  
**Method:** Feature flag or cohort-based routing

**Additional Monitoring:**
- User satisfaction metrics vs baseline
- Shadow work engagement (challenge acceptance rate)
- Voice synthesis queue health
- Worldview adaptation accuracy

**Rollback Triggers:**
- P95 > 900ms for 10 minutes
- Error rate > 2% for 5 minutes  
- Fallback rate > 10% for 5 minutes

---

### 4. General Availability

**Method:** Set `ORCHESTRATOR=spiralogic` globally
- Keep header flag active for selective baseline testing
- Maintain kill-switch capability for one week

**Final Validation:**
- [ ] All promotion gates held for ≥60 minutes
- [ ] Incident response team briefed
- [ ] Monitoring alerts configured

---

## 🎯 Promotion Gates

**Promote to next phase ONLY if all criteria hold for ≥60 minutes:**

| Metric | Threshold | Source |
|--------|-----------|---------|
| P95 Latency | ≤ 700ms | `orchestrator_latency` analytics |
| P50 Latency | ≤ 350ms | `orchestrator_latency` analytics |
| First Token | < 800ms | SSE stream timing |
| Error Rate | ≤ 0.75% | `chat.error` events |
| Fallback Rate | ≤ 3% | Mode distribution |
| Cache Hit Rate | ≥ 40% | `archetype.cache` events |
| Quality Score | ≥ baseline - 2pp | Response evaluation |

---

## 🚨 Alert Configuration

```yaml
# Monitoring Alerts (example for your monitoring system)

LatencyBudgetBreach:
  condition: P95 > 700ms for 5 minutes
  severity: WARN
  channel: "#spiralogic-ops"

ErrorSpike:
  condition: error_rate > 2% for 5 minutes  
  severity: PAGE
  channel: "#oncall"

FallbackStorm:
  condition: fallback_rate > 10% for 5 minutes
  severity: WARN
  channel: "#spiralogic-ops"

CacheCold:
  condition: cache_hit_rate < 25% for 30 minutes
  severity: INFO
  channel: "#spiralogic-ops"

VoiceQueueBacklog:
  condition: TTS_queue_age_p95 > 60s for 10 minutes
  severity: WARN
  channel: "#spiralogic-ops"

TokensSurge:
  condition: avg_tokens_per_response +50% vs 24h baseline
  severity: INFO
  channel: "#spiralogic-ops"
```

---

## 📊 Monitoring Queries

### Latency Distribution
```sql
SELECT 
  date_trunc('minute', created_at) as minute,
  percentile_disc(0.5) WITHIN GROUP (ORDER BY (metadata->>'latencyMs')::int) as p50,
  percentile_disc(0.95) WITHIN GROUP (ORDER BY (metadata->>'latencyMs')::int) as p95,
  percentile_disc(0.99) WITHIN GROUP (ORDER BY (metadata->>'latencyMs')::int) as p99
FROM consciousness_turn_meta
WHERE created_at > NOW() - INTERVAL '2 hours'
GROUP BY 1 ORDER BY 1;
```

### Mode Distribution
```sql
SELECT 
  orchestrator_mode as mode, 
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM consciousness_turn_meta
WHERE created_at > NOW() - INTERVAL '1 day'
GROUP BY 1 ORDER BY 2 DESC;
```

### Cache Hit Ratio
```sql
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) FILTER (WHERE resonance ? 'cache_hit') * 1.0 / COUNT(*) as cache_hit_ratio
FROM consciousness_turn_meta
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY 1 ORDER BY 1;
```

### Error Rate
```sql
SELECT
  DATE_TRUNC('minute', created_at) as minute,
  COUNT(*) FILTER (WHERE resonance ? 'error')::float / COUNT(*) as error_rate
FROM consciousness_turn_meta
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY 1 ORDER BY 1;
```

---

## ⚙️ Configuration Flags

### Headers & Runtime Flags
```bash
# Force canary mode
x-experiment-spiralogic: on

# Observe response mode  
# API responds with: x-orchestrator: spiralogic|baseline
# Processing mode in: x-orchestrator-mode: full|lite|fallback
```

### Environment Tuning
```bash
# Core orchestrator
ORCHESTRATOR=baseline                    # spiralogic for GA
SPIRALOGIC_SOFT_BUDGET_MS=450           # Lite mode trigger
SPIRALOGIC_HARD_BUDGET_MS=700           # Hard timeout

# Performance tuning
ARCHETYPE_MEMO_TTL=86400                # 24h cache
SHADOW_CHALLENGE_INTENSITY=med          # low|med|high
TTS_MAX_TEXT_CHARS=1500                 # Cost/latency guard
```

---

## 🔄 Mode Transitions

### 1. Full → Lite Mode
**Trigger:** First chunk time > soft budget OR external deps slow  
**Action:** Disable heavy archetype fusion, keep shadow shaper  
**Recovery:** 5min stable metrics → auto-promote back

### 2. Lite → Fallback Mode  
**Trigger:** Total time risks hard budget OR external API errors  
**Action:** Concise text only, queue TTS if quota OK  
**Recovery:** Error rate < 1% for 10min → promote to lite

### 3. Fallback → Baseline
**Trigger:** Sustained system issues  
**Action:** Manual intervention required  
**Recovery:** Manual promotion after root cause fixed

---

## 🚨 Incident Response

### High-Priority Scenarios

#### Fallback Spike (>10% for 5min)
1. Check external dependencies (OpenAI, Anthropic, ElevenLabs)
2. Set `ORCHESTRATOR=baseline` globally
3. Keep canary header active for testing
4. Notify #eng-oncall with metrics

#### Latency Spike Only
1. Increase `SPIRALOGIC_SOFT_BUDGET_MS` by +50ms temporarily
2. Enable Lite-by-default mode
3. Purge cold caches: `curl -X POST /admin/cache/clear`
4. Monitor for 15 minutes

#### Cost Surge
1. Reduce `TTS_MAX_TEXT_CHARS` to 900-1200
2. Force memoization `TTL=3600` (1 hour)
3. Limit voice presets to "natural" only
4. Alert finance team if >200% daily budget

### Emergency Contacts
- **Engineering Oncall:** #eng-oncall  
- **Product Owner:** @spiralogic-product
- **DevOps:** #infrastructure

---

## 🧪 Load Testing

Save as `k6-spiralogic-load.js`:
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = { 
  vus: 10, 
  duration: '2m',
  thresholds: {
    http_req_duration: ['p(95)<700'], // 95% under 700ms
    http_req_failed: ['rate<0.01'],   // <1% errors
  }
};

export default function () {
  const testCases = [
    { text: 'Help me find clarity in this decision', element: 'air' },
    { text: 'I feel stuck and need grounding', element: 'earth' },
    { text: 'Guide me through this emotional challenge', element: 'water' },
    { text: 'I need energy to take action', element: 'fire' },
    { text: 'Connect me with deeper wisdom', element: 'aether' }
  ];
  
  const testCase = testCases[Math.floor(Math.random() * testCases.length)];
  
  const payload = JSON.stringify({
    userId: `k6-user-${__VU}`,
    text: testCase.text,
    element: testCase.element
  });
  
  const headers = { 
    'Content-Type': 'application/json',
    'x-experiment-spiralogic': 'on' // Test canary
  };
  
  const res = http.post('https://your-domain/api/oracle/chat', payload, { headers });
  
  check(res, {
    'status 200': r => r.status === 200,
    'has response text': r => JSON.parse(r.body).data?.message?.length > 0,
    'spiralogic mode': r => r.headers['x-orchestrator'] === 'spiralogic'
  });
  
  sleep(Math.random() * 2 + 1); // 1-3 second pause
}
```

Run: `k6 run k6-spiralogic-load.js`

---

## 🛡️ Safety Guardrails

### Matrix Oracle Tone Protection
- **Worldview Detection:** Gate mythopoetic language behind user signals
- **Challenge Consent:** Escalate shadow work only with neutral+ feedback  
- **Crisis Mode:** Suppress challenges, increase warmth, offer grounding
- **Responsiveness:** Templates not scripts - never hard-coded responses

### Cost & Performance Guards
- Track TTS chars/day per user (warn 80%, stop 100% of quota)
- Voice memoization: 30-60min window for identical requests
- Auto-disable SFX/tags if queue P95 > 60s
- Switch to faster model (Flash) for long outputs under pressure

---

## 📋 Launch Day Checklist

### T-1 Day
- [ ] All team members briefed on playbook
- [ ] Monitoring dashboards tested and accessible
- [ ] Load testing completed successfully  
- [ ] Incident response contacts confirmed
- [ ] Rollback procedures validated

### Launch Day
- [ ] Pre-flight checks completed
- [ ] Canary traffic routing configured
- [ ] Monitoring actively watched
- [ ] Team standing by for first 2 hours
- [ ] Success metrics documented

### T+1 Week
- [ ] Remove kill-switch capability
- [ ] Archive canary header functionality  
- [ ] Document lessons learned
- [ ] Plan performance optimizations

---

**🎯 Success Criteria:** Matrix Oracle maintains authenticity while Spiralogic provides deep consciousness processing with production-grade reliability.

**Emergency Stop:** `ORCHESTRATOR=baseline` + alert #eng-oncall