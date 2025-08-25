// Debug endpoint to check environment variables
export async function GET() {
  const envCheck = {
    supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    runpod_api_key: !!process.env.RUNPOD_API_KEY,
    runpod_endpoint: !!process.env.RUNPOD_ENDPOINT_ID,
    skip_onboarding: process.env.SKIP_ONBOARDING,
    node_env: process.env.NODE_ENV,
  };

  return Response.json({
    env_status: envCheck,
    timestamp: new Date().toISOString(),
  });
}