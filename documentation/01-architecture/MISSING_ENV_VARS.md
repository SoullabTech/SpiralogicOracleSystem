# 🚨 MISSING ENVIRONMENT VARIABLES CHECKLIST

## Critical for Beta Launch (MUST HAVE)

### 1. **OpenAI API** ❌ REQUIRED
```bash
OPENAI_API_KEY=sk-...  # Used in 15+ services
OPENAI_ORGANIZATION=org-...  # Optional but recommended
```
**Used in:**
- `/services/SafetyModerationService.ts`
- `/services/IngestionQueue.ts`
- `/services/semanticRecall.ts`
- `/services/ElementalOracleGPTService.ts`
- `/services/ComprehensiveSafetyService.ts`

### 2. **Supabase Database** ❌ REQUIRED
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Admin access
SUPABASE_ANON_KEY=eyJ...  # Public access
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```
**Used in:**
- `/services/IngestionQueue.ts`
- `/services/UserMemoryService.ts`
- `/services/DynamicGreetingService.ts`
- `/config/supabase.ts`

### 3. **JWT Authentication** ❌ REQUIRED
```bash
JWT_SECRET=your-256-bit-secret-key  # CHANGE THIS!
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=different-256-bit-secret  # CHANGE THIS!
JWT_REFRESH_EXPIRES_IN=7d
```
**Used in:**
- `/middleware/authMiddleware.ts`
- `/config/jwt.ts`

### 4. **Voice Services** ⚠️ PARTIAL
```bash
# ElevenLabs (Primary TTS)
ELEVENLABS_API_KEY=your-key
ELEVENLABS_VOICE_ID_EMILY=LcfcDJNUP1GQjkzn1xUU
ELEVENLABS_VOICE_ID_AUNT_ANNIE=y2TOWGCXSYEgBanvKsYJ
ELEVENLABS_VOICE_ID_NOVA=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_VOICE_ID_DOMI=AZnzlk1XvdvUeBnXmlld
DEFAULT_VOICE_ID=LcfcDJNUP1GQjkzn1xUU

# Sesame (Local TTS)
SESAME_URL=http://localhost:8000
SESAME_CSM_URL=http://localhost:8000
SESAME_API_KEY=optional-key
SESAME_ENABLED=true
SESAME_FALLBACK_ENABLED=true
SESAME_VOICE_ID=maya
SESAME_TOKEN=optional-token
```
**Used in:**
- `/services/ElevenLabsService.ts`
- `/services/StreamingVoiceService.ts`
- `/services/SesameTTS.ts`
- `/services/SesameService.ts`
- `/services/TTSOrchestrator.ts`

## Important but Optional

### 5. **Anthropic Claude** ⚠️ OPTIONAL
```bash
ANTHROPIC_API_KEY=sk-ant-...
```
**Used in:**
- `/services/ElementalIntelligenceRouter.ts`

### 6. **Redis Cache** ⚠️ OPTIONAL
```bash
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```
**Used in:**
- `/middleware/rateLimiter.ts`

### 7. **Decentralized AI** ⚠️ OPTIONAL
```bash
# SingularityNET
ENABLE_DECENTRALIZED=false
SINGULARITYNET_API_KEY=
SINGULARITYNET_ENDPOINT=https://api.singularitynet.io
SINGULARITYNET_WALLET=
SINGULARITYNET_PRIVATE_KEY=

# GaiaNet
GAIANET_NODE_URL=https://node.gaianet.ai
GAIANET_API_KEY=
GAIANET_WALLET=

# Bittensor
BITTENSOR_ENDPOINT=wss://test.finney.opentensor.ai
BITTENSOR_HOTKEY=
BITTENSOR_COLDKEY=
```

### 8. **Calendar Integration** ⚠️ OPTIONAL
```bash
CALENDLY_API_KEY=
CALENDLY_ORGANIZATION_URI=
MS_GRAPH_TOKEN=
MS_CLIENT_ID=
GOOGLE_CALENDAR_TOKEN=
```

### 9. **Memory Systems** ⚠️ OPTIONAL
```bash
MEM0_API_KEY=
MEM0_ORG_ID=
PSI_MEMORY_ENABLED=true
PSI_LEARNING_ENABLED=true
PSI_LEARNING_RATE=0.08
```

## Server Configuration

### 10. **Basic Server** ✅ Has Defaults
```bash
PORT=3001  # Default: 3001
NODE_ENV=development  # Default: development
API_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### 11. **CORS & Security** ✅ Has Defaults
```bash
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_BYPASS_SECRET=optional-secret
```

