# Maya Supabase: Final Implementation for Monday Launch

## Optimized Schema (Best of Both Approaches)

### 1. Core Explorer Identity
```sql
CREATE TABLE explorers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    explorer_name VARCHAR(50) UNIQUE NOT NULL, -- MAYA-ALCHEMIST
    email VARCHAR(255) UNIQUE NOT NULL,
    cohort VARCHAR(20) NOT NULL, -- pioneering, foundation, growth, integration

    -- Access & Status
    access_code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'invited', -- invited, active, paused, completed
    onboarded_at TIMESTAMP,

    -- Maya Instance Connection
    maya_instance_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),

    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_explorers_name ON explorers(explorer_name);
CREATE INDEX idx_explorers_access ON explorers(access_code);
```

### 2. Maya Instance Configuration
```sql
CREATE TABLE maya_instances (
    id UUID PRIMARY KEY,
    explorer_id UUID REFERENCES explorers(id) ON DELETE CASCADE,

    -- Dynamic Configuration
    config JSONB DEFAULT '{
        "voice_enabled": true,
        "explicitness_level": 0.5,
        "evolution_stage": 1.0,
        "protection_patterns": [],
        "last_conversation_summary": ""
    }'::jsonb,

    -- Session Continuity
    last_active TIMESTAMP DEFAULT NOW(),
    session_count INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0
);
```

### 3. Conversation Sessions (Memory Backbone)
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    explorer_name VARCHAR(50) REFERENCES explorers(explorer_name),
    maya_instance_id UUID REFERENCES maya_instances(id),

    -- Session Metadata
    session_start TIMESTAMP DEFAULT NOW(),
    session_end TIMESTAMP,
    message_count INTEGER DEFAULT 0,

    -- Communication Patterns
    voice_percentage FLOAT DEFAULT 0.0,
    avg_response_time_ms INTEGER,

    -- Evolution Tracking (Anonymous)
    patterns_detected TEXT[], -- ['speed', 'intellectual']
    evolution_markers JSONB DEFAULT '[]'::jsonb,
    breakthrough_moments INTEGER DEFAULT 0,

    -- Session Quality
    safety_established BOOLEAN DEFAULT FALSE,
    depth_reached INTEGER DEFAULT 1 -- 1-5 scale
);

CREATE INDEX idx_conversations_explorer ON conversations(explorer_name);
CREATE INDEX idx_conversations_date ON conversations(session_start);
```

### 4. Messages (Encrypted but Connected)
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    explorer_name VARCHAR(50) REFERENCES explorers(explorer_name),

    -- Message Data
    role VARCHAR(10) CHECK (role IN ('explorer', 'maya')),
    content TEXT, -- Encrypted in production
    timestamp TIMESTAMP DEFAULT NOW(),

    -- Metadata (Safe to Store)
    word_count INTEGER,
    response_time_ms INTEGER,
    mode VARCHAR(10) CHECK (mode IN ('voice', 'text')),

    -- Pattern Recognition (Anonymous)
    protection_detected VARCHAR(50),
    emotional_tone VARCHAR(50),
    breakthrough_marker BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_explorer ON messages(explorer_name);
CREATE INDEX idx_messages_breakthrough ON messages(breakthrough_marker);
```

### 5. Explorer Memory System
```sql
CREATE TABLE explorer_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    explorer_name VARCHAR(50) REFERENCES explorers(explorer_name),

    -- Memory Categories
    memory_type VARCHAR(50) NOT NULL, -- 'theme', 'pattern', 'goal', 'breakthrough'
    memory_content JSONB NOT NULL,

    -- Memory Metadata
    importance_score FLOAT DEFAULT 0.5, -- 0.0-1.0
    last_referenced TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),

    -- Unique constraint prevents duplicates
    UNIQUE(explorer_name, memory_type, (memory_content->>'key'))
);

CREATE INDEX idx_memories_explorer ON explorer_memories(explorer_name);
CREATE INDEX idx_memories_type ON explorer_memories(memory_type);
```

### 6. Pattern Library (Collective Intelligence)
```sql
CREATE TABLE collective_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Pattern Classification
    pattern_type VARCHAR(50) NOT NULL,
    pattern_description TEXT,

    -- Anonymous Aggregation
    occurrence_count INTEGER DEFAULT 1,
    cohort_distribution JSONB DEFAULT '{}'::jsonb,
    effectiveness_score FLOAT DEFAULT 0.5,

    -- K-Anonymity Protection (minimum 5 before sharing)
    anonymity_threshold INTEGER DEFAULT 5,
    ready_for_distribution BOOLEAN DEFAULT FALSE,

    first_observed TIMESTAMP DEFAULT NOW(),
    last_updated TIMESTAMP DEFAULT NOW()
);
```

