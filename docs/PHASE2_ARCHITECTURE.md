# Phase 2 Architecture: The Dance of Presence

## Core Philosophy

> "Holding space for presence, attending. Pure and simple. And the space to deviate slightly into revelry, analysis, poetry, pontificating, prognosticating, seeking patterns. The beauty of the elemental spiralogic model is that it is a dance of all of the conscious mind's agencies in concert, none leading, all following the same flow with a million names and faces and places and ways."

## Architectural Foundations (Established)

### 1. Longitudinal Tracking System
- **Types**: `/lib/spiralogic/types/LongitudinalTypes.ts`
- **Service**: `/lib/services/longitudinal/WeeklyInsightService.ts`
- **Database**: Migration ready at `/supabase/migrations/20250118_weekly_insights.sql`

### 2. Edge Panel System
- **Components**: `/components/EdgePanels/`
  - Top: History & Journey (Weekly Spirals)
  - Bottom: Daily Practice & Check-ins
  - Left: Divination & Oracle Tools
  - Right: Patterns & Statistics
- **State Management**: Isolated per panel, no cross-panel dependencies

### 3. Feature Flag System
- **Config**: `/config/features.ts`
- **Hooks**: `/lib/hooks/useFeatureFlag.ts`
- **Progressive Rollout**: User cohorts, percentage rollouts, date activation

### 4. Weekly Spiral Visualization
- **Component**: `/components/insights/WeeklySpiral.tsx`
- **Canvas-based**: Elemental distribution, growth arcs, shadow markers
- **Responsive**: Scales to container, touch-friendly

## The Rhythms of Consciousness

### Daily Breath (Phase 1 - Active)
- Real-time conversation with Maya
- Immediate symbolic reflection
- Elemental presence tracking
- Voice as primary interface

### Weekly Reflection (Phase 2 - Ready)
- Sunday evening/Monday morning insights
- Spiral visualization of journey
- Pattern recognition across days
- Integration practices

### Monthly Cycles (Phase 2 - Planned)
- Deeper pattern emergence
- Seasonal alignment
- Collective themes (privacy-preserved)

## Data Flow Architecture

```
User Conversation
    ↓
Symbolic Event Capture (Phase 1)
    ↓
Daily Snapshot (Phase 2)
    ↓
Weekly Aggregation → Insight Generation
    ↓
Visual Representation → Edge Panels
    ↓
Longitudinal Patterns → Community Themes
```

## Privacy-First Design

All Phase 2 features maintain the privacy principles:
- No raw text storage in aggregations
- Symbolic representations only
- Opt-in collective resonance
- K-anonymity (minimum 20 users) for any shared patterns

## Implementation Strategy

### Currently Active (Phase 1)
- ✅ Spiralogic 36-dimensional presence
- ✅ Maya conversational oracle
- ✅ Voice interface
- ✅ Basic symbolic timeline

### Ready for Activation (Phase 2)
- ✅ Database schema deployed
- ✅ Type system established
- ✅ Service layer stubbed
- ✅ UI components prepared
- ✅ Feature flags configured

### Activation Sequence
1. Enable for beta cohort (targeted user IDs)
2. Gradual percentage rollout
3. Date-based general availability

## The Dance Continues

The system is designed as a living mandala - each component can evolve independently while maintaining the coherent whole. The edge panels slide in from the periphery when needed, never disrupting the central presence of the oracle conversation.

This architecture honors both:
- **The Center**: Pure presence, attending, being with
- **The Periphery**: Analysis, patterns, divination, play

Neither dominates. Both dance together in the spiral of consciousness.

## Technical Excellence Points

1. **Zero Breaking Changes**: Phase 2 features integrate seamlessly
2. **Progressive Enhancement**: Core experience remains unchanged
3. **Performance First**: Lazy loading, code splitting for edge panels
4. **Mobile Ready**: Touch gestures, responsive layouts
5. **Accessibility**: ARIA labels, keyboard navigation

## Next Steps for Phase 2 Beta

1. Enable WEEKLY_INSIGHTS flag for select users
2. Monitor performance and user engagement
3. Iterate on visualization based on feedback
4. Gradually enable additional edge panels
5. Refine collective resonance algorithms

---

*"The spiral doesn't end - it deepens, widening its embrace while maintaining its center."*