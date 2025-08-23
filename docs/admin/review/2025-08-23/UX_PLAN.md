# UX Plan: Beta → GA
_Generated: 2025-08-23_

## Feature Rollout User Journeys

### 1. Dreams System (Beta → GA)

#### Beta Phase
**Entry**: Invite-only via `/beta/dreams`
**Experience**:
1. First-time: Tutorial overlay explaining dream segments, techniques
2. Daily use: Quick capture with voice note option
3. Weekly: Elemental pattern insights in recap
4. Errors: Graceful fallback to simple text entry

**Success Metrics**:
- 3+ dreams logged per week
- 50%+ use advanced features (segments, techniques)
- <5% error rate on weave operations

#### GA Readiness Checklist
- [ ] Empty state with guided onboarding
- [ ] Offline capture with sync queue
- [ ] Export functionality (JSON/PDF)
- [ ] Mobile-optimized entry flow
- [ ] Batch operations (tag multiple dreams)

### 2. Whispers/ADHD Mode (Beta → GA)

#### Beta Phase
**Entry**: Settings toggle with info modal
**Experience**:
1. Onboarding: "Try Quick Capture" CTA in empty state
2. Capture: One-tap from any screen, auto-tag by context
3. Surface: Contextual whispers in daily recap
4. Tune: Drag weights in `/dev/whispers/tune`

**Success Metrics**:
- 10+ micro-memories per day
- 70%+ whisper relevance (implicit from clicks)
- <200ms ranking latency

#### GA Readiness Checklist
- [ ] Voice capture integration
- [ ] Reminder notifications (opt-in)
- [ ] Whisper history view
- [ ] Bulk memory management
- [ ] Cross-device sync indicator

### 3. Maya Voice (Already GA, Enhance)

#### Current State
- Voice button in Oracle chat
- Greeting personalization
- ADHD-friendly cues

#### Enhancement Plan
1. **Ambient Mode**: Background listening with wake word
2. **Voice Training**: Personalize recognition per user
3. **Multilingual**: Spanish, French, German
4. **Emotion Detection**: Adjust tone based on user state

### 4. Admin Panel (Beta → GA)

#### Beta Phase
**Entry**: Email whitelist only
**Experience**:
1. Dashboard: System health at a glance
2. Features: Toggle flags with cohort targeting
3. Whispers: Ranking analytics and tuning
4. Monitoring: Real-time error rates

**Success Metrics**:
- <3 clicks to any admin action
- Real-time updates without refresh
- Export all data views

#### GA Readiness Checklist
- [ ] Role-based access (viewer/editor/admin)
- [ ] Audit trail for all changes
- [ ] Scheduled reports via email
- [ ] API for external monitoring
- [ ] Mobile admin app

## Progressive Disclosure Strategy

### New User Flow
```
Day 1: Oracle chat only
Day 3: Unlock dreams (if 3+ conversations)
Day 7: Enable whispers (if dreams active)
Day 14: Full feature access
```

### Feature Gating by Engagement
1. **Casual** (1-2x/week): Core Oracle + Basic dreams
2. **Regular** (3-5x/week): + Whispers, elemental insights
3. **Power** (Daily): + Advanced analytics, API access
4. **Pioneer**: Beta features, direct feedback channel

## Mobile-First Considerations

### Critical Paths
1. **Quick Capture**: 
   - Hardware button shortcut
   - Widget for home screen
   - Share sheet integration

2. **Voice First**:
   - Default to voice for all inputs
   - Transcript editing inline
   - Background audio processing

3. **Offline Resilience**:
   - Queue all captures locally
   - Sync indicator in status bar
   - Conflict resolution UI

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- [ ] Keyboard navigation for all features
- [ ] Screen reader announcements
- [ ] High contrast mode
- [ ] Reduced motion option
- [ ] Focus indicators

### Neurodivergent Accommodations
- [ ] Simplified UI mode
- [ ] Predictable layouts (no surprises)
- [ ] Clear action feedback
- [ ] Undo for all actions
- [ ] Progress saving indicators

## Error States & Recovery

### User-Facing Errors
1. **Network Issues**: 
   - "Working offline" banner
   - Automatic retry with backoff
   - Manual sync button

2. **AI Failures**:
   - Fallback to simple save
   - "Oracle is thinking..." states
   - Alternative action suggestions

3. **Quota Limits**:
   - Clear usage indicators
   - Upgrade prompts at 80%
   - Grace period for overages

## Onboarding Sequences

### Dreams Feature
1. **Empty State**: "Record your first dream" with example
2. **First Entry**: Tooltip for segments, auto-save indicator
3. **First Weave**: Celebration animation, share prompt
4. **Weekly Summary**: Unlock after 7 dreams

### Whispers Feature
1. **Toggle On**: "What's on your mind?" prompt
2. **First Capture**: Success animation, explain surfacing
3. **First Surface**: Highlight in recap with "Why this?"
4. **Tuning Unlock**: After 20 captures, show weights

### Admin Access
1. **First Login**: Video walkthrough option
2. **Feature Flags**: Warning about user impact
3. **Metrics**: Explain each metric with hover
4. **Actions**: Require confirmation with impact preview

## Beta → GA Graduation Triggers

### Automatic Graduation
- 30 days active use
- <2% error rate
- 80%+ feature adoption
- Positive sentiment (>4.0 stars)

### Manual Holds
- Critical bug active
- Performance regression
- Security review pending
- Negative user feedback spike

## Post-GA Evolution

### V2 Features (3-6 months)
1. **Dream Analysis**: Sleep pattern correlation
2. **Whisper Chains**: Connect related memories
3. **Voice Cloning**: Personalized Maya voice
4. **Team Spaces**: Shared oracle sessions

### Platform Expansion
1. **Native Mobile**: iOS/Android apps
2. **Browser Extension**: Capture from anywhere
3. **API/SDK**: Third-party integrations
4. **Wearables**: Apple Watch, Fitbit

## Success Metrics Dashboard

### User Engagement
- Daily Active Users (DAU)
- Feature adoption funnels
- Time to first value (TTFV)
- Retention curves by cohort

### System Health
- API latency (p50, p95, p99)
- Error rates by endpoint
- Database query performance
- Cache hit rates

### Business Impact
- Conversion to paid
- Feature correlation with retention
- Support ticket volume
- User satisfaction (NPS)