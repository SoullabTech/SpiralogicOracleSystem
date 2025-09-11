# Production Environment Fix

## Issue
The oracle conversation is showing mock responses and using robotic voice due to incorrect environment settings in production.

## Solution
Update the following environment variables in Vercel:

### Required Environment Variables

1. **NEXT_PUBLIC_MOCK_SUPABASE** = `false`
   - Currently set to `true`, causing mock database responses
   
2. **NEXT_PUBLIC_API_MODE** = `ai`
   - Currently set to `stub`, causing stock responses instead of AI
   
3. **ANTHROPIC_API_KEY** = `[your-api-key]`
   - Required for Claude AI responses
   
4. **NEXT_PUBLIC_SUPABASE_URL** = `[your-supabase-url]`
   - Required for database connections
   
5. **NEXT_PUBLIC_SUPABASE_ANON_KEY** = `[your-supabase-anon-key]`
   - Required for database connections

## How to Update in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project (SpiralogicOracleSystem)
3. Go to Settings → Environment Variables
4. Update or add the above variables
5. Redeploy the application

## Expected Results After Fix

- ✅ Real AI responses from Claude instead of "I hear you deeply..."
- ✅ Natural voice synthesis (Samantha, Victoria, etc.) instead of robotic voice
- ✅ Proper conversation memory and context
- ✅ Database persistence of conversations
- ✅ User authentication and personalization

## Testing

After updating environment variables and redeploying:

1. Visit https://soullab.life/oracle-conversation
2. Try speaking or typing a message
3. Verify:
   - Response is contextual and intelligent (not stock phrases)
   - Voice sounds natural (not robotic)
   - Conversation is saved (check history)

## Local Development

For local development, update `.env.local`:

```env
NEXT_PUBLIC_MOCK_SUPABASE=false
NEXT_PUBLIC_API_MODE=ai
ANTHROPIC_API_KEY=your-key-here
NEXT_PUBLIC_SUPABASE_URL=your-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Note

The `.env.production` file is gitignored and won't affect the deployed site. 
Production environment variables must be set in Vercel's dashboard.