# Claude Code Guardrails - Conversational Pipeline Protection

## 🛡️ MANDATORY FLAGS - NEVER REMOVE

When editing any server or Docker files, you MUST ensure these flags are set and properly wired:

### Critical Conversational Pipeline Flags
- `DEMO_PIPELINE_DISABLED=true`
- `USE_CLAUDE=true`
- `ATTENDING_ENFORCEMENT_MODE=relaxed`
- `MAYA_GREETING_ENABLED=true`
- `MAYA_MODE_DEFAULT=conversational`
- `START_SERVER=full`

### Soul Memory & Processing Flags
- `SOUL_MEMORY_ENRICH_SYNC=true`
- `SOUL_MEMORY_ENRICH_BUDGET_MS=350`

### Multimodal Upload Flags
- `UPLOADS_ENABLED=true`
- `MICROPSI_ENABLED=true`

## 🔍 Required Implementation

### 1. Runtime Flags in Oracle Turn Route
All Oracle API routes MUST include:
```typescript
const FLAGS = {
  USE_CLAUDE: process.env.USE_CLAUDE === 'true',
  DEMO_PIPELINE_DISABLED: process.env.DEMO_PIPELINE_DISABLED === 'true',
  ATTENDING_ENFORCEMENT_MODE: process.env.ATTENDING_ENFORCEMENT_MODE ?? 'relaxed',
  MAYA_GREETING_ENABLED: process.env.MAYA_GREETING_ENABLED === 'true',
  MAYA_MODE_DEFAULT: process.env.MAYA_MODE_DEFAULT ?? 'conversational',
  START_SERVER: process.env.START_SERVER ?? 'full',
  UPLOADS_ENABLED: process.env.UPLOADS_ENABLED === 'true',
  MICROPSI_ENABLED: process.env.USE_MICROPSI_BACH === 'true',
  SOUL_MEMORY_ENRICH_SYNC: process.env.SOUL_MEMORY_ENRICH_SYNC === 'true',
  SOUL_MEMORY_ENRICH_BUDGET_MS: Number(process.env.SOUL_MEMORY_ENRICH_BUDGET_MS ?? 350),
};
```

### 2. Metadata Exposure in Responses
All Oracle responses MUST include flags in metadata:
```typescript
metadata: {
  // ... other metadata
  flags: {
    conversationalMode:
      FLAGS.DEMO_PIPELINE_DISABLED &&
      FLAGS.USE_CLAUDE &&
      FLAGS.ATTENDING_ENFORCEMENT_MODE === 'relaxed' &&
      FLAGS.MAYA_GREETING_ENABLED,
    ...FLAGS,
  }
}
```

### 3. Debug Endpoint Required
Must maintain `/api/debug/flags` endpoint that returns:
```json
{
  "conversationalMode": true,
  "flags": { /* all flags */ },
  "hints": [ /* suggestions if not conversational */ ]
}
```

### 4. Docker Environment Variables
Docker Compose files MUST pass all flags to containers:
```yaml
environment:
  - DEMO_PIPELINE_DISABLED=true
  - USE_CLAUDE=true
  - ATTENDING_ENFORCEMENT_MODE=relaxed
  - MAYA_GREETING_ENABLED=true
  - MAYA_MODE_DEFAULT=conversational
  - START_SERVER=full
  - SOUL_MEMORY_ENRICH_SYNC=true
  - SOUL_MEMORY_ENRICH_BUDGET_MS=350
  - UPLOADS_ENABLED=true
  - USE_MICROPSI_BACH=true
```

## 🚫 FORBIDDEN CHANGES

**Claude Code MUST refuse any change that:**
1. Removes or overrides these flags without explicit instruction
2. Sets `DEMO_PIPELINE_DISABLED=false`
3. Sets `USE_CLAUDE=false`
4. Changes `ATTENDING_ENFORCEMENT_MODE` from `relaxed` to `strict`
5. Removes the `/api/debug/flags` endpoint
6. Removes flags metadata from Oracle responses

## ✅ Instant Verification

One-line verification command:
```bash
curl -s http://localhost:3000/api/debug/flags | jq .conversationalMode
```

**Expected result: `true`**

If result is `false`, the system has regressed to demo mode.

## 🔧 Emergency Recovery

If conversational mode regresses:

1. **Check flags endpoint**: `curl -s http://localhost:3000/api/debug/flags`
2. **Check container environment**: 
   ```bash
   docker compose exec frontend printenv | grep -E "DEMO_PIPELINE|USE_CLAUDE|ATTENDING"
   ```
3. **Force rebuild**: 
   ```bash
   docker compose down -v && docker compose up --build -d
   ```

## 🎯 Success Indicators

System is properly configured when:
- ✅ Oracle greets users by name on first interaction
- ✅ Responses are 4-12 sentences with natural questions
- ✅ No "Consider diving into..." demo responses
- ✅ `/api/debug/flags` shows `conversationalMode: true`
- ✅ Upload processing and badge systems work correctly

## 📋 Checklist for Every Code Change

Before any commit involving server/Docker changes:
- [ ] Verify all critical flags are present
- [ ] Confirm Docker environment passes flags to containers  
- [ ] Test `/api/debug/flags` returns `conversationalMode: true`
- [ ] Verify Oracle responses include flags metadata
- [ ] Test actual Oracle conversation shows conversational behavior

**These guardrails prevent regression from conversational mode to demo mode and ensure the multimodal Oracle system maintains its full capabilities.**