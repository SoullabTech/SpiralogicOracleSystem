-- Migration: Emotional Resonance Mapping for Step 11
-- Extends existing emotional capabilities with cross-modal resonance tracking

-- Enhanced emotional resonance tracking table
create table if not exists emotional_resonance_sessions (
  id bigserial primary key,
  user_id uuid not null,
  session_id uuid not null default gen_random_uuid(),
  session_type text not null check (session_type in ('voice', 'chat', 'journal', 'mixed')),
  
  -- VAD Emotional Dimensions (building on existing schema)
  valence_avg numeric(4,3), -- -1.0 to 1.0
  arousal_avg numeric(4,3), -- 0.0 to 1.0
  dominance_avg numeric(4,3), -- 0.0 to 1.0
  
  -- Emotional Stability Metrics
  emotional_variance numeric(4,3), -- How much emotions fluctuated
  resonance_coherence numeric(4,3), -- Cross-modal consistency score
  trust_progression numeric(4,3), -- Vulnerability/openness progression
  
  -- Primary Emotional Signature
  primary_emotion text,
  emotion_intensity numeric(4,3),
  emotion_color text, -- Hex color code
  energy_signature text, -- elemental mapping
  
  -- Session Metadata
  duration_seconds integer,
  interaction_count integer,
  modalities_used text[], -- ['voice', 'text'] etc
  
  -- Timestamps
  session_start timestamptz not null,
  session_end timestamptz,
  created_at timestamptz default now()
);

-- Detailed emotional moments table (granular tracking)
create table if not exists emotional_moments (
  id bigserial primary key,
  session_id uuid references emotional_resonance_sessions(session_id),
  user_id uuid not null,
  
  -- Moment Context
  modality text not null check (modality in ('voice', 'text', 'journal')),
  content_snippet text, -- First 100 chars for context
  
  -- Emotional Analysis
  valence numeric(4,3),
  arousal numeric(4,3), 
  dominance numeric(4,3),
  primary_emotion text,
  emotion_intensity numeric(4,3),
  emotion_confidence numeric(4,3), -- AI confidence in analysis
  
  -- Voice-Specific Metrics (when modality = 'voice')
  pitch_variance numeric(6,3),
  amplitude_avg numeric(6,3),
  speaking_rate numeric(6,3),
  pause_pattern jsonb, -- {"short": 3, "medium": 1, "long": 0}
  
  -- Text-Specific Metrics (when modality = 'text' or 'journal')
  word_count integer,
  sentiment_keywords text[],
  linguistic_complexity numeric(4,3),
  
  -- Contextual Analysis
  archetypal_themes text[], -- ['seeker', 'shadow', 'anima'] etc
  spiral_phase_indicators text[],
  crisis_indicators boolean default false,
  breakthrough_indicators boolean default false,
  
  -- Timing
  moment_timestamp timestamptz not null,
  created_at timestamptz default now()
);

-- Emotional trends and patterns table
create table if not exists emotional_trends (
  id bigserial primary key,
  user_id uuid not null,
  
  -- Trend Period
  period_type text not null check (period_type in ('daily', 'weekly', 'monthly')),
  period_start date not null,
  period_end date not null,
  
  -- Aggregate Emotional Metrics
  avg_valence numeric(4,3),
  avg_arousal numeric(4,3),
  avg_dominance numeric(4,3),
  emotional_stability numeric(4,3), -- Lower variance = more stable
  
  -- Modality Comparisons
  voice_vs_text_coherence numeric(4,3), -- How similar emotions are across modalities
  modality_preferences jsonb, -- {"voice": 0.7, "text": 0.8, "journal": 0.9} trust levels
  
  -- Dominant Patterns
  dominant_emotion text,
  emotional_trajectory text check (emotional_trajectory in ('improving', 'stable', 'declining', 'fluctuating')),
  energy_signature_progression text[],
  
  -- Insights
  notable_shifts jsonb, -- [{"date": "2025-01-15", "from": "anxious", "to": "hopeful", "trigger": "voice_session"}]
  recommendations text[],
  
  -- Maya's Observations
  maya_insights text,
  compassionate_observations text,
  
  created_at timestamptz default now(),
  
  -- Ensure one record per user per period
  unique(user_id, period_type, period_start)
);

-- Cross-modal resonance correlation table
create table if not exists cross_modal_resonance (
  id bigserial primary key,
  user_id uuid not null,
  
  -- Modalities being compared
  modality_a text not null,
  modality_b text not null,
  
  -- Correlation Metrics
  emotional_coherence numeric(4,3), -- How aligned emotions are across modalities
  valence_correlation numeric(4,3),
  arousal_correlation numeric(4,3),
  dominance_correlation numeric(4,3),
  
  -- Pattern Analysis
  synchronicity_score numeric(4,3), -- How often modalities show same emotions
  complementarity_score numeric(4,3), -- How well modalities balance each other
  authenticity_indicator numeric(4,3), -- Consistency suggests authentic expression
  
  -- Context
  sample_size integer, -- Number of moments compared
  analysis_period_days integer,
  
  -- Insights
  key_patterns text[],
  divergence_insights text[], -- When modalities differ, what does it mean?
  
  created_at timestamptz default now(),
  
  -- Ensure one correlation record per user per modality pair
  unique(user_id, modality_a, modality_b)
);

-- Performance indexes
create index if not exists idx_ers_user_session_type on emotional_resonance_sessions (user_id, session_type, session_start desc);
create index if not exists idx_ers_energy_signature on emotional_resonance_sessions (energy_signature);
create index if not exists idx_ers_primary_emotion on emotional_resonance_sessions (primary_emotion);

create index if not exists idx_em_session_modality on emotional_moments (session_id, modality, moment_timestamp);
create index if not exists idx_em_user_emotion on emotional_moments (user_id, primary_emotion, moment_timestamp desc);
create index if not exists idx_em_crisis_breakthrough on emotional_moments (user_id, crisis_indicators, breakthrough_indicators);

create index if not exists idx_et_user_period on emotional_trends (user_id, period_type, period_start desc);
create index if not exists idx_et_trajectory on emotional_trends (emotional_trajectory);

create index if not exists idx_cmr_user_modalities on cross_modal_resonance (user_id, modality_a, modality_b);

-- Add helpful comments
comment on table emotional_resonance_sessions is 'Tracks emotional patterns across voice, chat, and journal sessions';
comment on table emotional_moments is 'Granular emotional analysis for individual interactions';
comment on table emotional_trends is 'Aggregated emotional patterns and Maya insights over time';
comment on table cross_modal_resonance is 'Correlations between emotional expression across different modalities';

-- Sample queries for Step 11 features:
-- Emotional timeline: SELECT session_start, primary_emotion, valence_avg FROM emotional_resonance_sessions WHERE user_id = ? ORDER BY session_start;
-- Cross-modal comparison: SELECT modality_a, modality_b, emotional_coherence FROM cross_modal_resonance WHERE user_id = ?;
-- Weekly emotional progression: SELECT * FROM emotional_trends WHERE user_id = ? AND period_type = 'weekly' ORDER BY period_start DESC LIMIT 4;