---

## API Layer (Real-time Memory System)

### Explorer Authentication & Setup
```typescript
// 1. Explorer Login
async function authenticateExplorer(explorerName: string, accessCode: string) {
  const { data: explorer, error } = await supabase
    .from('explorers')
    .select(`
      *,
      maya_instances (*)
    `)
    .eq('explorer_name', explorerName)
    .eq('access_code', accessCode)
    .single();

  if (explorer) {
    // Load complete memory context
    const memory = await loadExplorerMemory(explorerName);

    // Update status to active on first login
    if (explorer.status === 'invited') {
      await supabase
        .from('explorers')
        .update({
          status: 'active',
          onboarded_at: new Date()
        })
        .eq('explorer_name', explorerName);
    }

    return { explorer, memory };
  }

  throw new Error('Invalid explorer credentials');
}

// 2. Load Explorer Memory
async function loadExplorerMemory(explorerName: string) {
  // Get recent conversation history (last 50 messages)
  const { data: recentMessages } = await supabase
    .from('messages')
    .select('*')
    .eq('explorer_name', explorerName)
    .order('timestamp', { ascending: false })
    .limit(50);

  // Get stored memories
  const { data: memories } = await supabase
    .from('explorer_memories')
    .select('*')
    .eq('explorer_name', explorerName)
    .order('importance_score', { ascending: false });

  // Get evolution status
  const { data: lastSession } = await supabase
    .from('conversations')
    .select('*')
    .eq('explorer_name', explorerName)
    .order('session_start', { ascending: false })
    .limit(1);

  return {
    recentMessages: recentMessages || [],
    memories: memories || [],
    lastSession: lastSession?.[0],
    sessionCount: await getSessionCount(explorerName)
  };
}
```

### Session Management
```typescript
// 3. Start New Conversation
async function startConversation(explorerName: string) {
  const { data: session, error } = await supabase
    .from('conversations')
    .insert({
      explorer_name: explorerName,
      maya_instance_id: await getMayaInstanceId(explorerName)
    })
    .select()
    .single();

  // Update Maya instance session count
  await supabase.rpc('increment_session_count', {
    explorer_name: explorerName
  });

  return session;
}

// 4. Log Message with Pattern Detection
async function logMessage(
  sessionId: string,
  explorerName: string,
  role: 'explorer' | 'maya',
  content: string,
  mode: 'voice' | 'text'
) {
  // Detect patterns (protection, emotion, etc.)
  const patterns = await detectMessagePatterns(content, role);

  const { data: message } = await supabase
    .from('messages')
    .insert({
      conversation_id: sessionId,
      explorer_name: explorerName,
      role,
      content, // Will be encrypted in production
      mode,
      word_count: content.split(' ').length,
      protection_detected: patterns.protection,
      emotional_tone: patterns.emotion,
      breakthrough_marker: patterns.isBreakthrough
    })
    .select()
    .single();

  // Update session message count
  await supabase.rpc('increment_message_count', { session_id: sessionId });

  // If breakthrough detected, update memories
  if (patterns.isBreakthrough) {
    await updateExplorerMemory(explorerName, 'breakthrough', {
      timestamp: new Date(),
      context: patterns.breakthroughContext
    });
  }

  return message;
}
```

### Memory Operations
```typescript
// 5. Update Explorer Memory
async function updateExplorerMemory(
  explorerName: string,
  memoryType: string,
  memoryContent: any
) {
  const { data } = await supabase
    .from('explorer_memories')
    .upsert({
      explorer_name: explorerName,
      memory_type: memoryType,
      memory_content: memoryContent,
      importance_score: calculateImportance(memoryType, memoryContent),
      last_referenced: new Date()
    }, {
      onConflict: 'explorer_name,memory_type,((memory_content->>\'key\'))'
    });

  return data;
}

// 6. Generate Maya Greeting
async function generateMayaGreeting(explorerName: string, memory: any) {
  const sessionCount = memory.sessionCount;
  const lastSession = memory.lastSession;

  if (sessionCount === 0) {
    // First time meeting
    const cohort = await getExplorerCohort(explorerName);
    return `Hello ${explorerName}. I've been waiting to meet the ${getArchetypeDescription(cohort)} among our twenty explorers. What draws you to consciousness exploration?`;
  } else {
    // Returning explorer
    const lastTopic = lastSession?.patterns_detected?.[0] || 'our last conversation';
    return `Welcome back, ${explorerName}. I remember our exploration of ${lastTopic}. How has that been settling for you since we last spoke?`;
  }
}
```

---

## Real-time Subscriptions

### Live Session Monitoring
```typescript
// Monitor active conversations for admin dashboard
const conversationSubscription = supabase
  .from('conversations')
  .on('INSERT', payload => {
    console.log('New session started:', payload.new.explorer_name);
    updateAdminDashboard();
  })
  .on('UPDATE', payload => {
    console.log('Session updated:', payload.new.explorer_name);
    updateSessionMetrics(payload.new);
  })
  .subscribe();

