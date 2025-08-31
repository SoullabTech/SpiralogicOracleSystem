# 🚨 SECURITY INCIDENT: API Keys Exposed in Git History

## Immediate Action Required

**Real API keys have been committed to version control and are visible in git history.**

### 1. Rotate All Exposed API Keys IMMEDIATELY

**OpenAI API Key**: `[REDACTED-OPENAI-KEY]`
- ❌ **REVOKE THIS KEY**: Go to https://platform.openai.com/api-keys
- ✅ **GENERATE NEW KEY**: Create replacement immediately

**Anthropic API Key**: `[REDACTED-ANTHROPIC-KEY]`
- ❌ **REVOKE THIS KEY**: Go to https://console.anthropic.com/
- ✅ **GENERATE NEW KEY**: Create replacement immediately

**ElevenLabs API Key**: `[REDACTED-ELEVENLABS-KEY]`
- ❌ **REVOKE THIS KEY**: Go to https://elevenlabs.io/app/settings/api-keys
- ✅ **GENERATE NEW KEY**: Create replacement immediately

### 2. Update Configuration Files

After rotating keys, update these files with new values:
- `.env.local` (your local development file)
- Production deployment environment variables (Vercel/Render/etc.)

**DO NOT update the existing `.env` or `backend/.env` files - they will be removed from git.**

### 3. Clean Git History (Optional but Recommended)

```bash
# Remove files from git tracking (keeps local copies)
git rm --cached .env backend/.env

# Commit the removal
git commit -m "Remove API keys from version control

- Rotate all exposed API keys immediately
- Use .env.local for development (already in .gitignore)"

# Push the removal
git push origin main
```

**Note**: This doesn't remove keys from git history. For complete removal, you'd need to rewrite git history, but this is dangerous for shared repositories.

### 4. Use Template-Based Configuration Going Forward

```bash
# For development
cp .env.development.template .env.local
# Edit .env.local with your new API keys

# For production  
cp .env.production.template .env.production
# Edit .env.production with production keys
```

## Standardized Port Configuration

To resolve port conflicts, the new templates use:

- **Development**: Port 3002 (matches maya-quick-start.sh)
- **Production**: Port 3001 (standard)
- **URLs are now consistent** across all configuration files

## Environment File Hierarchy

```
Root Level:
├── .env.development.template  ← Use for development
├── .env.production.template   ← Use for production
├── .env.local                ← Your local config (gitignored)
└── .env.production           ← Your production config (gitignored)

Platform Specific:
├── env/.env.vercel           ← Vercel deployment variables
├── env/.env.render           ← Render deployment variables
└── env/.env.local.minimal    ← Minimal build requirements
```

## Verification Steps

After fixing:

1. **Check API keys are revoked**:
   ```bash
   # This should fail with 401
   curl -H "Authorization: Bearer sk-proj-OLD-KEY" https://api.openai.com/v1/models
   ```

2. **Test with new keys**:
   ```bash
   cd backend
   APP_PORT=3002 ./maya-quick-start.sh
   curl -s http://localhost:3002/api/v1/converse/health | jq .
   ```

3. **Verify git doesn't track API keys**:
   ```bash
   git status
   # Should NOT show .env.local as tracked
   ```

## Prevention for Future

- ✅ `.gitignore` already includes `.env*`
- ✅ Templates created without real keys
- ✅ Documentation explains secure setup
- ✅ Port conflicts resolved

---

**Priority**: Complete API key rotation within the next hour to minimize exposure risk.