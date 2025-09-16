# STATE_SUMMARY_GENERATOR.md

Nightly + Weekly archetypal roll-ups for UserStateSnapshots

⸻

## 🗓 Process Overview

**Goal:**
Distill dozens of raw user_state_snapshots into one coherent narrative per week, showing arcs without overwhelming detail.

**Cadence:**
- Nightly job → compress past 24h into "Daily Echo"
- Weekly job → compress 7 days of echoes into "Weekly Spiral Summary"

⸻

## 📦 Database Schema (Supabase)

```sql
-- Table: user_state_summaries
create table if not exists user_state_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  start_date date not null,
  end_date date not null,

  -- Aggregated Fields
  dominant_elements text[],         -- {fire, water}
  arc_transitions text[],           -- {threshold → shadow, shadow → spiral}
  regression_events int default 0,
  breakthroughs int default 0,
  avg_trust_level numeric(3,2),

  -- Narrative Fields
  weekly_theme text,                -- "Emerging from grief into clarity"
  key_reflections text[],           -- 3-5 distilled phrases
  archetypal_journey text,          -- Narrative summary

  -- Meta
  created_at timestamptz default now()
);

create index on user_state_summaries (user_id, start_date, end_date);
```

⸻

## ⚙️ Generation Algorithm

**Step 1. Fetch snapshots**

```sql
select * from user_state_snapshots
where user_id = 'u01'
  and timestamp between start_date and end_date
order by timestamp asc;
```

**Step 2. Detect dominants**
- Count frequency of currents → top 2 become dominant_elements
- Count regression + breakthrough flags

**Step 3. Arc transitions**
- Compare sequential arc_echo values → build transition chain

**Step 4. Trust level**
- Average across week
- Flag if trending up/down by >0.1

**Step 5. Narrative synthesis**
- Claude/Oracle generates weekly_theme, key_reflections, archetypal_journey from raw data

⸻

## 🌀 Example Weekly Summary

```json
{
  "user_id": "u01",
  "start_date": "2025-09-08",
  "end_date": "2025-09-15",
  "dominant_elements": ["water", "earth"],
  "arc_transitions": ["shadow → spiral", "spiral → integration"],
  "regression_events": 2,
  "breakthroughs": 1,
  "avg_trust_level": 0.72,
  "weekly_theme": "From heavy waters to grounded clarity",
  "key_reflections": [
    "Held grief with patience",
    "Rediscovered simple grounding rituals",
    "First glimpse of integration emerging"
  ],
  "archetypal_journey": "This week carried the weight of water yet found its balance in earth. Shadows resurfaced not as setbacks, but as reminders of depth. The spiral brought both regression and a breakthrough, teaching that healing is cyclical. Trust grew quietly, steady as soil."
}
```

⸻

## ⏳ Automation Flow

- **Nightly (cron)** → generateDailyEcho(user_id)
- **Weekly (cron, Sunday midnight)** → generateWeeklySummary(user_id)

```typescript
async function generateWeeklySummary(userId: string) {
  const snapshots = await fetchSnapshots(userId, 7);
  const rollup = analyzePatterns(snapshots);

  const narrative = await Claude.generate({
    prompt: `
      Summarize these patterns into a weekly archetypal journey.
      Focus on elements, arcs, regressions, and breakthroughs.
      Keep it reflective, non-directive.
    `,
    context: rollup
  });

  await supabase.from("user_state_summaries").insert([{
    user_id: userId,
    start_date: rollup.startDate,
    end_date: rollup.endDate,
    dominant_elements: rollup.dominantElements,
    arc_transitions: rollup.arcTransitions,
    regression_events: rollup.regressionEvents,
    breakthroughs: rollup.breakthroughs,
    avg_trust_level: rollup.avgTrust,
    weekly_theme: narrative.theme,
    key_reflections: narrative.reflections,
    archetypal_journey: narrative.journey
  }]);
}
```

⸻

## ✨ Guardrails

- **Non-linear honoring**: Summaries capture contradictions and spirals, not just "progress."
- **80/20 principle**: Reflections lean on user language (80%) + system perspective (20%).
- **Sacred privacy**: Weekly summaries belong to the user first; guides only see with consent.
- **Narrative tone**: Always reflective, never evaluative.

⸻

Would you like me to also generate a front-end prototype view (React component) where users can scroll their weekly Spiral Summaries like a mythic journal timeline?