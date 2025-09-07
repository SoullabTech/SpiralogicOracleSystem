# 🗄️ Prompt 1: Supabase Schema Migration

## Claude Code Prompt

```
You are Claude Code. Generate SQL migration scripts for Supabase to create a clean, unified database schema for the Sacred Portal.

## Task:

1. Drop any legacy tables (if they exist):
   - sessions_old
   - insights_old  
   - uploads_old
   - oracle_responses
   - holoflower_states

2. Create unified schema with these tables:

### users table
- id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
- email: text UNIQUE NOT NULL
- created_at: timestamptz DEFAULT now()
- metadata: jsonb DEFAULT '{}'

### sessions table
- id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
- user_id: uuid REFERENCES users(id) ON DELETE CASCADE
- type: text CHECK (type IN ('checkin', 'journal', 'sacred', 'full'))
- transcript: text
- coherence: numeric(3,2) CHECK (coherence >= 0 AND coherence <= 1)
- primary_facet: text
- shadow_facets: jsonb DEFAULT '[]'
- aether_stage: integer CHECK (aether_stage IN (0, 1, 2, 3))
- motion_state: jsonb DEFAULT '{}'
- created_at: timestamptz DEFAULT now()

### insights table  
- id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
- session_id: uuid REFERENCES sessions(id) ON DELETE CASCADE
- reflection: text
- practice: text
- synthesis: jsonb DEFAULT '{}'
- resonance_patterns: jsonb DEFAULT '[]'
- created_at: timestamptz DEFAULT now()

### uploads table
- id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
- user_id: uuid REFERENCES users(id) ON DELETE CASCADE
- session_id: uuid REFERENCES sessions(id) ON DELETE SET NULL
- file_url: text NOT NULL
- file_type: text
- element_tags: jsonb DEFAULT '[]'
- facet_mapping: jsonb DEFAULT '{}'
- processed: boolean DEFAULT false
- created_at: timestamptz DEFAULT now()

3. Add performance indexes:
   - CREATE INDEX idx_sessions_user_id ON sessions(user_id);
   - CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);
   - CREATE INDEX idx_insights_session_id ON insights(session_id);
   - CREATE INDEX idx_uploads_user_id ON uploads(user_id);
   - CREATE INDEX idx_uploads_session_id ON uploads(session_id);

4. Create views for common queries:
   - user_coherence_timeline: Shows coherence progression over time
   - active_aether_sessions: Sessions where aether_stage > 0
   - shadow_pattern_analysis: Aggregated shadow facets by user

5. Add Row Level Security (RLS):
   - Enable RLS on all tables
   - Users can only access their own data
   - Proper policies for insert, select, update, delete

## Deliver:

1. Full SQL migration file (idempotent using IF NOT EXISTS)
2. Comments explaining each table's purpose
3. Sample queries for common operations
4. Rollback script to safely revert changes
```

## Expected Output Structure:

```sql
-- Sacred Portal Database Schema Migration
-- Version: 1.0.0
-- Date: [Current Date]

-- Drop legacy tables (safe with IF EXISTS)
DROP TABLE IF EXISTS sessions_old CASCADE;
...

-- Create unified schema
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
...

-- Create useful views
CREATE OR REPLACE VIEW user_coherence_timeline AS
...

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
...

-- Sample queries
/*
Example: Get user's recent sessions with high coherence
SELECT * FROM sessions 
WHERE user_id = ? 
  AND coherence > 0.8 
ORDER BY created_at DESC 
LIMIT 10;
*/
```