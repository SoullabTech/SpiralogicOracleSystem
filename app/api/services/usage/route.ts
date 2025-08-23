import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { serviceKey, action, metadata } = await req.json();
    
    if (!serviceKey || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Log usage event
    const usageEvent = {
      user_id: user?.id || null,
      service_key: serviceKey,
      action, // 'view', 'click', 'access'
      metadata: metadata || {},
      timestamp: new Date().toISOString()
    };

    try {
      await supabase
        .from('service_usage_events')
        .insert(usageEvent);
    } catch (dbError) {
      // Fallback to console logging if table doesn't exist
      console.log('[SERVICE_USAGE]', usageEvent);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Usage tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Simple usage stats - could be enhanced with more sophisticated queries
    const { data: stats } = await supabase
      .from('service_usage_events')
      .select('service_key, action')
      .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

    if (!stats) {
      return NextResponse.json({ stats: [] });
    }

    // Aggregate stats by service
    const aggregated = stats.reduce((acc: Record<string, any>, event) => {
      if (!acc[event.service_key]) {
        acc[event.service_key] = { views: 0, clicks: 0, total: 0 };
      }
      acc[event.service_key][event.action] = (acc[event.service_key][event.action] || 0) + 1;
      acc[event.service_key].total += 1;
      return acc;
    }, {});

    return NextResponse.json({ stats: aggregated });

  } catch (error) {
    console.error('Usage stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}