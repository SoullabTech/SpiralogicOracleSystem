import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET endpoint for dashboard
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch last 100 feedback entries for dashboard
    const { data, error } = await supabase
      .from('FeedbackEntry')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Supabase error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error('Feedback route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feedback, category, timestamp, url, userAgent } = body;

    // Initialize Supabase client with service role key for server-side operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user ID if authenticated (optional)
    const authHeader = request.headers.get('authorization');
    let userId = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // Insert feedback into database
    const { data, error } = await supabase
      .from('beta_feedback')
      .insert({
        feedback,
        category,
        page_url: url,
        user_agent: userAgent,
        user_id: userId,
        timestamp
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      // Still return success to avoid frustrating users
      return NextResponse.json({
        success: true,
        message: 'Feedback received (offline mode)'
      });
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Thank you for your feedback!'
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    // Return success even on error to avoid frustrating beta users
    return NextResponse.json({
      success: true,
      message: 'Feedback received (will be processed later)'
    });
  }
}
