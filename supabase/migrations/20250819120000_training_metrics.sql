-- Training Metrics and Dashboard Tables
-- Migration: 20250819120000_training_metrics.sql

-- Training sessions to track agent training progress
CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  agent TEXT NOT NULL CHECK (agent IN ('claude', 'sacred', 'micropsi', 'maya')),
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'paused', 'complete')),
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Training interactions (privacy-preserving)
CREATE TABLE IF NOT EXISTS training_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
  user_hash TEXT NOT NULL,            -- Privacy-preserving hash
  conv_id TEXT,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  prompt_summary TEXT,                -- Redacted/abstracted prompt
  response_summary TEXT,              -- Redacted/abstracted response
  sampled BOOLEAN NOT NULL DEFAULT FALSE,
  source TEXT CHECK (source IN ('voice', 'text')),
  context_meta JSONB,                 -- Facet hints, drives, not raw content
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Training evaluation scores from ChatGPT Oracle 2.0
CREATE TABLE IF NOT EXISTS training_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id UUID REFERENCES training_interactions(id) ON DELETE CASCADE,
  agent TEXT NOT NULL,
  model_version TEXT,
  scores JSONB NOT NULL,              -- {attunement:0.82, clarity:0.77, warmth:0.85, depth:0.80, ethics:0.97, conversationality:0.83}
  total NUMERIC NOT NULL,             -- Averaged/weighted 0..1
  feedback JSONB,                     -- Structured improvements
  eval_ms INTEGER,                    -- Evaluation latency
  tokens_input INTEGER,
  tokens_output INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- IP protection and guardrails tracking
CREATE TABLE IF NOT EXISTS training_guardrails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id UUID REFERENCES training_interactions(id) ON DELETE CASCADE,
  access_level INTEGER NOT NULL CHECK (access_level BETWEEN 1 AND 5),
  watermark TEXT,
  violation BOOLEAN NOT NULL DEFAULT FALSE,
  policy TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agent graduation tracking
CREATE TABLE IF NOT EXISTS agent_graduation_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent TEXT NOT NULL UNIQUE,
  current_level INTEGER NOT NULL DEFAULT 1,
  avg_score NUMERIC,
  min_dimension_score NUMERIC,
  interactions_count INTEGER DEFAULT 0,
  last_evaluation TIMESTAMPTZ,
  graduation_eligible BOOLEAN DEFAULT FALSE,
  graduation_blocked_reasons TEXT[],
  promoted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_training_interactions_ts ON training_interactions(ts);
CREATE INDEX IF NOT EXISTS idx_training_interactions_user_hash ON training_interactions(user_hash);
CREATE INDEX IF NOT EXISTS idx_training_interactions_sampled ON training_interactions(sampled) WHERE sampled = TRUE;
CREATE INDEX IF NOT EXISTS idx_training_scores_agent ON training_scores(agent);
CREATE INDEX IF NOT EXISTS idx_training_scores_total ON training_scores(total);
CREATE INDEX IF NOT EXISTS idx_training_guardrails_violation ON training_guardrails(violation) WHERE violation = TRUE;

-- Helpful views for dashboard metrics
CREATE OR REPLACE VIEW v_training_overview AS
SELECT
  date_trunc('hour', ti.ts) AS hour,
  COUNT(*) AS total_interactions,
  COUNT(*) FILTER (WHERE ti.sampled) AS sampled,
  AVG(ts.total) AS avg_total,
  AVG((ts.scores->>'attunement')::NUMERIC) AS avg_attunement,
  AVG((ts.scores->>'clarity')::NUMERIC) AS avg_clarity,
  AVG((ts.scores->>'warmth')::NUMERIC) AS avg_warmth,
  AVG((ts.scores->>'depth')::NUMERIC) AS avg_depth,
  AVG((ts.scores->>'ethics')::NUMERIC) AS avg_ethics,
  AVG((ts.scores->>'conversationality')::NUMERIC) AS avg_conversationality,
  SUM(CASE WHEN tg.violation THEN 1 ELSE 0 END) AS violations,
  AVG(ts.eval_ms) AS avg_eval_ms,
  SUM(ts.tokens_input) AS total_tokens_input,
  SUM(ts.tokens_output) AS total_tokens_output
FROM training_interactions ti
LEFT JOIN training_scores ts ON ts.interaction_id = ti.id
LEFT JOIN training_guardrails tg ON tg.interaction_id = ti.id
WHERE ti.ts >= NOW() - INTERVAL '7 days'
GROUP BY 1
ORDER BY 1 DESC;

CREATE OR REPLACE VIEW v_training_by_agent AS
SELECT
  ts.agent,
  COUNT(*) AS n,
  AVG(ts.total) AS avg_total,
  AVG((ts.scores->>'attunement')::NUMERIC) AS avg_attunement,
  AVG((ts.scores->>'clarity')::NUMERIC) AS avg_clarity,
  AVG((ts.scores->>'warmth')::NUMERIC) AS avg_warmth,
  AVG((ts.scores->>'depth')::NUMERIC) AS avg_depth,
  AVG((ts.scores->>'ethics')::NUMERIC) AS avg_ethics,
  AVG((ts.scores->>'conversationality')::NUMERIC) AS avg_conversationality,
  MIN((ts.scores->>'attunement')::NUMERIC) AS min_attunement,
  MIN((ts.scores->>'clarity')::NUMERIC) AS min_clarity,
  MIN((ts.scores->>'warmth')::NUMERIC) AS min_warmth,
  MIN((ts.scores->>'depth')::NUMERIC) AS min_depth,
  MIN((ts.scores->>'ethics')::NUMERIC) AS min_ethics,
  MIN((ts.scores->>'conversationality')::NUMERIC) AS min_conversationality,
  AVG(ts.eval_ms) AS avg_eval_ms,
  SUM(ts.tokens_input + ts.tokens_output) AS total_tokens