### 12. **Logging** ✅ Has Defaults
```bash
LOG_LEVEL=info
MORGAN_FORMAT=combined
```

## Debug & Development

### 13. **Debug Flags** ⚠️ OPTIONAL
```bash
MAYA_DEBUG_MEMORY=false
MAYA_DEBUG_PERFORMANCE=false
SESAME_CI_ENABLED=false
SESAME_CI_REQUIRED=false
SAFETY_BYPASS_TEST=0
```

### 14. **Feature Flags** ⚠️ OPTIONAL
```bash
USE_STUB_VOICE=false
USE_SESAME=true
SESAME_SELF_HOSTED=false
SESAME_FAIL_FAST=false
TTS_ENABLE_FALLBACK=true
TTS_ENABLE_CACHE=true
VOICE_FAIL_FAST=false
VOICE_TRACK_PERFORMANCE=false
```

## Testing & External Services

### 15. **External APIs** ⚠️ OPTIONAL
```bash
PREFECT_API_URL=https://api.prefect.io
PREFECT_API_KEY=
MAIN_ORACLE_ENDPOINT=https://api.spiralogic.oracle/v1
SNET_SERVICE_PORT=7000
DEEPSEEK_PORT=3333
DEEPSEEK_MODEL=deepseek-coder:6.7b
DEEPSEEK_BASE_URL=http://localhost:11434
```

---

## 🚀 Quick Start for Beta

### Minimum Required `.env` file:
```bash
# COPY THIS TO .env AND FILL IN YOUR KEYS

# OpenAI (REQUIRED)
OPENAI_API_KEY=sk-...

# Supabase (REQUIRED)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Authentication (REQUIRED - CHANGE THESE!)
JWT_SECRET=change-this-to-random-256-bit-string
JWT_REFRESH_SECRET=change-this-to-different-256-bit-string

# Voice (REQUIRED - at least one)
ELEVENLABS_API_KEY=your-elevenlabs-key
# OR
SESAME_URL=http://localhost:8000
SESAME_ENABLED=true

# Server
PORT=3001
NODE_ENV=development
```

---

## 📍 Where These Are Used

### Authentication Middleware
- **File:** `/middleware/authMiddleware.ts`
- **Missing:** JWT_SECRET (using fallback)
- **Impact:** ❌ Authentication will fail in production

### Orchestrator
- **File:** `/services/agentOrchestrator.ts`
- **Missing:** ENABLE_DECENTRALIZED
- **Impact:** ✅ Has fallback (disabled)

### Safety Service
- **File:** `/services/ComprehensiveSafetyService.ts`
- **Missing:** OPENAI_API_KEY
- **Impact:** ❌ Safety checks will fail

### Voice Services
- **Files:** Multiple in `/services/`
- **Missing:** ELEVENLABS_API_KEY or SESAME_URL
- **Impact:** ❌ Voice features won't work

### Memory Services
- **Files:** `/services/UserMemoryService.ts`, `/services/IngestionQueue.ts`
- **Missing:** SUPABASE_* keys
- **Impact:** ❌ Memory storage will fail

---

## 🔧 Testing Authentication

The authentication middleware (`/middleware/authMiddleware.ts`) needs testing:

1. **Current Issues:**
   - Using fallback JWT secret
   - No user type checking
   - Missing refresh token rotation

2. **Test with:**
```bash
# Generate test token
npm run test:auth

# Or manually test endpoint
curl -X POST http://localhost:3001/api/beta/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

---

## 🎯 Action Items

1. **Immediate (Blocking Beta):**
   - [ ] Get OpenAI API key
   - [ ] Set up Supabase project and get keys
   - [ ] Generate secure JWT secrets
   - [ ] Choose voice service (ElevenLabs or Sesame)

2. **Before Public Beta:**
   - [ ] Set up Redis for rate limiting
   - [ ] Configure proper CORS origins
   - [ ] Add Anthropic API key for fallback

3. **Nice to Have:**
   - [ ] Decentralized AI keys (SingularityNET, etc.)
   - [ ] Calendar integration keys
   - [ ] Memory system enhancements (Mem0)