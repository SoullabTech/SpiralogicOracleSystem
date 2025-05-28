-- Post-Retreat Support Tables

-- Transformation Updates Table
CREATE TABLE IF NOT EXISTS transformation_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  retreat_id UUID REFERENCES retreat_sessions(id),
  
  -- Current State Assessment
  current_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: { overallWellbeing, emotionalClarity, spiritualConnection, lifeAlignment, shadowIntegration }
  
  -- Transformations Tracking
  transformations JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: { implemented[], inProgress[], emerging[] }
  
  -- Practices
  practices JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: { dailyPractices[], weeklyPractices[], elementalWork }
  
  -- Challenges & Celebrations
  challenges JSONB DEFAULT '[]'::jsonb,
  celebrations JSONB DEFAULT '[]'::jsonb,
  oracle_questions TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milestones Table
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- breakthrough, integration, mastery, service, shadow_work, celebration
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  impact JSONB NOT NULL, -- { personal, relational, collective }
  wisdom_gained TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  share_with_community BOOLEAN DEFAULT FALSE
);

-- Guidance Sessions Table
CREATE TABLE IF NOT EXISTS guidance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  guidance JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Oracle Check-in Schedules Table
CREATE TABLE IF NOT EXISTS oracle_checkin_schedules (
  participant_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  frequency VARCHAR(20) NOT NULL, -- weekly, biweekly, monthly
  preferred_time TIME,
  focus_areas TEXT[],
  next_checkin TIMESTAMP WITH TIME ZONE,
  reminders JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (participant_id)
);

-- Participant Stats Table
CREATE TABLE IF NOT EXISTS participant_stats (
  participant_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  milestone_count JSONB DEFAULT '{}'::jsonb,
  wisdom_contributions INTEGER DEFAULT 0,
  last_milestone TIMESTAMP WITH TIME ZONE,
  last_wisdom_date TIMESTAMP WITH TIME ZONE,
  integration_score DECIMAL(3,1) DEFAULT 0,
  PRIMARY KEY (participant_id)
);

-- Community Shares Table
CREATE TABLE IF NOT EXISTS community_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL, -- milestone, wisdom, celebration, challenge
  content JSONB NOT NULL,
  shared_by UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  visibility VARCHAR(20) DEFAULT 'alumni', -- alumni, public
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Gatherings Table
CREATE TABLE IF NOT EXISTS community_gatherings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  type VARCHAR(50), -- online_circle, in_person, special_event
  facilitator_id UUID,
  max_participants INTEGER,
  registered_participants UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Retreat Insights Table (for context)
CREATE TABLE IF NOT EXISTS retreat_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  retreat_id UUID REFERENCES retreat_sessions(id),
  insight_type VARCHAR(50),
  content TEXT,
  element VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wisdom Keeper Main Table
CREATE TABLE IF NOT EXISTS wisdom_keeper (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  retreat_id UUID REFERENCES retreat_sessions(id),
  type VARCHAR(20) NOT NULL, -- insight, practice, story, guidance, blessing
  
  -- Content
  content JSONB NOT NULL,
  -- Structure: { title, body, element, tags[], context }
  
  accessibility VARCHAR(20) DEFAULT 'retreat_alumni', -- private, retreat_alumni, public
  
  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: { createdAt, views, resonance, bookmarks, shares }
  
  -- Connections
  connections JSONB DEFAULT '{}'::jsonb,
  -- Structure: { relatedWisdom[], inspiredBy[], inspires[] }
  
  searchable_text TEXT GENERATED ALWAYS AS (
    lower(
      coalesce(content->>'title', '') || ' ' ||
      coalesce(content->>'body', '') || ' ' ||
      coalesce(content->>'element', '') || ' ' ||
      coalesce(content->>'context', '')
    )
  ) STORED
);

-- Wisdom Search Index
CREATE TABLE IF NOT EXISTS wisdom_search_index (
  wisdom_id UUID REFERENCES wisdom_keeper(id) ON DELETE CASCADE,
  searchable_text TEXT,
  element VARCHAR(20),
  type VARCHAR(20),
  tags TEXT[],
  participant_id UUID,
  accessibility VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (wisdom_id)
);

