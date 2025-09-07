# 🧹 Vercel Environment Variables Cleanup Guide

## ✅ Variables to KEEP in Vercel

### Production Environment
```env
# Public (Client-safe)
NEXT_PUBLIC_SUPABASE_URL=https://jkbetmadzcpoinjogkli.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ENV_NAME=production

# Server-only (Mark as Sensitive ⚠️)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # ADD THIS - CRITICAL!
RUNPOD_API_KEY=your-runpod-key
RUNPOD_ENDPOINT_ID=your-endpoint-id
VOICE_PROVIDER=runpod

# Legacy (Keep until backend migration)
VITE_SUPABASE_URL=https://jkbetmadzcpoinjogkli.supabase.co
VITE_SUPABASE_KEY=your-anon-key
```

### Preview/Staging Environment
```env
# Public (Client-safe)
NEXT_PUBLIC_SUPABASE_URL=https://jkbetmadzcpoinjogkli.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ENV_NAME=staging
NEXT_PUBLIC_SKIP_ONBOARDING=true  # Only in staging/dev

# Server-only (Mark as Sensitive ⚠️)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # ADD THIS - CRITICAL!
RUNPOD_API_KEY=your-runpod-key
RUNPOD_ENDPOINT_ID=your-endpoint-id
VOICE_PROVIDER=runpod

# Legacy (Keep until backend migration)
VITE_SUPABASE_URL=https://jkbetmadzcpoinjogkli.supabase.co
VITE_SUPABASE_KEY=your-anon-key
```

---

## ❌ Variables to REMOVE from Vercel

1. **`SKIP_ONBOARDING`** - Delete this, use only `NEXT_PUBLIC_SKIP_ONBOARDING`

---

## 📋 Step-by-Step Cleanup Instructions

### 1. Add Missing Critical Variable
```bash
SUPABASE_SERVICE_ROLE_KEY=service_role_key_from_supabase_dashboard
```
⚠️ **CRITICAL**: Get this from Supabase Dashboard → Settings → API → Service Role Key

### 2. Remove Duplicate Variable
- Go to Vercel Dashboard → Settings → Environment Variables
- Find `SKIP_ONBOARDING` and delete it
- Keep only `NEXT_PUBLIC_SKIP_ONBOARDING`

### 3. Mark Sensitive Variables
Click "Edit" on each and check "Sensitive" for:
- `SUPABASE_SERVICE_ROLE_KEY` ⚠️
- `RUNPOD_API_KEY`
- `RUNPOD_ENDPOINT_ID`

### 4. Split by Environment Scope
Move variables from "All Environments" to specific scopes:
- Production-only variables → "Production"
- Staging/Preview variables → "Preview"
- Remove `NEXT_PUBLIC_SKIP_ONBOARDING` from Production

---

## 🔍 Code Changes Already Applied

✅ **Unified SKIP_ONBOARDING usage:**
- `middleware.ts:75` - Changed to use `NEXT_PUBLIC_SKIP_ONBOARDING`
- `app/api/debug/env/route.ts:10` - Changed to use `NEXT_PUBLIC_SKIP_ONBOARDING`
- `app/auth/callback/page.tsx:47` - Already uses `NEXT_PUBLIC_SKIP_ONBOARDING`

---

## 🚀 Final Vercel Configuration

After cleanup, you should have:

| Variable | Production | Preview | Sensitive |
|----------|------------|---------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | ❌ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | ❌ |
| `NEXT_PUBLIC_ENV_NAME` | ✅ | ✅ | ❌ |
| `NEXT_PUBLIC_SKIP_ONBOARDING` | ❌ | ✅ | ❌ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ | ✅ |
| `RUNPOD_API_KEY` | ✅ | ✅ | ✅ |
| `RUNPOD_ENDPOINT_ID` | ✅ | ✅ | ✅ |
| `VOICE_PROVIDER` | ✅ | ✅ | ❌ |
| `VITE_SUPABASE_URL` | ✅ | ✅ | ❌ |
| `VITE_SUPABASE_KEY` | ✅ | ✅ | ❌ |

---

## ⚡ Quick Verification

After making changes, test with:

```bash
# Trigger new deployment
git commit --allow-empty -m "test: Verify env vars after cleanup"
git push

# Check debug endpoint
curl https://your-app.vercel.app/api/debug/env
```

Expected response should show:
```json
{
  "env_status": {
    "supabase_url": true,
    "supabase_key": true,
    "skip_onboarding": "true",  // or null in production
    ...
  }
}
```