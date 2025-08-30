// Debug endpoint to check environment variables
export async function GET() {
  const envCheck = {
    supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    northflank_sesame_url: !!process.env.NORTHFLANK_SESAME_URL,
    northflank_sesame_api_key: !!process.env.NORTHFLANK_SESAME_API_KEY,
    voice_provider: process.env.VOICE_PROVIDER,
    sesame_provider: process.env.SESAME_PROVIDER,
    skip_onboarding: process.env.SKIP_ONBOARDING,
    node_env: process.env.NODE_ENV,
  };

  return Response.json({
    env_status: envCheck,
    timestamp: new Date().toISOString(),
  });
}