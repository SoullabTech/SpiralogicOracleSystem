import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { isAdminUser } from '@/lib/server/supabaseAdmin';

export async function GET(req: Request) {
  try {
    // Admin auth check
    const cookieStore = cookies();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const isAdmin = await isAdminUser(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get query params
    const url = new URL(req.url);
    const flagKey = url.searchParams.get('key');
    
    if (!flagKey) {
      return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
    }

    // Get audit history for this flag
    const { data: history } = await supabase
      .from('admin_audit_log')
      .select('operation, old_values, new_values, created_at, user_id')
      .eq('table_name', 'feature_flags')
      .eq('row_id', flagKey)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get user emails separately to avoid join complexity
    const formattedHistory = [];
    for (const entry of history || []) {
      const { data: user } = await supabase.auth.admin.getUserById(entry.user_id);
      formattedHistory.push({
        operation: entry.operation,
        old_values: entry.old_values,
        new_values: entry.new_values,
        created_at: entry.created_at,
        user_email: user?.user?.email || 'unknown'
      });
    }

    return NextResponse.json({ 
      history: formattedHistory 
    });

  } catch (error) {
    console.error('History error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}