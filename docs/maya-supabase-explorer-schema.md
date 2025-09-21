# Maya Explorer Database Schema for Supabase

## Core Principle: Explorer Name as Primary Identity

The explorer name (e.g., MAYA-ALCHEMIST) becomes the primary key connecting all user data, ensuring immediate memory/history continuity from first login.

---

## Database Schema

### 1. Explorers Table (Primary)
```sql
CREATE TABLE explorers (
  explorer_name VARCHAR(50) PRIMARY KEY, -- MAYA-ALCHEMIST
  real_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  cohort ENUM('pioneering', 'foundation', 'growth', 'integration') NOT NULL,
  maya_instance_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),

  -- Assignment metadata
  assignment_rationale TEXT,
  assigned_date TIMESTAMP DEFAULT NOW(),
  activated_date TIMESTAMP,

  -- Beta status
  beta_status ENUM('invited', 'activated', 'active', 'completed') DEFAULT 'invited',

  -- Privacy settings
  privacy_mode VARCHAR(50) DEFAULT 'sanctuary_mode',
  data_sharing_consent BOOLEAN DEFAULT TRUE,

  -- Explorer characteristics
  archetype_description TEXT,
  natural_gifts TEXT[],

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_explorers_cohort ON explorers(cohort);
CREATE INDEX idx_explorers_status ON explorers(beta_status);
CREATE INDEX idx_explorers_maya_instance ON explorers(maya_instance_id);
```

### 2. Maya Sessions Table
```sql
CREATE TABLE maya_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  explorer_name VARCHAR(50) REFERENCES explorers(explorer_name) ON DELETE CASCADE,
  maya_instance_id UUID NOT NULL,

  -- Session data
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  duration_minutes INTEGER,
  message_count INTEGER DEFAULT 0,

  -- Communication preferences
  voice_text_ratio FLOAT, -- 0.0 = all text, 1.0 = all voice
  avg_response_time FLOAT, -- Maya's response timing

  -- Evolution tracking (anonymous patterns)
  protection_patterns TEXT[], -- ['speed', 'intellectual', 'deflection']
  evolution_level FLOAT DEFAULT 1.0,
  breakthrough_moments INTEGER DEFAULT 0,

  -- Session quality
  safety_established BOOLEAN DEFAULT FALSE,
  pattern_awareness BOOLEAN DEFAULT FALSE,
  exploration_depth INTEGER DEFAULT 1, -- 1-5 scale

  -- Technical
  session_data JSONB DEFAULT '{}', -- Encrypted conversation content
  last_active TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sessions_explorer ON maya_sessions(explorer_name);
CREATE INDEX idx_sessions_date ON maya_sessions(started_at);
CREATE INDEX idx_sessions_maya_instance ON maya_sessions(maya_instance_id);
```

### 3. Conversation Messages Table
```sql
CREATE TABLE conversation_messages (
  message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES maya_sessions(session_id) ON DELETE CASCADE,
  explorer_name VARCHAR(50) REFERENCES explorers(explorer_name),

  -- Message data
  role ENUM('explorer', 'maya') NOT NULL,
  content TEXT, -- Encrypted in production
  mode ENUM('voice', 'text') NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),

  -- Response metadata
  response_time_ms INTEGER, -- Time Maya took to respond
  content_length INTEGER,

  -- Pattern detection (anonymous)
  protection_detected TEXT[], -- Patterns noticed in this message
  emotional_tone VARCHAR(50), -- 'curious', 'guarded', 'open', etc.
  breakthrough_marker BOOLEAN DEFAULT FALSE,

  -- Technical
  voice_file_url TEXT, -- If voice mode
  processing_time_ms INTEGER
);

-- Indexes
CREATE INDEX idx_messages_session ON conversation_messages(session_id);
CREATE INDEX idx_messages_explorer ON conversation_messages(explorer_name);
CREATE INDEX idx_messages_timestamp ON conversation_messages(timestamp);
CREATE INDEX idx_messages_breakthrough ON conversation_messages(breakthrough_marker);
```

