import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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

export async function POST(request: NextRequest) {
  try {
    const user = await checkAdminAccess();
    const supabase = createRouteHandlerClient({ cookies });
    
    const body = await request.json();
    const { 
      count = 5, 
      cohort = process.env.BETA_DEFAULT_COHORT || 'A',
      prefix = 'ADMIN'
    } = body;
    
    // Validate inputs
    if (count < 1 || count > 100) {
      return NextResponse.json({ error: 'Count must be 1-100' }, { status: 400 });
    }
    
    // Generate invite codes
    const invites = [];
    for (let i = 0; i < count; i++) {
      const suffix = Math.random().toString(36).substr(2, 6).toUpperCase();
      const code = `${prefix}-${suffix}`;
      
      invites.push({
        code,
        max_uses: 50,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        cohort,
        created_by: user.id
      });
    }
    
    // Insert invites
    const { data, error } = await supabase
      .from('beta_invites')
      .insert(invites)
      .select('code');
    
    if (error) {
      console.error('Failed to create invites:', error);
      return NextResponse.json({ error: 'Failed to create invites' }, { status: 500 });
    }
    
    return NextResponse.json({
      created: data?.length || 0,
      codes: data?.map(d => d.code) || []
    });

  } catch (error) {
    console.error('Admin invite creation error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : message === 'Admin access required' ? 403 : 500;
    
    return NextResponse.json({ error: message }, { status });
  }
}