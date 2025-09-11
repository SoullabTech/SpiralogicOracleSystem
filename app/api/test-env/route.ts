import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    env: {
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      anthropicKeyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
      apiMode: process.env.NEXT_PUBLIC_API_MODE,
      mockSupabase: process.env.NEXT_PUBLIC_MOCK_SUPABASE,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      // Check various possible key names
      hasClaudeKey: !!process.env.CLAUDE_API_KEY,
      hasNextPublicAnthropicKey: !!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      // List all env vars that start with ANTHROPIC or CLAUDE (without values)
      envKeys: Object.keys(process.env).filter(key => 
        key.includes('ANTHROPIC') || key.includes('CLAUDE')
      ),
      deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
      gitCommit: process.env.VERCEL_GIT_COMMIT_SHA
    }
  });
}