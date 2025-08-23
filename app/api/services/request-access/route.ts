import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { serviceKey, serviceName } = await req.json();
    
    if (!serviceKey || !serviceName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Store access request
    const { error } = await supabase
      .from('service_access_requests')
      .insert({
        user_id: user.id,
        service_key: serviceKey,
        service_name: serviceName,
        status: 'pending',
        requested_at: new Date().toISOString()
      });

    if (error) {
      // If table doesn't exist, just log for now
      console.log('Access request:', {
        user: user.email,
        service: serviceName,
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Access request logged' 
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Access request submitted successfully' 
    });

  } catch (error) {
    console.error('Request access error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}