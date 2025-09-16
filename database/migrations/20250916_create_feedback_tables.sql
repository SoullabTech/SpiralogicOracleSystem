-- Create FeedbackEntry table for beta tester feedback
CREATE TABLE IF NOT EXISTS public."FeedbackEntry" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  testerId TEXT NOT NULL,
  sessionId TEXT NOT NULL,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Sacred dimensions (1-5 scale)
  voiceQuality INT CHECK (voiceQuality >= 1 AND voiceQuality <= 5),
  presenceDepth INT CHECK (presenceDepth >= 1 AND presenceDepth <= 5),
  sacredResonance INT CHECK (sacredResonance >= 1 AND sacredResonance <= 5),
  technicalFlow INT CHECK (technicalFlow >= 1 AND technicalFlow <= 5),
  collectiveInsight INT CHECK (collectiveInsight >= 1 AND collectiveInsight <= 5),

  -- Feedback content
  freeformText TEXT,
  voiceNoteUrl TEXT,

  -- Metadata
  voiceProvider TEXT CHECK (voiceProvider IN ('openai', 'elevenlabs')),
  agent TEXT CHECK (agent IN ('maya', 'anthony')),
  elementalState TEXT CHECK (elementalState IN ('fire', 'water', 'earth', 'air', 'aether')),
  trustLevel FLOAT CHECK (trustLevel >= 0 AND trustLevel <= 1)
);

-- Create CollectiveSnapshot table for aggregated insights
CREATE TABLE IF NOT EXISTS public."CollectiveSnapshot" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  signals JSONB NOT NULL,
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  participants INT NOT NULL,
  orchestrator TEXT -- Aetheric translation summary
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS feedback_created_idx ON public."FeedbackEntry" (createdAt DESC);
CREATE INDEX IF NOT EXISTS feedback_tester_idx ON public."FeedbackEntry" (testerId);
CREATE INDEX IF NOT EXISTS feedback_session_idx ON public."FeedbackEntry" (sessionId);
CREATE INDEX IF NOT EXISTS feedback_agent_idx ON public."FeedbackEntry" (agent);

-- Row Level Security
ALTER TABLE public."FeedbackEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CollectiveSnapshot" ENABLE ROW LEVEL SECURITY;

-- Policy: Service role full access for dashboard
CREATE POLICY "Service role full access feedback"
ON public."FeedbackEntry"
FOR ALL
USING (true);

CREATE POLICY "Service role full access snapshots"
ON public."CollectiveSnapshot"
FOR ALL
USING (true);

-- Create voice feedback storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'voice-feedback',
  'voice-feedback',
  false,
  10485760, -- 10MB limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm']
) ON CONFLICT (id) DO NOTHING;