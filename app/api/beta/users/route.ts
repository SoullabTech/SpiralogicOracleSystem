/**
 * Beta Users API
 * Returns list of registered beta testers and their activity
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// Beta testers master list
const BETA_TESTERS = [
  { name: 'Andrea Fagan', email: 'andreadfagan@gmail.com', passcode: 'SOULLAB-ANDREAFAGAN' },
  { name: 'Andrea Nezat', email: 'andreanezat@gmail.com', passcode: 'SOULLAB-ANDREA' },
  { name: 'Angela Economakis', email: 'aceconomakis@gmail.com', passcode: 'SOULLAB-ANGELA' },
  { name: 'Augusten Nezat', email: 'augustennezat@gmail.com', passcode: 'SOULLAB-AUGUSTEN' },
  { name: 'Cece Campbell', email: 'cececampbell1@gmail.com', passcode: 'SOULLAB-CECE' },
  { name: 'Cynthy Ruder', email: 'Dancyn3@aol.com', passcode: 'SOULLAB-CYNTHY' },
  { name: 'Doug Foreman', email: 'dougaforeman@gmail.com', passcode: 'SOULLAB-DOUG' },
  { name: 'Jason Ruder', email: 'JHRuder@gmail.com', passcode: 'SOULLAB-JASON' },
  { name: 'Julie Mountcastle', email: 'jmountcastle@slateschool.org', passcode: 'SOULLAB-JULIE' },
  { name: 'Justin Boucher', email: 'justin.boucher@gmail.com', passcode: 'SOULLAB-JUSTIN' },
  { name: 'Kimberly Daugherty', email: 'dakotamundi@gmail.com', passcode: 'SOULLAB-KIMBERLY' },
  { name: 'Kristen Nezat', email: 'Inhomesanctuary@gmail.com', passcode: 'SOULLAB-KRISTEN' },
  { name: 'Leonard Ruder', email: 'Lruderlcsw@aol.com', passcode: 'SOULLAB-LEONARD' },
  { name: 'Loralee Geil', email: 'loraleegeil@gmail.com', passcode: 'SOULLAB-LORALEE' },
  { name: "Meagan d'Aquin", email: 'mdaquin@gmail.com', passcode: 'SOULLAB-MEAGAN' },
  { name: 'Nathan Kane', email: 'Nathan.Kane@thermofisher.com', passcode: 'SOULLAB-NATHAN' },
  { name: 'Nina Ruder', email: 'Ninaruder11@gmail.com', passcode: 'SOULLAB-NINA' },
  { name: 'Patrick Koehn', email: 'plkoehn@gmail.com', passcode: 'SOULLAB-PATRICK' },
  { name: 'Rick Tessier', email: 'richardcteissier27@icloud.com', passcode: 'SOULLAB-RICK' },
  { name: 'Sophie Nezat', email: 'snezat27@sacredhearthamden.org', passcode: 'SOULLAB-SOPHIE' },
  { name: 'Susan Bragg', email: 'phoenixrises123@gmail.com', passcode: 'SOULLAB-SUSAN' },
  { name: 'Tamara Moore', email: 'tamaramoorecolorado@gmail.com', passcode: 'SOULLAB-TAMARA' },
  { name: 'Travis Diamond', email: 'tcdiamond70@gmail.com', passcode: 'SOULLAB-TRAVIS' },
  { name: 'Zsuzsanna Ferenczi', email: 'zsuzsanna.ferenczi@icloud.com', passcode: 'SOULLAB-ZSUZSANNA' },
];

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Query actual registered users from database
    const { data: registeredUsers, error } = await supabase
      .from('beta_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist yet
      console.error('Supabase query error:', error);
    }

    // Combine with beta testers list
    const users = BETA_TESTERS.map(tester => {
      const registered = registeredUsers?.find(u =>
        u.email?.toLowerCase() === tester.email.toLowerCase() ||
        u.passcode === tester.passcode
      );

      return {
        id: registered?.id || `pending_${tester.passcode}`,
        name: tester.name,
        email: tester.email,
        passcode: tester.passcode,
        status: registered ? (registered.last_active &&
          new Date(registered.last_active) > new Date(Date.now() - 5 * 60 * 1000)
            ? 'online'
            : registered.last_active && new Date(registered.last_active) > new Date(Date.now() - 30 * 60 * 1000)
            ? 'idle'
            : 'offline'
        ) : 'not_registered',
        registered: !!registered,
        sessions: registered?.session_count || 0,
        engagement: registered?.engagement_score || 0,
        trustScore: registered?.trust_score || 0,
        lastActive: registered?.last_active || null,
        createdAt: registered?.created_at || null
      };
    });

    // Calculate summary stats
    const activeUsers = users.filter(u => u.status === 'online').length;
    const registeredUsers_count = users.filter(u => u.registered).length;
    const avgEngagement = users.filter(u => u.registered).length > 0
      ? Math.round(users.filter(u => u.registered).reduce((sum, u) => sum + u.engagement, 0) /
          users.filter(u => u.registered).length * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        users,
        summary: {
          total: BETA_TESTERS.length,
          registered: registeredUsers_count,
          active: activeUsers,
          avgEngagement
        }
      }
    });

  } catch (error) {
    console.error('Failed to fetch beta users:', error);

    // Fallback: Return beta testers list without activity data
    return NextResponse.json({
      success: true,
      data: {
        users: BETA_TESTERS.map((tester, idx) => ({
          id: `pending_${tester.passcode}`,
          name: tester.name,
          email: tester.email,
          passcode: tester.passcode,
          status: 'not_registered',
          registered: false,
          sessions: 0,
          engagement: 0,
          trustScore: 0,
          lastActive: null,
          createdAt: null
        })),
        summary: {
          total: BETA_TESTERS.length,
          registered: 0,
          active: 0,
          avgEngagement: 0
        },
        note: 'Showing beta testers list - no registrations yet'
      }
    });
  }
}