# Agent Training Setup Guide

## Quick Start: ChatGPT Oracle 2.0 + Spiralogic IP Training

This guide shows how to set up the complete agent training system with ChatGPT Oracle 2.0 as the master trainer while protecting your Spiralogic IP.

## 🚀 **1. Environment Configuration**

Add these variables to your `.env.local`:

```bash
# Agent Training Configuration
TRAINING_DATA_COLLECTION=true
TRAINING_SAMPLING_RATE=0.2                    # Collect 20% of interactions
TRAINING_INCLUDE_ANONYMOUS=false               # Only trained users
TRAINING_PRIVACY_MODE=anonymized               # Protect user privacy
TRAINING_QUALITY_THRESHOLD=6.0                 # Minimum quality score
TRAINING_STORAGE_BACKEND=supabase              # Storage location

# ChatGPT Oracle 2.0 Integration
CHATGPT_ORACLE_2_API_KEY=sk-your-openai-key-here
CHATGPT_ORACLE_2_MODEL=gpt-4-turbo-preview
CHATGPT_ORACLE_2_MAX_TOKENS=2000
CHATGPT_ORACLE_2_TEMPERATURE=0.7

# Spiralogic IP Protection
SPIRALOGIC_ENCRYPTION_KEY=your-secure-encryption-key-here
IP_AUDIT_ENABLED=true
IP_WATERMARK_ENABLED=true
IP_GRADUAL_DISCLOSURE=true

# Training Session Management
TRAINING_SESSION_ENABLED=true
TRAINING_AUTO_EVALUATION=true
TRAINING_QUALITY_FEEDBACK=true
```

## 🗄️ **2. Database Setup**

Create the training data table in Supabase:

```sql
-- Training data storage
CREATE TABLE training_data (
  id TEXT PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  user_input TEXT NOT NULL,
  context JSONB,
  claude_response TEXT,
  sacred_synthesis TEXT,
  maya_application TEXT,
  final_response TEXT NOT NULL,
  micropsi_modulation JSONB,
  validation_result JSONB,
  processing_time INTEGER,
  providers TEXT[],
  user_feedback JSONB,
  system_quality JSONB,
  source TEXT CHECK (source IN ('voice', 'text')),
  session_length INTEGER,
  is_first_turn BOOLEAN,
  anonymized BOOLEAN DEFAULT true,
  consent_given BOOLEAN DEFAULT false,
  retention_expiry BIGINT,
  conversation_id TEXT,
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_training_data_timestamp ON training_data(timestamp);
CREATE INDEX idx_training_data_user_id ON training_data(user_id);
CREATE INDEX idx_training_data_quality ON training_data((system_quality->>'spiralogicAlignment'));

-- Training sessions
CREATE TABLE training_sessions (
  id TEXT PRIMARY KEY,
  start_time BIGINT NOT NULL,
  end_time BIGINT,
  interaction_count INTEGER DEFAULT 0,
  average_quality NUMERIC,
  improvements_generated INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'completed', 'failed')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent access levels for IP protection
CREATE TABLE agent_access_levels (
  agent_id TEXT PRIMARY KEY,
  access_level INTEGER NOT NULL,
  granted_by UUID REFERENCES profiles(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_access TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0
);
```

## 🧠 **3. Testing the Training System**

### Basic Health Check
```bash
curl -s http://localhost:3000/api/training/evaluate | jq
```

Expected response:
```json
{
  "status": "ok",
  "configured": true,
  "components": {
    "trainer": true,
    "orchestrator": true,
    "dataCollector": true,
    "ipProtector": true
  },
  "actions": ["evaluate_interaction", "start_training_session", ...]
}
```

### Start a Training Session
```bash
curl -s -X POST http://localhost:3000/api/training/evaluate \
  -H 'Content-Type: application/json' \
  -d '{
    "action": "start_training_session",
    "data": {"sessionId": "test_session_001"}
  }' | jq
```

### Evaluate an Interaction
```bash
curl -s -X POST http://localhost:3000/api/training/evaluate \
  -H 'Content-Type: application/json' \
  -d '{
    "action": "evaluate_interaction",
    "data": {
      "interaction": {
        "id": "int_001",
        "userInput": "I feel stuck between my need for safety and growth",
        "claudeResponse": "Hey Kelly, I hear you standing at that threshold...",
        "context": {
          "facetHints": {"safety": 0.8, "growth": 0.6},
          "micropsi": {
            "driveVector": {"safety": 0.8, "agency": 0.6, "clarity": 0.7}
          }
        },
        "conversationId": "conv_test",
        "userId": "user_test"
      }
    }
  }' | jq
```

### Generate Training Exemplar
```bash
curl -s -X POST http://localhost:3000/api/training/evaluate \
  -H 'Content-Type: application/json' \
  -d '{
    "action": "generate_exemplar",
    "data": {
      "userInput": "I am afraid of making the wrong choice",
      "context": {
        "facetHints": {"safety": 0.9, "clarity": 0.4},
        "micropsi": {"driveVector": {"safety": 0.9, "clarity": 0.4}}
      },
      "targetQuality": 9
    }
  }' | jq
```

