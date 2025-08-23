import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getBetaConfig, updateBetaConfig } from '@/lib/beta/config';
import { DEFAULT_BETA_CONFIG } from '@/lib/beta/types';

async function checkAdminAccess() {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  // Check admin permission
  const adminEmails = process.env.ADMIN_ALLOWED_EMAILS?.split(',') || [];
  if (!adminEmails.includes(user.email || '')) {
    throw new Error('Admin access required');
  }
  
  return user;
}

export async function GET(request: NextRequest) {
  try {
    await checkAdminAccess();
    
    const config = await getBetaConfig();
    
    return NextResponse.json({
      config,
      defaults: DEFAULT_BETA_CONFIG
    });

  } catch (error) {
    console.error('Admin beta tuning GET error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : message === 'Admin access required' ? 403 : 500;
    
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await checkAdminAccess();
    
    const body = await request.json();
    const { patch } = body;
    
    if (!patch || typeof patch !== 'object') {
      return NextResponse.json({ error: 'Invalid patch object' }, { status: 400 });
    }
    
    const updatedConfig = await updateBetaConfig(patch);
    
    return NextResponse.json({
      config: updatedConfig,
      updated: true
    });

  } catch (error) {
    console.error('Admin beta tuning POST error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : message === 'Admin access required' ? 403 : 400;
    
    return NextResponse.json({ error: message }, { status });
  }
}