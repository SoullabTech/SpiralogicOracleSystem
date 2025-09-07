-- Migration: Add consciousness turn metadata table
-- Tracks elemental resonance, MicroPsi states, and spiral phases for each interaction

create table if not exists consciousness_turn_meta (
  id bigserial primary key,
  user_id uuid not null,
  turn_id uuid not null,
  element_hint text,
  resonance jsonb,
  micropsi jsonb,
  spiral_phase text,
  latency_ms integer,
  orchestrator_mode text check (orchestrator_mode in ('full', 'lite', 'baseline')),
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_ctm_user_created on consciousness_turn_meta (user_id, created_at desc);
create index if not exists idx_ctm_top_resonance on consciousness_turn_meta ((resonance->>'top'));
create index if not exists idx_ctm_spiral_phase on consciousness_turn_meta (spiral_phase);
create index if not exists idx_ctm_orchestrator_mode on consciousness_turn_meta (orchestrator_mode);

-- Add comments for documentation
comment on table consciousness_turn_meta is 'Tracks consciousness processing metadata for each user interaction';
comment on column consciousness_turn_meta.resonance is 'Elemental resonance scores and top element';
comment on column consciousness_turn_meta.micropsi is 'MicroPsi emotional state data';
comment on column consciousness_turn_meta.spiral_phase is 'Current spiral development phase';
comment on column consciousness_turn_meta.latency_ms is 'Processing latency in milliseconds';
comment on column consciousness_turn_meta.orchestrator_mode is 'Processing mode used (full/lite/baseline)';

-- Sample query helpers (as comments)
-- Recent resonance patterns: SELECT resonance->>'top' as element, count(*) FROM consciousness_turn_meta WHERE user_id = ? AND created_at > now() - interval '7 days' GROUP BY 1;
-- Performance monitoring: SELECT orchestrator_mode, avg(latency_ms), percentile_cont(0.95) within group (order by latency_ms) FROM consciousness_turn_meta WHERE created_at > now() - interval '1 day' GROUP BY 1;