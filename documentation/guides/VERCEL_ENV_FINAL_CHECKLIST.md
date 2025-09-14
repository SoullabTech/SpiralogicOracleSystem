# 🚀 Vercel Environment Variables - Final Checklist

## ✅ Variables You Already Have in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL` ✓
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓
- `SUPABASE_SERVICE_ROLE_KEY` ✓ (Sensitive)
- `ELEVENLABS_API_KEY` ✓
- `NEXT_PUBLIC_ELEVENLABS_VOICE_ID` ✓
- `VOICE_PROVIDER` ✓
- `NEXT_PUBLIC_SKIP_ONBOARDING` ✓
- `NEXT_PUBLIC_ENV_NAME` ✓

## 🔴 Critical Variables MISSING in Vercel:

### 1. Backend Supabase Variables (Required for backend to work)
```
SUPABASE_URL=https://jkbetmadzcpoinjogkli.supabase.co
SUPABASE_ANON_KEY=[copy from your NEXT_PUBLIC_SUPABASE_ANON_KEY]
```

### 2. Legacy Vite Variables (Still needed by backend)
```
VITE_SUPABASE_URL=https://jkbetmadzcpoinjogkli.supabase.co
VITE_SUPABASE_ANON_KEY=[copy from your NEXT_PUBLIC_SUPABASE_ANON_KEY]
```

### 3. AI/LLM Keys (If Maya chat features are needed)
```
OPENAI_API_KEY=[your OpenAI key]
ANTHROPIC_API_KEY=[your Anthropic key]
```

### 4. Memory Service (If using Mem0)
```
MEM0_API_KEY=[your Mem0 key]
```

## 🟡 Optional Variables (Add if features are used):

### Voice Configuration
```
ELEVENLABS_VOICE_ID_EMILY=LcfcDJNUP1GQjkzn1xUU
DEFAULT_VOICE_ID=LcfcDJNUP1GQjkzn1xUU
```

### Backend URL (for frontend-backend communication)
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.vercel.app
```

### Security
```
JWT_SECRET=[generate a secure random string]
NEXTAUTH_SECRET=[generate with: openssl rand -base64 32]
NEXTAUTH_URL=https://your-app.vercel.app
```

## 📋 Action Items:

### 1. Immediately Add These 4 Variables:
```env
SUPABASE_URL=https://jkbetmadzcpoinjogkli.supabase.co
SUPABASE_ANON_KEY=[copy your anon key from NEXT_PUBLIC_SUPABASE_ANON_KEY]
VITE_SUPABASE_URL=https://jkbetmadzcpoinjogkli.supabase.co
VITE_SUPABASE_ANON_KEY=[copy your anon key from NEXT_PUBLIC_SUPABASE_ANON_KEY]
```

### 2. Mark as Sensitive:
- `ELEVENLABS_API_KEY` (currently visible)
- `OPENAI_API_KEY` (when added)
- `ANTHROPIC_API_KEY` (when added)
- `MEM0_API_KEY` (when added)

### 3. Delete:
- `review` variable (appears to be a typo)

### 4. Environment Scoping:
- Move `NEXT_PUBLIC_SKIP_ONBOARDING` to "Preview" only (not Production)

## 🎯 Minimum Required for Deployment:

If you just want the app to deploy without errors, add these 4:
1. `SUPABASE_URL`
2. `SUPABASE_ANON_KEY`
3. `VITE_SUPABASE_URL`
4. `VITE_SUPABASE_ANON_KEY`

## ⚠️ Security Notes:

- Your `.env.local` contains real API keys - NEVER commit this file
- The `.env` file is now a safe template without real keys
- Always mark API keys as "Sensitive" in Vercel
- Use different keys for Production vs Development when possible

## 🔍 Verification:

After adding variables, test deployment:
```bash
git commit --allow-empty -m "test: Verify env vars"
git push
```

Check build logs in Vercel for any "undefined" environment variable errors.