import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { 
  evaluateUserBadges, 
  getUserBadges, 
  getBadgeProgress,
  checkBadgeEligibility 
} from '@/lib/beta/engine';
import { betaEvents } from '@/lib/beta/events';

// GET /api/beta/badges - Get user's badges and progress
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'progress':
        const progress = await getBadgeProgress(user.id);
        return NextResponse.json({ progress });

      case 'collection':
        const badges = await getUserBadges(user.id);
        return NextResponse.json({ badges });

      case 'check':
        const badgeCode = url.searchParams.get('badge');
        if (!badgeCode) {
          return NextResponse.json({ error: 'Badge code required' }, { status: 400 });
        }
        const eligible = await checkBadgeEligibility(user.id, badgeCode);
        return NextResponse.json({ eligible, badge: badgeCode });

      default:
        // Return both badges and progress by default
        const [userBadges, badgeProgress] = await Promise.all([
          getUserBadges(user.id),
          getBadgeProgress(user.id)
        ]);
        
        return NextResponse.json({
          badges: userBadges,
          progress: badgeProgress,
          total: userBadges.length
        });
    }

  } catch (error) {
    console.error('Beta badges GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}

// POST /api/beta/badges - Trigger badge evaluation or manual actions
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'evaluate':
        // Trigger badge evaluation for current user
        const newBadges = await evaluateUserBadges(user.id);
        
        if (newBadges.length > 0) {
          // Return new badges for toast notification
          const badgeDetails = await getUserBadges(user.id);
          const newBadgeDetails = badgeDetails.filter(b => 
            newBadges.includes(b.code)
          );
          
          return NextResponse.json({
            success: true,
            newBadges: newBadgeDetails,
            count: newBadges.length
          });
        }
        
        return NextResponse.json({
          success: true,
          newBadges: [],
          count: 0
        });

      case 'refresh':
        // Refresh user's current badge status
        const [badges, progress] = await Promise.all([
          getUserBadges(user.id),
          getBadgeProgress(user.id)
        ]);
        
        return NextResponse.json({
          success: true,
          badges,
          progress,
          total: badges.length
        });

      case 'emit_event':
        // Emit a beta event manually
        const { event } = data;
        if (!event?.kind) {
          return NextResponse.json({ error: 'Event kind required' }, { status: 400 });
        }
        
        try {
          switch (event.kind) {
            case 'admin_feedback':
              await betaEvents.adminFeedback(user.id, event.detail || {});
              break;
            case 'voice_preview':
              await betaEvents.voicePreview(user.id, event.detail || {});
              break;
            case 'holoflower_set':
              await betaEvents.holoflowerSet(user.id, event.detail || {});
              break;
            default:
              return NextResponse.json({ error: 'Unsupported event kind' }, { status: 400 });
          }
          
          return NextResponse.json({ success: true, eventEmitted: event.kind });
        } catch (error) {
          console.error('Beta event emission failed:', error);
          return NextResponse.json({ error: 'Event emission failed' }, { status: 500 });
        }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Beta badges POST error:', error);
    return NextResponse.json(
      { error: 'Badge operation failed' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function HEAD() {
  return NextResponse.json({ status: 'ok' });
}