-- Wisdom Bookmarks
CREATE TABLE IF NOT EXISTS wisdom_bookmarks (
  participant_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  wisdom_id UUID REFERENCES wisdom_keeper(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (participant_id, wisdom_id)
);

-- Wisdom Shares
CREATE TABLE IF NOT EXISTS wisdom_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wisdom_id UUID REFERENCES wisdom_keeper(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wisdom Resonance
CREATE TABLE IF NOT EXISTS wisdom_resonance (
  wisdom_id UUID REFERENCES wisdom_keeper(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  resonance_level INTEGER CHECK (resonance_level >= 1 AND resonance_level <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (wisdom_id, participant_id)
);

-- Wisdom Connections
CREATE TABLE IF NOT EXISTS wisdom_connections (
  wisdom_id UUID REFERENCES wisdom_keeper(id) ON DELETE CASCADE,
  related_wisdom_id UUID REFERENCES wisdom_keeper(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (wisdom_id, related_wisdom_id)
);

-- Wisdom Threads
CREATE TABLE IF NOT EXISTS wisdom_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_wisdom_id UUID REFERENCES wisdom_keeper(id) ON DELETE CASCADE,
  target_wisdom_id UUID REFERENCES wisdom_keeper(id) ON DELETE CASCADE,
  connection_type VARCHAR(20), -- response, expansion, question, integration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tag Cloud
CREATE TABLE IF NOT EXISTS tag_cloud (
  tag VARCHAR(50) PRIMARY KEY,
  usage_count INTEGER DEFAULT 1,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Member Interests (for notifications)
CREATE TABLE IF NOT EXISTS member_interests (
  participant_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  elements TEXT[] DEFAULT '{}',
  types TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  PRIMARY KEY (participant_id)
);

-- Wisdom Interactions (for recommendations)
CREATE TABLE IF NOT EXISTS wisdom_interactions (
  participant_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  wisdom_id UUID REFERENCES wisdom_keeper(id) ON DELETE CASCADE,
  interaction_type VARCHAR(20), -- view, bookmark, share, resonate
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wisdom Searches (for analytics)
CREATE TABLE IF NOT EXISTS wisdom_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID,
  search_query TEXT,
  filters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wisdom Rituals
CREATE TABLE IF NOT EXISTS wisdom_rituals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  ritual JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Participant Preferences
CREATE TABLE IF NOT EXISTS participant_preferences (
  participant_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  wisdom_digest_preferences JSONB DEFAULT '{}'::jsonb,
  notification_preferences JSONB DEFAULT '{}'::jsonb,
  privacy_settings JSONB DEFAULT '{}'::jsonb,
  PRIMARY KEY (participant_id)
);

-- Indexes for performance
CREATE INDEX idx_transformation_participant ON transformation_updates(participant_id);
CREATE INDEX idx_transformation_date ON transformation_updates(created_at);
CREATE INDEX idx_milestones_participant ON milestones(participant_id);
CREATE INDEX idx_milestones_type ON milestones(type);
CREATE INDEX idx_wisdom_participant ON wisdom_keeper(participant_id);
CREATE INDEX idx_wisdom_type ON wisdom_keeper(type);
CREATE INDEX idx_wisdom_element ON wisdom_keeper((content->>'element'));
CREATE INDEX idx_wisdom_accessibility ON wisdom_keeper(accessibility);
CREATE INDEX idx_wisdom_search ON wisdom_keeper USING GIN(searchable_text gin_trgm_ops);
CREATE INDEX idx_community_shares_type ON community_shares(type);
CREATE INDEX idx_community_shares_date ON community_shares(created_at);

-- Full text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Functions

-- Increment wisdom metrics
CREATE OR REPLACE FUNCTION increment_wisdom_views(wisdom_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE wisdom_keeper
  SET metadata = jsonb_set(
    metadata,
    '{views}',
    to_jsonb(COALESCE((metadata->>'views')::int, 0) + 1)
  )
  WHERE id = wisdom_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_wisdom_bookmarks(wisdom_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE wisdom_keeper
  SET metadata = jsonb_set(
    metadata,
    '{bookmarks}',
    to_jsonb(COALESCE((metadata->>'bookmarks')::int, 0) + 1)
  )
  WHERE id = wisdom_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_wisdom_shares(wisdom_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE wisdom_keeper
  SET metadata = jsonb_set(
    metadata,
    '{shares}',
    to_jsonb(COALESCE((metadata->>'shares')::int, 0) + 1)
  )
  WHERE id = wisdom_id;
END;
$$ LANGUAGE plpgsql;

-- Increment tag usage
CREATE OR REPLACE FUNCTION increment_tag_usage(tag_name VARCHAR)
RETURNS void AS $$
BEGIN
  INSERT INTO tag_cloud (tag, usage_count, last_used)
  VALUES (tag_name, 1, NOW())
  ON CONFLICT (tag) DO UPDATE
  SET usage_count = tag_cloud.usage_count + 1,
      last_used = NOW();
END;
$$ LANGUAGE plpgsql;

-- Track wisdom interaction
CREATE OR REPLACE FUNCTION track_wisdom_interaction(
  p_participant_id UUID,
  p_wisdom_id UUID,
  p_interaction_type VARCHAR
)
RETURNS void AS $$
BEGIN
  INSERT INTO wisdom_interactions (participant_id, wisdom_id, interaction_type, created_at)
  VALUES (p_participant_id, p_wisdom_id, p_interaction_type, NOW())
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Sample initial wisdom entries
INSERT INTO wisdom_keeper (participant_id, retreat_id, type, content, accessibility)
VALUES 
  (
    (SELECT id FROM retreat_participants LIMIT 1),
    (SELECT id FROM retreat_sessions LIMIT 1),
    'blessing',
    jsonb_build_object(
      'title', 'Welcome to the Wisdom Keeper',
      'body', 'May this sacred archive hold the treasures of your journey and serve the collective awakening.',
      'element', 'aether',
      'tags', ARRAY['welcome', 'blessing', 'collective']
    ),
    'public'
  );

-- Update retreat participants to include integration status
ALTER TABLE retreat_participants 
ADD COLUMN IF NOT EXISTS integration_status JSONB DEFAULT '{}'::jsonb;