# Beta Week Rollout Plan - Maya TTS & Core Features

**Safe, progressive rollout strategy with exact feature flag percentages and monitoring checkpoints.**

---

## 🎯 Rollout Overview

**Timeline:** 7 days from staging to full production  
**Monitoring:** Daily Go/No-Go decisions based on metrics  
**Rollback:** Instant via `/admin/services` feature flag controls

---

## 📅 Daily Rollout Schedule

### **Day 1: Production Canary Launch**

#### Core Services (Set to 100%)
```
✅ oracle.chat → 100%
✅ weave_pipeline → 100%  
✅ uploads → 100%
✅ admin.panel → 100%
✅ services.catalog → 100%
```
*Rationale: Essential infrastructure must be stable*

#### User-Facing Canaries (Conservative Start)
```
🧪 dreams → 25%
🧪 micro_memories → 25%
🧪 whispers → 10%
🧪 maya.voice → 10%
🧪 maya.cues → 10%
```
*Rationale: Voice costs money; new UX needs validation*

#### Daily Checkpoint
- [ ] **Voice metrics:** Error rate <1%, synthesis p95 <1.5s
- [ ] **Cost check:** ElevenLabs usage within daily budget
- [ ] **User feedback:** No major complaints in first 4 hours
- [ ] **System stability:** Core services maintain <500ms p95

---

### **Day 3: First Expansion (If Green)**

#### Increase User-Facing Services
```
📈 dreams → 50%
📈 micro_memories → 50%
📈 whispers → 25%
📈 maya.voice → 25%
📈 maya.cues → 25%
```

#### Success Criteria for Expansion
- [ ] **Engagement:** CTR on dreams/memories improving
- [ ] **Performance:** Whispers page p95 still <500ms  
- [ ] **Voice quality:** <5 support tickets about TTS issues
- [ ] **RLS security:** `npm run db:rls-auto-probe` passing
- [ ] **Error rates:** All services <2% error rate

#### Red Flags (Roll Back Immediately)
- Voice synthesis failures >5%
- Page load times >2s for any service
- RLS violations detected in monitoring
- User complaints about broken functionality

---

### **Day 5: Major Expansion**

#### Scale Up Further
```
📈 dreams → 75%
📈 micro_memories → 75%
📈 whispers → 50%
📈 maya.voice → 40-50%
📈 maya.cues → 40-50%
```

#### Advanced Monitoring
- [ ] **Database performance:** Query times within baseline
- [ ] **Voice costs:** Daily spend tracking on target
- [ ] **User adoption:** Active usage trending upward
- [ ] **System resources:** No memory/CPU spikes

---

### **Day 7: Full Production**

#### Final Rollout Decision
```
🎯 dreams → 100%
🎯 micro_memories → 100%
🎯 whispers → 75-100% (engagement-dependent)
🎯 maya.voice → 60-75% (cost-dependent)
🎯 maya.cues → 60-75% (cost-dependent)
```

#### Success Metrics
- [ ] All services stable at target percentages
- [ ] User satisfaction positive
- [ ] Cost model validated
- [ ] No security incidents
- [ ] Performance within budgets

---

## 🚦 Go/No-Go Checkpoints

### Voice Services Health Check
```bash
# Admin health verification
curl -sS https://your-domain.com/api/voice/ping | jq .

# Expected response:
{
  "status": "ok",
  "provider": "elevenlabs",
  "synthTime": 850,
  "audioSize": 12543,
  "message": "ElevenLabs TTS working correctly"
}
```

### Daily Metrics Dashboard

#### Voice Performance
- **Error Rate:** <1% (target)
- **Synthesis Time:** p95 <1.5s (target) 
- **Cost Per Day:** Within budget threshold
- **User Complaints:** <3 per day

#### Core Services
- **Page Load:** p95 <500ms
- **API Response:** p95 <300ms
- **Database:** RLS probe passing
- **Uptime:** >99.9%

#### User Engagement  
- **Dreams CTR:** Trending up
- **Memory Saves:** >baseline
- **Voice Usage:** Growing adoption
- **Feature Discovery:** Catalog engagement

