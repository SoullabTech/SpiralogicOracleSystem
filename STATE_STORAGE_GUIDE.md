# STATE_STORAGE_GUIDE.md

Persistence architecture for UserStateSnapshots in Supabase

⸻

## 📦 Database Schema (Supabase)

```sql
-- Table: user_state_snapshots
create table if not exists user_state_snapshots (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  user_id text not null,
  timestamp timestamptz not null default now(),

  -- Core State
  currents text[] not null,            -- e.g., {fire, water}
  regression boolean default false,
  breakthrough boolean default false,
  trust_level numeric(3,2) default 0,  -- range: 0.0 - 1.0

  -- Reflective Mirrors
  user_language text not null,
  reflection text,
  arc_echo text check (arc_echo in ('threshold','shadow','integration','emergence','spiral')),

  -- Complexity Handling
  parallel_processing text[],          -- e.g., {excitement, grief}
  contradictions text[],

  -- Meta
  system_notes text,
  source_agent text not null default 'PersonalOracleAgent'
);

-- Indexes for fast retrieval
create index on user_state_snapshots (user_id, timestamp);
create index on user_state_snapshots (session_id);
```

⸻

## 🗂 Storage Rules

### 1. Retention
- Keep full detail for 90 days (beta period)
- After 90 days, archive snapshots (flatten into weekly summaries)

### 2. Access Control
- Row-level security (RLS) by user_id
- Only the owner + system agents can read/write

### 3. Compression
- Store parallel_processing and contradictions as JSONB if future complexity grows

⸻

## 🔍 Retrieval Patterns

### By Session

```sql
select * from user_state_snapshots
where session_id = 'abc123'
order by timestamp asc;
```

### By User Timeline

```sql
select timestamp, currents, regression, breakthrough, arc_echo
from user_state_snapshots
where user_id = 'u01'
order by timestamp asc;
```

### Pattern Detection
(e.g., detect spiral phases in the last 30 days)

```sql
select count(*) from user_state_snapshots
where user_id = 'u01'
  and arc_echo = 'spiral'
  and timestamp > now() - interval '30 days';
```

⸻

## 🌀 System Flow

1. **Capture**
   - PersonalOracleAgent calls logUserState(snapshot) after each conversation turn.

2. **Persist**
   - Stored in user_state_snapshots via Supabase client.

3. **Aggregate**
   - Nightly batch job rolls up last 24h into summary (stored separately).

4. **Recall**
   - On session start, agent fetches last 3–5 snapshots for context.

⸻

## 📊 Example Supabase Insert (TypeScript)

```typescript
import { supabase } from "@/lib/supabaseClient";

export async function logUserState(snapshot: UserStateSnapshot) {
  const { error } = await supabase
    .from("user_state_snapshots")
    .insert([{
      session_id: snapshot.sessionId,
      user_id: snapshot.userId,
      timestamp: snapshot.timestamp,
      currents: snapshot.currents,
      regression: snapshot.regression,
      breakthrough: snapshot.breakthrough,
      trust_level: snapshot.trustLevel,
      user_language: snapshot.userLanguage,
      reflection: snapshot.reflection,
      arc_echo: snapshot.arcEcho,
      parallel_processing: snapshot.parallelProcessing,
      contradictions: snapshot.contradictions,
      system_notes: snapshot.systemNotes,
      source_agent: snapshot.sourceAgent,
    }]);

  if (error) {
    console.error("Error logging user state:", error);
  }
}
```

⸻

## ✨ Design Guardrails

- **Never overwrite**: Each entry is immutable — append-only log.
- **Summaries don't erase**: Weekly summaries are additional, not replacements.
- **Trust level sacred**: Adjust slowly; avoid sudden jumps >0.2 between sessions.
- **Respect regression**: Do not downgrade trust when regression = true — it's part of spiral growth.

⸻

Would you like me to also create a STATE_SUMMARY_GENERATOR.md — a nightly process spec that rolls up individual snapshots into a 1-page archetypal "journal summary" per user? That would make weekly reflections easy for both users and guides.