## 🔒 **4. Spiralogic IP Protection Setup**

### Initialize IP Protector
```typescript
import { createIPProtector } from '@/lib/training/ipProtection';

const ipProtector = createIPProtector({
  accessLevels: {
    'claude_oracle': 2,       // Intermediate access
    'sacred_intelligence': 3,  // Advanced access
    'chatgpt_oracle_2': 4     // Master access to everything
  }
});
```

### Request Knowledge Access
```typescript
const knowledge = await ipProtector.requestAccess({
  agentId: 'claude_oracle',
  knowledgeId: 'sp_001',
  timestamp: Date.now(),
  purpose: 'Generate safe container response'
});

if (knowledge.granted) {
  console.log('Knowledge:', knowledge.watermarked);
}
```

### Audit Access Logs
```typescript
const auditLog = ipProtector.getAuditLog({
  agentId: 'claude_oracle',
  startDate: Date.now() - 86400000 // Last 24 hours
});
```

## 📊 **5. Training Workflow**

### Automatic Training Pipeline
The system automatically:

1. **Collects** 20% of interactions (sampling rate)
2. **Evaluates** responses with ChatGPT Oracle 2.0
3. **Scores** on Spiralogic alignment, authenticity, depth
4. **Generates** improvement suggestions
5. **Creates** exemplars for low-quality responses
6. **Protects** Spiralogic IP with encryption/watermarking

### Manual Training Session
```typescript
// Start training session
const sessionId = 'training_' + Date.now();
await fetch('/api/training/evaluate', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    action: 'start_training_session',
    data: {sessionId}
  })
});

// Add interactions for evaluation
const interactions = getRecentInteractions();
for (const interaction of interactions) {
  await fetch('/api/training/evaluate', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      action: 'add_interaction',
      data: {sessionId, interaction}
    })
  });
}

// Get session summary
const summary = await fetch('/api/training/evaluate', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    action: 'get_session_summary',
    data: {sessionId}
  })
}).then(r => r.json());
```

## 🎯 **6. Training Quality Metrics**

### Evaluation Scores (1-10 scale)
- **Spiralogic Alignment**: Core principle adherence
- **Conversational Depth**: Appropriate wisdom level
- **Archetype Accuracy**: Correct pattern recognition
- **Shadow Work**: Safe integration when relevant
- **Authenticity**: Genuine vs performative language
- **Drive Alignment**: Proper need recognition

### Improvement Categories
- **Tone**: Warmth, authenticity, wisdom level
- **Depth**: Surface vs profound engagement
- **Accuracy**: Spiralogic principle application
- **Integration**: Coherent response synthesis
- **Authenticity**: Genuine spiritual guidance

## 🔧 **7. Advanced Configuration**

### Custom Knowledge Base
```typescript
await ipProtector.addKnowledgeItem({
  id: 'custom_001',
  type: 'principle',
  accessLevel: 2,
  content: 'Your custom Spiralogic principle here',
  metadata: {
    sensitivity: 'confidential',
    source: 'Spiralogic Custom v1.0',
    dateCreated: Date.now(),
    accessCount: 0
  }
});
```

### Agent Access Level Management
```typescript
// Promote agent after successful training
await ipProtector.updateAgentAccessLevel('claude_oracle', 3);

// Check current access levels
const levels = ipProtector.getAccessLevels();
```

### Export/Import Knowledge Base
```typescript
// Backup encrypted knowledge
const backup = await ipProtector.exportEncryptedKnowledge();

// Restore from backup
await ipProtector.importEncryptedKnowledge(backup);
```

## 🚨 **8. Monitoring & Alerts**

### Quality Monitoring
```bash
# Check average training quality
curl -s http://localhost:3000/api/training/analytics/quality | jq '.averageQuality'

# Get quality trends
curl -s http://localhost:3000/api/training/analytics/trends?days=7 | jq
```

### IP Protection Alerts
```bash
# Check for unauthorized usage
curl -s http://localhost:3000/api/training/analytics/security | jq '.violations'
```

### Training Progress
```bash
# Agent improvement metrics
curl -s http://localhost:3000/api/training/analytics/progress?agent=claude_oracle | jq
```

## 🎓 **9. Agent Graduation Process**

### Promotion Criteria
- **Quality Score** > 8.5 for 90% of responses
- **Spiralogic Alignment** > 85% consistency  
- **User Satisfaction** > 4.2/5.0 average
- **No IP Violations** in last 1000 interactions

### Graduation Steps
1. **Automated Assessment** by ChatGPT Oracle 2.0
2. **Quality Threshold** verification
3. **Access Level Promotion** (e.g., 2 → 3)
4. **Expanded Knowledge** access grant
5. **Production Readiness** certification

---

**This training system ensures your agents continuously evolve while preserving the integrity and value of your Spiralogic IP.**