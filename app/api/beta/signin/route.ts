import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, explorerName } = body;

    console.log('Beta signin for:', explorerName);

    // Try to use Supabase if available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Look up explorer in database
        const { data: explorer, error } = await supabase
          .from('explorers')
          .select('*')
          .eq('explorer_name', explorerName)
          .eq('email', email)
          .single();

        if (!error && explorer) {
          // Look up beta user
          const { data: betaUser } = await supabase
            .from('beta_users')
            .select('*')
            .eq('email', email)
            .single();

          // Return successful signin from database
          return NextResponse.json({
            success: true,
            userId: betaUser?.id || explorer.explorer_id,
            explorerId: explorer.explorer_id,
            explorerName: explorer.explorer_name,
            mayaInstance: betaUser?.maya_instance || uuidv4(),
            sessionId: uuidv4(),
            sanctuary: 'established',
            signupDate: explorer.signup_date
          });
        }
      } catch (dbError) {
        console.log('Database lookup failed, using mock signin:', dbError);
      }
    }

    // Fallback: Mock signin for beta testing
    // This allows signin to work even without database
    const validExplorers = [
      'MAIA-ARCHITECT',
      'MAIA-APPRENTICE',
      'MAIA-ALCHEMIST',
      'MAIA-NAVIGATOR',
      'MAIA-SEEKER',
      'MAIA-WITNESS',
      'MAIA-DREAMER',
      'MAIA-CATALYST',
      'MAIA-ORACLE',
      'MAIA-GUARDIAN',
      'MAIA-EXPLORER',
      'MAIA-WEAVER',
      'MAIA-MYSTIC',
      'MAIA-BUILDER',
      'MAIA-SAGE',
      'MAIA-VOYAGER',
      'MAIA-KEEPER',
      'MAIA-LISTENER',
      'MAIA-PIONEER',
      'MAIA-WANDERER',
      'MAIA-ILLUMINATOR'
    ];

    if (!validExplorers.includes(explorerName)) {
      return NextResponse.json(
        { error: 'Invalid explorer name. Please check your credentials.' },
        { status: 404 }
      );
    }

    // Return mock successful signin
    return NextResponse.json({
      success: true,
      userId: uuidv4(),
      explorerId: uuidv4(),
      explorerName: explorerName,
      mayaInstance: uuidv4(),
      sessionId: uuidv4(),
      sanctuary: 'established',
      signupDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}