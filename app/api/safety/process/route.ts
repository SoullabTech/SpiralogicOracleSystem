import { NextRequest, NextResponse } from 'next/server';
import { SafetyPipeline } from '../../../../lib/safety/SafetyPipeline';

const safetyPipeline = new SafetyPipeline(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  // Optional therapist API configuration
  process.env.THERAPIST_API_ENABLED === 'true' ? {
    baseUrl: process.env.THERAPIST_API_URL!,
    apiKey: process.env.THERAPIST_API_KEY!,
    enabled: true
  } : undefined
);

// Process messages through safety pipeline
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, message, messageId } = body;

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'User ID and message are required' },
        { status: 400 }
      );
    }

    // Process message through safety pipeline
    const result = await safetyPipeline.processMessage(userId, message);

    // Log additional context if provided
    if (messageId) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      await supabase
        .from('user_safety')
        .update({
          metadata: {
            message_id: messageId,
            processed_at: new Date().toISOString()
          }
        })
        .eq('user_id', userId)
        .eq('message', message)
        .order('ts', { ascending: false })
        .limit(1);
    }

    // Return safety processing result
    return NextResponse.json({
      action: result.action,
      message: result.message,
      riskLevel: result.riskData?.riskLevel,
      confidence: result.riskData?.confidence,
      recommendedAction: result.riskData?.recommendedAction,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Safety processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process message through safety pipeline' },
      { status: 500 }
    );
  }
}

// Record assessment responses
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, answer, questionId } = body;

    if (!userId || answer === undefined) {
      return NextResponse.json(
        { error: 'User ID and answer are required' },
        { status: 400 }
      );
    }

    // Record the assessment response
    await safetyPipeline.recordAssessment(userId, answer);

    return NextResponse.json({
      success: true,
      recorded: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Assessment recording error:', error);
    return NextResponse.json(
      { error: 'Failed to record assessment response' },
      { status: 500 }
    );
  }
}

// Get safety status for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '7');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get recent safety logs
    const { data: safetyLogs } = await supabase
      .from('user_safety')
      .select('*')
      .eq('user_id', userId)
      .gte('ts', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('ts', { ascending: false });

    // Get recent assessments
    const { data: assessments } = await supabase
      .from('user_assessments')
      .select('*')
      .eq('user_id', userId)
      .not('score', 'is', null)
      .gte('ts', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('ts', { ascending: false });

    // Get escalations
    const { data: escalations } = await supabase
      .from('escalations')
      .select('*')
      .eq('user_id', userId)
      .gte('ts', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('ts', { ascending: false });

    // Calculate safety summary
    const riskLevels = (safetyLogs || []).map(log => log.risk_level);
    const highRiskCount = riskLevels.filter(level => level === 'high').length;
    const moderateRiskCount = riskLevels.filter(level => level === 'moderate').length;

    const currentStatus = highRiskCount > 0 ? 'high_risk' :
                         moderateRiskCount > 2 ? 'monitoring' :
                         'stable';

    return NextResponse.json({
      status: currentStatus,
      safetyLogs: safetyLogs || [],
      assessments: assessments || [],
      escalations: escalations || [],
      summary: {
        totalMessages: riskLevels.length,
        highRiskCount,
        moderateRiskCount,
        activeEscalations: (escalations || []).filter(e => e.status !== 'resolved').length,
        lastAssessment: assessments?.[0] || null
      },
      timeRange: days
    });

  } catch (error) {
    console.error('Safety status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch safety status' },
      { status: 500 }
    );
  }
}