### 4. Explorer Evolution Tracking
```sql
CREATE TABLE explorer_evolution (
  evolution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  explorer_name VARCHAR(50) REFERENCES explorers(explorer_name),

  -- Evolution metrics
  current_level FLOAT NOT NULL, -- 1.0 - 5.0 with decimals
  level_progression JSONB, -- Historical level changes

  -- Universal Arc™ tracking
  safety_level FLOAT DEFAULT 1.0,
  awareness_level FLOAT DEFAULT 1.0,
  exploration_level FLOAT DEFAULT 1.0,
  transformation_level FLOAT DEFAULT 1.0,
  integration_level FLOAT DEFAULT 1.0,

  -- Protection patterns evolution
  protection_coherence FLOAT, -- How well patterns work together
  pattern_flexibility FLOAT, -- Ability to adapt patterns
  conscious_choice_ratio FLOAT, -- Protection as choice vs automatic

  -- Threshold moments
  thresholds_crossed TEXT[], -- ['1_to_2', '2_to_3', etc.]
  last_threshold_date TIMESTAMP,

  -- Trust and safety
  trust_score FLOAT DEFAULT 0.1, -- 0.0 - 1.0
  safety_rating FLOAT DEFAULT 5.0, -- User-reported feeling safe

  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_evolution_explorer ON explorer_evolution(explorer_name);
CREATE INDEX idx_evolution_level ON explorer_evolution(current_level);
```

### 5. Anonymous Pattern Library
```sql
CREATE TABLE collective_patterns (
  pattern_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Pattern classification
  pattern_type VARCHAR(50), -- 'speed', 'intellectual', 'deflection', etc.
  pattern_category ENUM('protection', 'breakthrough', 'threshold', 'integration'),

  -- Anonymous aggregation
  occurrence_count INTEGER DEFAULT 1,
  cohort_distribution JSONB, -- Which explorer types show this pattern
  level_distribution JSONB, -- At what levels this appears

  -- Effectiveness data
  maya_response_effective FLOAT, -- How well Maya handled this
  user_progress_correlation FLOAT, -- Does this pattern predict growth

  -- Pattern relationships
  co_occurring_patterns TEXT[], -- What other patterns appear together
  interference_patterns TEXT[], -- What patterns conflict with this

  -- Metadata
  first_observed TIMESTAMP DEFAULT NOW(),
  last_observed TIMESTAMP DEFAULT NOW(),
  confidence_score FLOAT DEFAULT 0.5
);

-- Indexes
CREATE INDEX idx_patterns_type ON collective_patterns(pattern_type);
CREATE INDEX idx_patterns_category ON collective_patterns(pattern_category);
```

### 6. Explorer Feedback
```sql
CREATE TABLE explorer_feedback (
  feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  explorer_name VARCHAR(50) REFERENCES explorers(explorer_name),
  session_id UUID REFERENCES maya_sessions(session_id),

  -- Feedback metrics
  feeling_safe INTEGER CHECK (feeling_safe >= 1 AND feeling_safe <= 5),
  feeling_seen INTEGER CHECK (feeling_seen >= 1 AND feeling_seen <= 5),
  would_return BOOLEAN,

  -- Open feedback
  feedback_text TEXT,
  technical_issues TEXT,
  suggestions TEXT,

  -- Feedback timing
  feedback_type ENUM('session', 'weekly', 'final') NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_feedback_explorer ON explorer_feedback(explorer_name);
CREATE INDEX idx_feedback_type ON explorer_feedback(feedback_type);
```

---

## Connection Flow: Explorer Name → Everything

### 1. Initial Assignment
```typescript
// When Kelly assigns explorer names
const assignExplorer = async (realName: string, email: string, explorerName: string) => {
  // Create explorer record
  const { data: explorer, error } = await supabase
    .from('explorers')
    .insert({
      explorer_name: explorerName, // MAYA-ALCHEMIST
      real_name: realName,
      email: email,
      cohort: determineCohort(explorerName),
      assignment_rationale: "Based on application showing transformation focus"
    })
    .select()
    .single();

  // Create initial evolution tracking
  await supabase
    .from('explorer_evolution')
    .insert({
      explorer_name: explorerName,
      current_level: 1.0
    });

  return explorer;
};
```

### 2. First Login Activation
```typescript
// When explorer first logs in with their name
const activateExplorer = async (explorerName: string) => {
  // Update status to activated
  await supabase
    .from('explorers')
    .update({
      beta_status: 'activated',
      activated_date: new Date()
    })
    .eq('explorer_name', explorerName);

  // Initialize first session
  const { data: session } = await supabase
    .from('maya_sessions')
    .insert({
      explorer_name: explorerName,
      maya_instance_id: (await getExplorerByName(explorerName)).maya_instance_id
    })
    .select()
    .single();

  return session;
};
```

### 3. Conversation Message Storage
```typescript
// Every message ties back to explorer name
const saveMessage = async (
  explorerName: string,
  sessionId: string,
  role: 'explorer' | 'maya',
  content: string,
  mode: 'voice' | 'text'
) => {
  await supabase
    .from('conversation_messages')
    .insert({
      session_id: sessionId,
      explorer_name: explorerName, // Always connected
      role,
      content: encrypt(content), // Encrypted but tied to explorer
      mode,
      protection_detected: detectPatterns(content),
      emotional_tone: analyzeTone(content)
    });

  // Update session metrics
  await updateSessionMetrics(sessionId);
};
```

