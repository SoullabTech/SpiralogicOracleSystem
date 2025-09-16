-- Create personal_oracle_agents table for storing agent state
-- This supports the Beta MVP Maya/Anthony Voice & Chat system

CREATE TABLE IF NOT EXISTS public.personal_oracle_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  agent_state JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.personal_oracle_agents ENABLE ROW LEVEL SECURITY;

-- Users can only access their own agent state
CREATE POLICY "Users can view own agent state" ON public.personal_oracle_agents
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own agent state" ON public.personal_oracle_agents
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own agent state" ON public.personal_oracle_agents
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Index for faster lookups
CREATE INDEX idx_personal_oracle_agents_user_id ON public.personal_oracle_agents(user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
CREATE TRIGGER update_personal_oracle_agents_updated_at
  BEFORE UPDATE ON public.personal_oracle_agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE public.personal_oracle_agents IS 'Stores PersonalOracleAgent state for Maya/Anthony voice & chat system';
COMMENT ON COLUMN public.personal_oracle_agents.user_id IS 'Unique user identifier';
COMMENT ON COLUMN public.personal_oracle_agents.agent_state IS 'Complete agent state including memory, personality, and context';