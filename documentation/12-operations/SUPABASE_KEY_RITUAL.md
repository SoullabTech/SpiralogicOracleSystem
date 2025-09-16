# 🔐 Supabase Key Security Ritual - Bulletproof Separation

## Overview
This system enforces strict, fail-fast separation between frontend (anon key) and backend (service role key) with automatic security validation in code.

---

## 🛡️ Security Architecture (Enforced in Code)

### Frontend (Browser) - `lib/supabaseClient.ts`
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY` only
- **Security Enforcement**:
  - ✅ Automatically detects and rejects service role keys
  - ✅ Throws error if `sb_secret` prefix found
  - ✅ Validates JWT format (must start with `eyJ`)
- **Mock Mode**: Returns `null` when `NEXT_PUBLIC_MOCK_SUPABASE=true`

### Backend (Server) - `backend/src/lib/supabase.ts`
- **Key**: `SUPABASE_SERVICE_ROLE_KEY` only (no fallbacks!)
- **Security Enforcement**:
  - ✅ Refuses to use anon keys or fallback keys
  - ✅ Validates `sb_secret_` prefix for service role
  - ✅ Hard fails if wrong key type detected
- **Mock Mode**: Returns stub client when `MOCK_SUPABASE=true`

---

## 🔄 Quick Mode Toggle

```bash
# One-command toggle between mock and real Supabase
./toggle-supabase.sh

# Console output shows current mode:
⚡ [SUPABASE] Mode: MOCK (stubbing DB calls)
   → No database writes, voice pipeline unblocked

🗄️ [SUPABASE] Mode: REAL (full persistence + analytics)
   → Using service role key for backend
```

---

## 📋 Environment Configuration

### Required in `.env.local`:
```bash
# ==============================================
# 🗄️ SUPABASE DATABASE
# ==============================================
# Mock mode control (toggle with ./toggle-supabase.sh)
MOCK_SUPABASE=true
NEXT_PUBLIC_MOCK_SUPABASE=true

# Backend-only (NEVER expose to frontend!)
SUPABASE_URL=https://[project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_[...]  # Must start with sb_secret_

# Frontend-safe (OK to expose in browser)
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ[...]  # JWT format, anon role
```

---

## ✅ Security Validation

### Automatic Frontend Protection
```javascript
// lib/supabaseClient.ts automatically enforces:
if (anonKey.startsWith("sb_secret")) {
  throw new Error(
    "[SUPABASE] ❌ SECURITY ERROR: Service role key detected in frontend!"
  );
}
```

### Automatic Backend Protection
```javascript
// backend/src/lib/supabase.ts automatically enforces:
if (supabaseKey && !supabaseKey.startsWith("sb_secret")) {
  throw new Error(
    "[SUPABASE] ❌ SECURITY ERROR: Backend must use service role key!"
  );
}
```

---

## 🚨 Error Messages & Fixes

### Frontend Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `SECURITY ERROR: Service role key detected in frontend!` | Using service role key in browser | Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` only |
| `Missing NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key not configured | Add to `.env.local` with `NEXT_PUBLIC_` prefix |
| `Warning: Key format unexpected` | Non-JWT formatted key | Ensure anon key starts with `eyJ` |

### Backend Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `SECURITY ERROR: Backend must use SUPABASE_SERVICE_ROLE_KEY` | Using anon key in backend | Set `SUPABASE_SERVICE_ROLE_KEY` with `sb_secret_` prefix |
| `Missing Supabase environment variables` | No keys configured | Add service role key to backend environment |

### Connection Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `connect ECONNREFUSED ::1:54321` | Local Supabase not running | Enable mock mode: `./toggle-supabase.sh` |
| `Invalid API key` | Malformed or expired key | Get fresh keys from Supabase dashboard |

---

## 🔍 Testing & Verification

### 1. Test Mock Mode
```bash
# Enable mock mode
./toggle-supabase.sh  # Select mock
./start-dev.sh

# Console should show:
# ⚡ [SUPABASE] Mode: MOCK (stubbing DB calls)
# ⚡ [SUPABASE] Frontend in MOCK mode (no DB operations)
```

### 2. Test Real Mode
```bash
# Enable real Supabase
./toggle-supabase.sh  # Select real
./start-dev.sh

# Console should show:
# 🗄️ [SUPABASE] Mode: REAL (full persistence + analytics)
# [SUPABASE] Frontend client initialized with anon key
```

### 3. Verify Key Separation
```bash
# Check backend logs for:
[SUPABASE] Mode: REAL (full persistence + analytics)
   → Using service role key for backend

# Check browser console for:
[SUPABASE] Frontend client initialized with anon key
```

---

## 📊 Key Comparison Matrix

| Aspect | Anon Key | Service Role Key |
|--------|----------|------------------|
| **Prefix** | `eyJ...` (JWT) | `sb_secret_...` |
| **Location** | `.env.local` with `NEXT_PUBLIC_` | Backend `.env` only |
| **Visibility** | Safe in browser | Server-only secret |
| **RLS** | Respects policies | Bypasses all RLS |
| **Code Location** | `lib/supabaseClient.ts` | `backend/src/lib/supabase.ts` |
| **Auto-Validation** | Rejects `sb_secret` | Requires `sb_secret` |
| **If Exposed** | Low risk (RLS protects) | **CRITICAL** (full DB access) |

---

## 🔒 Security Principles

1. **Fail Fast**: Throw errors immediately on misconfiguration
2. **No Fallbacks**: Backend won't fall back to anon keys
3. **Automatic Validation**: Keys are checked at runtime
4. **Clear Logging**: Always shows which mode and key type
5. **Mock First**: Use mock mode to avoid DB issues during development

---

## 🚀 Quick Commands

```bash
# Toggle between mock/real modes
./toggle-supabase.sh

# Check current mode
grep MOCK_SUPABASE .env.local

# Start development servers
./start-dev.sh

# Verify no service role key in frontend build
grep -r "sb_secret" .next/
# Should return nothing!
```

---

## 🔄 Migration Checklist

When setting up a new environment:

- [ ] Run `./toggle-supabase.sh` to set initial mode
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to backend environment
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` to frontend environment
- [ ] Start servers and verify console logs show correct keys
- [ ] Test mock mode works without database
- [ ] Test real mode connects to Supabase
- [ ] Verify frontend can't use service role key (should throw)
- [ ] Verify backend won't accept anon key (should throw)

---

**Last Updated**: 2025-09-05  
**Security Level**: Production Hardened  
**Enforcement**: Automatic in Code  
**Next Review**: Before deployment