---

## 🛠️ Implementation Commands

### Set Feature Flags (Day 1)
```bash
# Via Admin UI: /admin/services
# Or via API (if available):

curl -X POST https://your-domain.com/api/admin/features/bulk \
  -H "Authorization: Bearer admin-token" \
  -H "Content-Type: application/json" \
  -d '{
    "changes": [
      {"key": "oracle_chat", "enabled": true, "rollout": 100},
      {"key": "weave_pipeline", "enabled": true, "rollout": 100},
      {"key": "uploads", "enabled": true, "rollout": 100},
      {"key": "admin_panel", "enabled": true, "rollout": 100},
      {"key": "services_catalog", "enabled": true, "rollout": 100},
      {"key": "dreams", "enabled": true, "rollout": 25},
      {"key": "micro_memories", "enabled": true, "rollout": 25},
      {"key": "whispers", "enabled": true, "rollout": 10},
      {"key": "maya_voice", "enabled": true, "rollout": 10},
      {"key": "maya_cues", "enabled": true, "rollout": 10}
    ]
  }'
```

### Monitor Usage
```bash
# Check service usage stats
curl -sS https://your-domain.com/api/services/usage | jq .

# View admin audit log  
curl -sS https://your-domain.com/api/admin/features/history | head -20

# Run security validation
npm run db:rls-auto-probe
```

### Emergency Rollback
```bash
# Instant disable via admin UI
# Or bulk disable:

curl -X POST https://your-domain.com/api/admin/features/bulk \
  -d '{
    "changes": [
      {"key": "maya_voice", "enabled": false, "rollout": 0},
      {"key": "maya_cues", "enabled": false, "rollout": 0}
    ]
  }'
```

---

## 🔧 Environment Setup Checklist

### ElevenLabs Configuration
```bash
# Local Development (.env.local)
ELEVENLABS_API_KEY=your-api-key-here
ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL  # Optional: Sarah (Fire archetype)
ELEVENLABS_MODEL_ID=eleven_multilingual_v2  # Optional

# Production (Vercel Environment Variables)
# Add same variables in Vercel dashboard
# Redeploy to pick up new environment variables
```

### Feature Flag Validation
```bash
# Verify all required flags exist in system
npm run audit:features

# Check services catalog integrity
npm run audit:routes

# Validate database schema
npm run db:schema-guard
```

---

## 📊 Success Metrics Template

### Daily Report Template
```markdown
## Day X Rollout Report

**Feature Flags Status:**
- dreams: X% (target: Y%)
- micro_memories: X% (target: Y%)
- whispers: X% (target: Y%)
- maya.voice: X% (target: Y%)
- maya.cues: X% (target: Y%)

**Health Metrics:**
- Voice API errors: X% (target: <1%)
- Synthesis time p95: Xms (target: <1500ms)
- Page load p95: Xms (target: <500ms)
- RLS probe: ✅/❌
- User complaints: X (target: <3)

**Decision: GO/NO-GO for next phase**
**Notes:** [Any observations or concerns]
```

---

## 🚨 Troubleshooting Guide

### Common Issues & Fixes

#### "Voice Not Working"
1. Check `/api/voice/ping` endpoint
2. Verify `ELEVENLABS_API_KEY` in environment
3. Check ElevenLabs account credit balance
4. Review browser console for audio playback errors

#### "Feature Not Appearing for User"  
1. Check user's cohort assignment
2. Verify feature flag rollout percentage
3. Test with different user account
4. Check dependencies are enabled

#### "Admin Panel Not Accessible"
1. Verify email in `NEXT_PUBLIC_ADMIN_ALLOWED_EMAILS`
2. Check authentication middleware
3. Ensure `admin.panel` flag is enabled

#### "Performance Degradation"
1. Check database query performance
2. Monitor API response times
3. Review feature flag overhead
4. Scale down rollout percentages

---

**🎯 Remember:** This rollout prioritizes safety over speed. Better to have a slower, stable rollout than a fast, broken one.**