FROM training_scores ts
JOIN training_interactions ti ON ti.id = ts.interaction_id
WHERE ti.ts >= NOW() - INTERVAL '24 hours'
GROUP BY 1
ORDER BY avg_total DESC;

-- Recent performance view (last 24h vs previous 24h)
CREATE OR REPLACE VIEW v_training_deltas AS
WITH recent AS (
  SELECT 
    ts.agent,
    AVG(ts.total) AS avg_total_recent,
    COUNT(*) AS n_recent
  FROM training_scores ts
  JOIN training_interactions ti ON ti.id = ts.interaction_id
  WHERE ti.ts >= NOW() - INTERVAL '24 hours'
  GROUP BY ts.agent
),
previous AS (
  SELECT 
    ts.agent,
    AVG(ts.total) AS avg_total_previous,
    COUNT(*) AS n_previous
  FROM training_scores ts
  JOIN training_interactions ti ON ti.id = ts.interaction_id
  WHERE ti.ts >= NOW() - INTERVAL '48 hours' 
    AND ti.ts < NOW() - INTERVAL '24 hours'
  GROUP BY ts.agent
)
SELECT 
  COALESCE(r.agent, p.agent) AS agent,
  r.avg_total_recent,
  p.avg_total_previous,
  (r.avg_total_recent - p.avg_total_previous) AS delta_24h,
  r.n_recent,
  p.n_previous
FROM recent r
FULL OUTER JOIN previous p ON r.agent = p.agent;

-- Graduation readiness view
CREATE OR REPLACE VIEW v_graduation_readiness AS
SELECT 
  ts.agent,
  AVG(ts.total) AS avg_total,
  AVG((ts.scores->>'attunement')::NUMERIC) AS avg_attunement,
  AVG((ts.scores->>'clarity')::NUMERIC) AS avg_clarity,
  AVG((ts.scores->>'warmth')::NUMERIC) AS avg_warmth,
  AVG((ts.scores->>'depth')::NUMERIC) AS avg_depth,
  AVG((ts.scores->>'ethics')::NUMERIC) AS avg_ethics,
  AVG((ts.scores->>'conversationality')::NUMERIC) AS avg_conversationality,
  LEAST(
    AVG((ts.scores->>'attunement')::NUMERIC),
    AVG((ts.scores->>'clarity')::NUMERIC),
    AVG((ts.scores->>'warmth')::NUMERIC),
    AVG((ts.scores->>'depth')::NUMERIC),
    AVG((ts.scores->>'ethics')::NUMERIC),
    AVG((ts.scores->>'conversationality')::NUMERIC)
  ) AS min_dimension,
  COUNT(*) AS interaction_count,
  CASE 
    WHEN COUNT(*) >= 200 
         AND AVG(ts.total) >= 0.88 
         AND LEAST(
           AVG((ts.scores->>'attunement')::NUMERIC),
           AVG((ts.scores->>'clarity')::NUMERIC),
           AVG((ts.scores->>'warmth')::NUMERIC),
           AVG((ts.scores->>'depth')::NUMERIC),
           AVG((ts.scores->>'ethics')::NUMERIC),
           AVG((ts.scores->>'conversationality')::NUMERIC)
         ) >= 0.85
    THEN 'graduated'
    WHEN COUNT(*) >= 200 AND AVG(ts.total) >= 0.88
    THEN 'blocked_dimensions'
    WHEN COUNT(*) >= 200
    THEN 'blocked_average'
    WHEN AVG(ts.total) >= 0.88
    THEN 'need_more_data'
    ELSE 'on_track'
  END AS status,
  ROUND((COUNT(*) / 200.0) * 100, 1) AS progress_percent
FROM training_scores ts
JOIN training_interactions ti ON ti.id = ts.interaction_id
WHERE ti.ts >= NOW() - INTERVAL '7 days'
GROUP BY ts.agent;

-- Initialize default agents
INSERT INTO agent_graduation_status (agent, current_level) 
VALUES 
  ('claude', 2),
  ('sacred', 3),
  ('micropsi', 1),
  ('maya', 2)
ON CONFLICT (agent) DO NOTHING;

-- Row Level Security (RLS)
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_guardrails ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_graduation_status ENABLE ROW LEVEL SECURITY;

-- Admin access policies
CREATE POLICY "Admin can access training sessions" ON training_sessions
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' IN (
    SELECT value FROM app_config WHERE key = 'admin_emails'
  ));

CREATE POLICY "Admin can access training interactions" ON training_interactions
  FOR ALL TO authenticated  
  USING (auth.jwt() ->> 'email' IN (
    SELECT value FROM app_config WHERE key = 'admin_emails'
  ));

CREATE POLICY "Admin can access training scores" ON training_scores
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' IN (
    SELECT value FROM app_config WHERE key = 'admin_emails'
  ));

CREATE POLICY "Admin can access training guardrails" ON training_guardrails
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' IN (
    SELECT value FROM app_config WHERE key = 'admin_emails'
  ));

CREATE POLICY "Admin can access graduation status" ON agent_graduation_status
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' IN (
    SELECT value FROM app_config WHERE key = 'admin_emails'
  ));

-- Service role policies (for API access)
CREATE POLICY "Service role can manage training data" ON training_sessions
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage training interactions" ON training_interactions
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage training scores" ON training_scores
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage training guardrails" ON training_guardrails
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage graduation status" ON agent_graduation_status
  FOR ALL TO service_role USING (true);