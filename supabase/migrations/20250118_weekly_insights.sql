-- Phase 2: Weekly Insights and Longitudinal Patterns
-- This migration adds tables for tracking user patterns over time

-- Weekly insights table
CREATE TABLE IF NOT EXISTS weekly_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    theme TEXT,
    elemental_distribution JSONB,
    facet_progression JSONB,
    shadow_patterns JSONB,
    growth_arc TEXT,
    collective_resonance JSONB,
    integration_practice JSONB,
    raw_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient user and date queries
CREATE INDEX idx_weekly_insights_user_week ON weekly_insights(user_id, week_start DESC);

-- Longitudinal patterns table for monthly/seasonal tracking
CREATE TABLE IF NOT EXISTS longitudinal_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    pattern_type VARCHAR(50) NOT NULL CHECK (pattern_type IN ('weekly', 'monthly', 'seasonal', 'yearly')),
    pattern_data JSONB NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Index for pattern queries
CREATE INDEX idx_longitudinal_patterns_user_type ON longitudinal_patterns(user_id, pattern_type, period_start DESC);

-- Conversation snapshots for daily tracking
CREATE TABLE IF NOT EXISTS conversation_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID,
    snapshot_date DATE NOT NULL,
    dominant_element VARCHAR(20),
    active_facets TEXT[],
    emotional_tone NUMERIC(3, 2) CHECK (emotional_tone >= -1 AND emotional_tone <= 1),
    symbols_present TEXT[],
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for daily snapshot queries
CREATE INDEX idx_conversation_snapshots_user_date ON conversation_snapshots(user_id, snapshot_date DESC);

-- Edge panel preferences and state
CREATE TABLE IF NOT EXISTS edge_panel_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    active_panels JSONB DEFAULT '{"top": false, "bottom": false, "left": false, "right": false}',
    panel_content JSONB DEFAULT '{"top": "history", "bottom": "experiments", "left": "divination", "right": "stats"}',
    preferences JSONB,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updated at trigger for weekly_insights
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_weekly_insights_updated_at
    BEFORE UPDATE ON weekly_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE weekly_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE longitudinal_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE edge_panel_state ENABLE ROW LEVEL SECURITY;

-- Users can only see their own insights
CREATE POLICY "Users can view own weekly insights" ON weekly_insights
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly insights" ON weekly_insights
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly insights" ON weekly_insights
    FOR UPDATE USING (auth.uid() = user_id);

-- Similar policies for other tables
CREATE POLICY "Users can manage own patterns" ON longitudinal_patterns
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own snapshots" ON conversation_snapshots
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own panel state" ON edge_panel_state
    FOR ALL USING (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON TABLE weekly_insights IS 'Stores weekly psychological and symbolic insights for users';
COMMENT ON TABLE longitudinal_patterns IS 'Tracks longer-term patterns (monthly, seasonal, yearly)';
COMMENT ON TABLE conversation_snapshots IS 'Daily conversation summaries for pattern analysis';
COMMENT ON TABLE edge_panel_state IS 'User preferences for edge panel UI configuration';