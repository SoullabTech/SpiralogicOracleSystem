import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getConstellationNameStrict } from '@/types/badges';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check admin permission
    const adminEmails = process.env.ADMIN_ALLOWED_EMAILS?.split(',') || [];
    if (!adminEmails.includes(user.email || '')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get recent ceremonies with constellation details
    const { data: ceremonies, error: ceremoniesError } = await supabase
      .from('badge_ceremonies')
      .select(`
        id,
        user_id,
        constellation_code,
        status,
        started_at,
        completed_at,
        badge_constellations (
          name,
          description
        )
      `)
      .order('started_at', { ascending: false })
      .limit(50);

    if (ceremoniesError) {
      console.error('Failed to fetch ceremonies:', ceremoniesError);
      return NextResponse.json({ error: 'Failed to fetch ceremonies' }, { status: 500 });
    }

    // Format ceremonies for admin display
    const formattedCeremonies = ceremonies?.map(ceremony => {
      const duration = ceremony.started_at && ceremony.completed_at
        ? (new Date(ceremony.completed_at).getTime() - new Date(ceremony.started_at).getTime()) / (1000 * 60)
        : null;

      return {
        id: ceremony.id,
        user_id: ceremony.user_id,
        constellation_code: ceremony.constellation_code,
        constellation_name: getConstellationNameStrict(
          ceremony.badge_constellations,
          ceremony.constellation_code
        ),
        status: ceremony.status,
        started_at: ceremony.started_at,
        completed_at: ceremony.completed_at,
        duration_minutes: duration
      };
    }) || [];

    return NextResponse.json({
      ceremonies: formattedCeremonies
    });

  } catch (error) {
    console.error('Admin badge ceremonies error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}