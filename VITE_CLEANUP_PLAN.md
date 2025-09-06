# 🔄 VITE_SUPABASE Variable Migration Plan

## 📊 Current Usage Analysis

### Files Using VITE_SUPABASE Variables:
1. **backend/src/utils/supabase.ts** - Has fallback to SUPABASE_URL/SUPABASE_ANON_KEY
2. **backend/src/lib/config.ts** - Validates VITE_ variables in schema
3. **backend/scripts/test-supabase-connection.js** - Test script checking connection
4. **backend/dist/** - Compiled versions (will update after source changes)

## ⚠️ Why VITE_ Variables Still Exist

The backend was originally built with Vite and still expects these variables. However, they're redundant since:
- Frontend uses `NEXT_PUBLIC_SUPABASE_*`
- Backend could use standard `SUPABASE_URL` and `SUPABASE_ANON_KEY`

## 🎯 Migration Strategy

### Option A: Quick Fix (Recommended for Beta Launch)
Keep VITE_ variables in Vercel but add standard fallbacks:

```env
# In Vercel - Keep these for now
VITE_SUPABASE_URL=https://jkbetmadzcpoinjogkli.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Also add standard versions
SUPABASE_URL=https://jkbetmadzcpoinjogkli.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Option B: Full Migration (Post-Beta)
Update all backend files to use standard variable names:

#### 1. Update backend/src/utils/supabase.ts
```typescript
// From:
process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ""

// To:
process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
```

#### 2. Update backend/src/lib/config.ts
```typescript
// From:
VITE_SUPABASE_URL: z.string().url(),
VITE_SUPABASE_ANON_KEY: z.string(),

// To:
SUPABASE_URL: z.string().url(),
SUPABASE_ANON_KEY: z.string(),
```

#### 3. Update test scripts
Replace all `VITE_SUPABASE_*` references with `SUPABASE_*`

## 📋 Immediate Actions for Beta

### 1. Add to Vercel (if not present):
```env
SUPABASE_URL=https://jkbetmadzcpoinjogkli.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # CRITICAL - Mark as Sensitive
```

### 2. Keep VITE_ variables for now:
- Don't delete them yet - backend still needs them
- Plan migration for post-beta

### 3. Document the redundancy:
- Add comment in .env.example explaining the duplication
- Schedule cleanup task for post-beta

## 🚀 Post-Beta Cleanup Checklist

- [ ] Update all backend files to use standard SUPABASE_* variables
- [ ] Remove VITE_ variables from Vercel
- [ ] Update documentation
- [ ] Test backend thoroughly
- [ ] Remove VITE_ from .env.example

## 📊 Final Variable State (After Full Migration)

### Variables to Keep:
- `NEXT_PUBLIC_SUPABASE_URL` (frontend)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (frontend)
- `SUPABASE_URL` (backend)
- `SUPABASE_ANON_KEY` (backend)
- `SUPABASE_SERVICE_ROLE_KEY` (backend - sensitive)

### Variables to Remove (Post-Beta):
- `VITE_SUPABASE_URL` ❌
- `VITE_SUPABASE_ANON_KEY` ❌

## 🎯 Recommendation

**For Beta Launch**: Use Option A - Keep VITE_ variables but add standard ones too. This ensures stability.

**Post-Beta**: Schedule Option B migration to clean up the redundancy.