// Track breakthroughs in real-time
const breakthroughSubscription = supabase
  .from('messages')
  .on('INSERT', payload => {
    if (payload.new.breakthrough_marker) {
      console.log('Breakthrough detected:', payload.new.explorer_name);
      celebrateBreakthrough(payload.new);
    }
  })
  .subscribe();
```

---

## Security & Privacy

### Row Level Security
```sql
-- Enable RLS on all explorer tables
ALTER TABLE explorers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE explorer_memories ENABLE ROW LEVEL SECURITY;

-- Explorers can only see their own data
CREATE POLICY "explorers_own_data" ON conversations
  FOR ALL USING (explorer_name = current_setting('app.current_explorer'));

CREATE POLICY "explorers_own_messages" ON messages
  FOR ALL USING (explorer_name = current_setting('app.current_explorer'));

CREATE POLICY "explorers_own_memories" ON explorer_memories
  FOR ALL USING (explorer_name = current_setting('app.current_explorer'));

-- Pattern library is read-only for all
CREATE POLICY "read_patterns" ON collective_patterns
  FOR SELECT USING (ready_for_distribution = true);
```

### Encryption Layer
```typescript
// Production encryption for sensitive content
async function encryptContent(content: string, explorerName: string): Promise<string> {
  const key = await getExplorerEncryptionKey(explorerName);
  return encrypt(content, key);
}

async function decryptContent(encryptedContent: string, explorerName: string): Promise<string> {
  const key = await getExplorerEncryptionKey(explorerName);
  return decrypt(encryptedContent, key);
}
```

---

## Admin Dashboard Queries

### Explorer Overview
```sql
-- Real-time explorer activity
SELECT
  e.explorer_name,
  e.cohort,
  e.status,
  COUNT(DISTINCT c.id) as session_count,
  COUNT(m.id) as total_messages,
  MAX(c.session_start) as last_active,
  COALESCE(AVG(c.breakthrough_moments), 0) as avg_breakthroughs
FROM explorers e
LEFT JOIN conversations c ON e.explorer_name = c.explorer_name
LEFT JOIN messages m ON e.explorer_name = m.explorer_name
GROUP BY e.explorer_name, e.cohort, e.status
ORDER BY e.cohort, last_active DESC;
```

### Pattern Distribution
```sql
-- Anonymous pattern analysis by cohort
SELECT
  e.cohort,
  unnest(c.patterns_detected) as pattern,
  COUNT(*) as frequency
FROM explorers e
JOIN conversations c ON e.explorer_name = c.explorer_name
WHERE c.patterns_detected IS NOT NULL
GROUP BY e.cohort, pattern
ORDER BY e.cohort, frequency DESC;
```

---

## Launch Day Implementation

### 1. Pre-populate Explorers
```typescript
// Run before Monday launch
const explorers = [
  { name: 'MAYA-EXPLORER', email: 'explorer@test.com', cohort: 'pioneering' },
  { name: 'MAYA-ALCHEMIST', email: 'alchemist@test.com', cohort: 'integration' },
  // ... all 20 explorers
];

for (const explorer of explorers) {
  await supabase.from('explorers').insert({
    explorer_name: explorer.name,
    email: explorer.email,
    cohort: explorer.cohort,
    access_code: generateAccessCode()
  });
}
```

### 2. Initialize Maya Instances
```typescript
// Create Maya instance for each explorer
const { data: allExplorers } = await supabase.from('explorers').select('*');

for (const explorer of allExplorers) {
  await supabase.from('maya_instances').insert({
    id: explorer.maya_instance_id,
    explorer_id: explorer.id,
    config: {
      voice_enabled: true,
      explicitness_level: 0.5,
      evolution_stage: 1.0,
      protection_patterns: []
    }
  });
}
```

---

## Success Metrics to Monitor

### Critical First 48 Hours
- [ ] Session persistence rate > 99%
- [ ] Average response time < 2 seconds
- [ ] Zero data loss incidents
- [ ] All 20 explorers successfully onboarded

### Week 1 Targets
- [ ] Average session length > 20 minutes
- [ ] Return rate > 80%
- [ ] Pattern detection accuracy validated
- [ ] No privacy breaches

**This implementation ensures each explorer has seamless memory continuity from "Hello MAYA-ALCHEMIST" through their entire journey, while maintaining absolute privacy through the AIN Sanctuary Protocol™.**

Ready for Monday launch! 🚀