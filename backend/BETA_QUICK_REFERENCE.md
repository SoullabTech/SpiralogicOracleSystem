# 🎯 Beta Testing Quick Reference Card

## 📊 Analytics Events to Monitor

```bash
# Key events during beta testing
onboarding.tone_feedback.submitted     # Sessions 1, 4, 8 feedback
onboarding.bias_decay.evaluated        # Every session 1-10
onboarding.tone_feedback.mismatch      # When user ≠ system prediction  
onboarding.resonance.evaluated         # Relationship quality assessment
personal_oracle.consult                # Every consultation with tone data
```

## 🧪 Critical Success Metrics

| Metric | Target | Red Flag |
|--------|--------|----------|
| **Tone Detection Accuracy** | ≥75% | <60% |
| **Resonance Score** | ≥0.7 avg | <0.5 avg |
| **Crisis Response Time** | <500ms | >2s |
| **Stage Progression** | Natural curve | Sudden jumps |
| **Bias Decay Stability** | Smooth slope | Jagged/erratic |

## 🎭 Tone Detection Patterns

```javascript
// What to expect in analytics
{
  curious: "What/how/why questions, 2+ '?' marks",
  hesitant: "maybe, not sure, nervous, uncertain", 
  enthusiastic: "! marks, excited, amazing, love",
  neutral: "default when no clear markers"
}
```

## 🚨 Crisis Override Triggers

**Red Tier (Immediate):**
- `kill myself`, `end it all`, `want to die`, `suicide`

**Yellow Tier (Overwhelm):**
- `can't breathe`, `everything spinning`, `losing control`

**Expected Response:** Earth element, Protector archetype, grounding language

## 📈 Stage Progression Indicators

| Stage | Session Range | Trust Level | Key Behaviors |
|-------|---------------|-------------|---------------|
| **Structured Guide** | 1-10 | 0.0-0.4 | Practical, clear, step-by-step |
| **Dialogical Companion** | 8-25 | 0.4-0.6 | Questions, perspectives, exploration |
| **Co-Creative Partner** | 20-45 | 0.6-0.75 | Metaphors, paradox, collaboration |
| **Transparent Prism** | 35+ | 0.75+ | Simple clarity, spacious, jargon-free |

## 🔧 Common Beta Issues & Fixes

### Issue: "Responses feel mechanical"
- **Check:** Bias decay factor (should be smooth curve)
- **Look for:** Sudden personality jumps between sessions
- **Fix:** Adjust decay rate in `OnboardingConfig`

### Issue: "Tone mismatch high"
- **Check:** Input parsing edge cases  
- **Look for:** Ambiguous user language patterns
- **Fix:** Expand tone detection keywords

### Issue: "Crisis not triggering"
- **Check:** Crisis keyword matching logic
- **Look for:** Subtle crisis language variations
- **Fix:** Add patterns to `CrisisOverrideConfig`

### Issue: "Stage progression too fast/slow"
- **Check:** Trust level calculation
- **Look for:** Trust score vs session count mismatch
- **Fix:** Adjust `CapacitySignalsFramework` thresholds

## 📋 Beta Testing Checklist

### Pre-Session Setup
- [ ] Analytics pipeline active
- [ ] Crisis override system enabled  
- [ ] Stage configs loaded correctly
- [ ] Feedback service initialized

### During Session Monitoring  
- [ ] Tone detection firing correctly
- [ ] Bias decay analytics emitting  
- [ ] Response templates appropriate for stage
- [ ] Crisis keywords being monitored

### Post-Session Validation
- [ ] Analytics events captured
- [ ] Feedback prompts displayed (sessions 1,4,8)
- [ ] User progression feels natural
- [ ] No technical errors in logs

## 🎯 Test Scenarios Priority

### P0 (Must Work)
1. Crisis override (any crisis language → immediate grounding)
2. Basic tone detection (curious/hesitant/enthusiastic/neutral)
3. Stage 1 structured responses (practical, clear)
4. Feedback collection (sessions 1, 4, 8)

### P1 (Important)  
1. Bias decay curve (smooth evolution over 10 sessions)
2. Stage progression (natural advancement based on trust)
3. Mismatch detection (user feedback ≠ system prediction)
4. Analytics completeness (all events firing)

### P2 (Nice to Have)
1. Advanced stage responses (metaphorical, transparent)
2. Voice synthesis integration
3. Complex crisis scenarios  
4. Edge case tone patterns

## 🚀 Launch Readiness Criteria

✅ **Green Light Indicators:**
- 75%+ tone accuracy across 50+ beta sessions
- <10% crisis false positives 
- Smooth bias decay curves (variance <0.3)
- User satisfaction >70% ("natural evolution" feedback)

❌ **Red Light Indicators:**  
- Crisis override failures (missed danger signals)
- Mechanical relationship progression feedback
- High mismatch rates (>40%) 
- Technical failures in analytics pipeline

## 📞 Escalation Contacts

- **Technical Issues:** Development team
- **Crisis Response Concerns:** Safety team lead
- **Analytics Questions:** Analytics engineer  
- **User Experience Issues:** Product lead

---

*Keep this handy during beta sessions for quick troubleshooting and validation.* 🎯