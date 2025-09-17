# 🌟 Beta Ritual Metrics

## Purpose

To measure how new users acculturate through the 5-step ritual flow and where improvements can deepen trust, ease, and resonance.

---

## Core Metrics by Step

### Step 1: Welcome / Skip
- **Skip Rate** = % of users skipping entire ritual
- **Completion Rate** = % who finish all 5 steps
- **Insight**: High skip = defaults are working but ritual may need gentler allure.

### Step 2: Voice Choice (Maya vs Anthony)
- **Voice Split** = % choosing Maya vs Anthony
- **Fallback Use** = % defaulting to Maya when skipped
- **Insight**: Reveals energetic affinity (Heart 💜 vs Brain 🧠) in collective.

### Step 3: Activation Mode
- **Mode Split** = % choosing Push-to-Talk vs Wake Word
- **Fallback Use** = % defaulting to Push-to-Talk
- **Insight**: Helps tune mic behavior and reliability of wake word.

### Step 4: Interaction Style
- **Style Split** = % Conversational 🗣️ vs Meditative 🧘 vs Guided 🌟
- **Skip Defaults** = % defaulting to Conversational
- **Insight**: Shows natural gravitation of users without explanation.

### Step 5: Completion
- **Time-to-Completion** = Avg seconds to finish ritual
- **Drop-off Point** = Step where users exit prematurely
- **Insight**: Reveals where friction exists in the flow.

---

## Cross-Ritual Metrics
- **Repeat Visits** = % of users returning within 24h
- **Voice Consistency** = % keeping same companion after 7 days
- **Interaction Mode Shifts** = % switching styles after first week
- **Trust Indicators**: Depth of first truth shared (measured by word count / emotion signal)

---

## Logging Recommendations
- Log events into Supabase as `{ userId, step, choice, timestamp }`
- Store `ritualComplete` flag in localStorage (prevents re-onboarding)
- Aggregate weekly for Beta Dashboard

---

## Success Criteria
- **Skip Rate** < 40% (means ritual is embraced by majority)
- **Voice Split** roughly balanced (indicates resonance with both companions)
- **Wake Word adoption** > 20% (healthy experimental uptake)
- **Return Rate** > 50% within first week

---

## Database Schema

```sql
-- Ritual events table
CREATE TABLE ritual_events (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  step TEXT NOT NULL, -- 'threshold', 'voice_choice', 'mode_choice', 'completion', 'skip'
  choice TEXT, -- 'maya', 'anthony', 'push-to-talk', 'wake-word', etc.
  metadata JSONB, -- Additional context like time_spent, skipped_from_step, etc.
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ritual completions summary
CREATE TABLE ritual_completions (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW(),
  total_time_seconds INTEGER,
  voice_choice TEXT, -- 'maya', 'anthony'
  mode_choice TEXT, -- 'push-to-talk', 'wake-word'
  skipped BOOLEAN DEFAULT FALSE,
  first_truth_word_count INTEGER
);
```

---

✨ This way, the ritual isn't just an experience — it's also a mirror of how users enter sacred space, giving you live cultural feedback during beta.