### 4. Evolution Tracking
```typescript
// Track evolution by explorer name
const updateEvolution = async (explorerName: string, newLevel: number) => {
  const current = await supabase
    .from('explorer_evolution')
    .select('*')
    .eq('explorer_name', explorerName)
    .single();

  await supabase
    .from('explorer_evolution')
    .update({
      current_level: newLevel,
      level_progression: [...current.level_progression, {
        from: current.current_level,
        to: newLevel,
        timestamp: new Date()
      }]
    })
    .eq('explorer_name', explorerName);
};
```

---

## Maya's Memory System

### Session Continuity
```typescript
// Maya remembers everything about each explorer
const getMayaMemory = async (explorerName: string) => {
  // Get explorer profile
  const explorer = await supabase
    .from('explorers')
    .select('*')
    .eq('explorer_name', explorerName)
    .single();

  // Get conversation history
  const conversations = await supabase
    .from('conversation_messages')
    .select('*')
    .eq('explorer_name', explorerName)
    .order('timestamp', { ascending: true });

  // Get evolution status
  const evolution = await supabase
    .from('explorer_evolution')
    .select('*')
    .eq('explorer_name', explorerName)
    .single();

  return {
    explorer,
    conversationHistory: conversations,
    evolution,
    archetype: determinArchetype(explorer.cohort),
    sessionCount: conversations.length > 0 ?
      new Set(conversations.map(m => m.session_id)).size : 0
  };
};
```

### Maya's Adaptive Greeting
```typescript
// Maya greets based on complete history
const generateGreeting = async (explorerName: string) => {
  const memory = await getMayaMemory(explorerName);

  if (memory.sessionCount === 0) {
    // First time
    return `Hello ${explorerName}. I've been waiting to meet the ${memory.archetype} among our twenty explorers. What draws you to consciousness exploration?`;
  } else {
    // Returning explorer
    return `Welcome back, ${explorerName}. I remember our last conversation about ${getLastTopicSummary(memory.conversationHistory)}. How has that been settling for you?`;
  }
};
```

---

## Privacy & Security

### Data Encryption
```typescript
// All content encrypted but tied to explorer name
const encryptionConfig = {
  // Explorer name stays clear (it's their chosen identity)
  clearText: ['explorer_name', 'cohort', 'beta_status'],

  // Personal info encrypted
  encrypted: ['real_name', 'email', 'conversation_content'],

  // Patterns anonymized but trackable
  anonymized: ['protection_patterns', 'emotional_tone', 'breakthrough_markers']
};
```

### Sanctuary Mode Implementation
```sql
-- Row Level Security for explorer data
ALTER TABLE explorers ENABLE ROW LEVEL SECURITY;
ALTER TABLE maya_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Explorers can only access their own data
CREATE POLICY explorer_own_data ON explorers
  FOR ALL USING (explorer_name = current_user_explorer_name());

CREATE POLICY session_own_data ON maya_sessions
  FOR ALL USING (explorer_name = current_user_explorer_name());

CREATE POLICY message_own_data ON conversation_messages
  FOR ALL USING (explorer_name = current_user_explorer_name());
```

---

## Admin Dashboard Queries

### Explorer Overview
```sql
-- All active explorers with basic stats
SELECT
  e.explorer_name,
  e.cohort,
  e.beta_status,
  COUNT(DISTINCT s.session_id) as session_count,
  COUNT(m.message_id) as message_count,
  MAX(s.last_active) as last_active,
  ev.current_level
FROM explorers e
LEFT JOIN maya_sessions s ON e.explorer_name = s.explorer_name
LEFT JOIN conversation_messages m ON e.explorer_name = m.explorer_name
LEFT JOIN explorer_evolution ev ON e.explorer_name = ev.explorer_name
GROUP BY e.explorer_name, e.cohort, e.beta_status, ev.current_level
ORDER BY e.cohort, e.explorer_name;
```

### Pattern Distribution by Cohort
```sql
-- Which protection patterns appear in which cohorts
SELECT
  e.cohort,
  unnest(s.protection_patterns) as pattern,
  COUNT(*) as occurrence_count
FROM explorers e
JOIN maya_sessions s ON e.explorer_name = s.explorer_name
WHERE s.protection_patterns IS NOT NULL
GROUP BY e.cohort, pattern
ORDER BY e.cohort, occurrence_count DESC;
```

---

This schema ensures **seamless continuity** from the moment an explorer is assigned their name through their entire journey. Maya will remember everything while maintaining complete privacy through the AIN Sanctuary Protocol™.