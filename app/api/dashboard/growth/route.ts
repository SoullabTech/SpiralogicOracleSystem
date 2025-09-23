import { NextRequest, NextResponse } from 'next/server';
import { SafetyPipeline } from '../../../../lib/safety/SafetyPipeline';

const safetyPipeline = new SafetyPipeline(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const timeRange = searchParams.get('timeRange') || '30';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const days = parseInt(timeRange);

    // Fetch all dashboard data in parallel
    const [
      emotionalWeather,
      breakthroughs,
      coherenceScore,
      escalations,
      assessmentTrends
    ] = await Promise.all([
      safetyPipeline.getEmotionalWeather(userId, days),
      safetyPipeline.getBreakthroughTimeline(userId, Math.min(days * 3, 90)), // Longer timeline for breakthroughs
      safetyPipeline.getCoherenceScore(userId, days),
      getEscalationHistory(userId, days),
      getAssessmentTrends(userId, days)
    ]);

    const dashboardData = {
      mood: transformEmotionalWeatherToMood(emotionalWeather),
      coherenceScore: Math.round(coherenceScore * 100),
      breakthroughs: transformBreakthroughs(breakthroughs),
      escalations: escalations,
      assessmentTrends,
      emotionalWeather: transformEmotionalWeather(emotionalWeather),
      metadata: {
        timeRange: days,
        lastUpdated: new Date().toISOString(),
        dataPoints: {
          moodEntries: emotionalWeather.length,
          breakthroughCount: breakthroughs.length,
          escalationCount: escalations.length
        }
      }
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

// Helper function to get escalation history
async function getEscalationHistory(userId: string, days: number) {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase
    .from('escalations')
    .select('*')
    .eq('user_id', userId)
    .gte('ts', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order('ts', { ascending: false });

  return (data || []).map(escalation => ({
    date: new Date(escalation.ts).toLocaleDateString(),
    reason: escalation.reason,
    status: escalation.status,
    resolved: escalation.status === 'resolved'
  }));
}

// Helper function to get assessment trends
async function getAssessmentTrends(userId: string, days: number) {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase
    .from('user_assessments')
    .select('*')
    .eq('user_id', userId)
    .not('score', 'is', null)
    .gte('ts', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order('ts', { ascending: true });

  if (!data || data.length === 0) return [];

  // Group by assessment type and calculate trends
  const trends: { [key: string]: any[] } = {};

  data.forEach(assessment => {
    if (!trends[assessment.assessment_type]) {
      trends[assessment.assessment_type] = [];
    }
    trends[assessment.assessment_type].push({
      date: new Date(assessment.ts).toLocaleDateString(),
      score: assessment.score,
      totalScore: assessment.total_score,
      interpretation: assessment.interpretation
    });
  });

  return Object.entries(trends).map(([type, scores]) => ({
    assessmentType: type,
    scores,
    currentScore: scores[scores.length - 1]?.score || 0,
    trend: calculateTrend(scores.map(s => s.score))
  }));
}

// Transform emotional weather data for mood timeline
function transformEmotionalWeatherToMood(emotionalWeather: any[]) {
  return emotionalWeather.map(day => ({
    date: day.date,
    score: day.sentiment_score || 0 // Use sentiment as primary mood indicator
  }));
}

// Transform emotional weather for elemental visualization
function transformEmotionalWeather(emotionalWeather: any[]) {
  return emotionalWeather.map(day => ({
    date: day.date,
    fire: day.fire_score || 0,
    water: day.water_score || 0,
    earth: day.earth_score || 0,
    air: day.air_score || 0,
    balance: day.balance_score || 0
  }));
}

// Transform breakthrough data
function transformBreakthroughs(breakthroughs: any[]) {
  return breakthroughs.map(breakthrough => ({
    date: new Date(breakthrough.breakthrough_date).toLocaleDateString(),
    description: breakthrough.description,
    intensity: breakthrough.intensity,
    context: breakthrough.context
  }));
}

// Calculate trend direction
function calculateTrend(scores: number[]): 'improving' | 'stable' | 'declining' {
  if (scores.length < 2) return 'stable';

  const recent = scores.slice(-3); // Last 3 scores
  const older = scores.slice(-6, -3); // Previous 3 scores

  if (recent.length === 0 || older.length === 0) return 'stable';

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

  const difference = recentAvg - olderAvg;

  if (difference > 0.5) return 'improving';
  if (difference < -0.5) return 'declining';
  return 'stable';
}

// POST endpoint for recording growth events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, eventType, data } = body;

    if (!userId || !eventType) {
      return NextResponse.json(
        { error: 'User ID and event type are required' },
        { status: 400 }
      );
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let result;

    switch (eventType) {
      case 'breakthrough_moment':
        result = await supabase
          .from('breakthrough_moments')
          .insert({
            user_id: userId,
            description: data.description,
            intensity: data.intensity || 0.5,
            context: data.context,
            themes: data.themes || [],
            metadata: data.metadata || {}
          });
        break;

      case 'emotional_pattern':
        result = await supabase
          .from('emotional_patterns')
          .insert({
            user_id: userId,
            dominant_emotion: data.dominantEmotion,
            fire_score: data.fireScore || 0,
            water_score: data.waterScore || 0,
            earth_score: data.earthScore || 0,
            air_score: data.airScore || 0,
            balance_score: data.balanceScore || 0,
            sentiment_score: data.sentimentScore || 0,
            metadata: data.metadata || {}
          });
        break;

      case 'growth_metric':
        result = await supabase
          .from('growth_metrics')
          .insert({
            user_id: userId,
            metric_type: data.metricType,
            value: data.value,
            context: data.context,
            source: data.source || 'manual_entry',
            metadata: data.metadata || {}
          });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid event type' },
          { status: 400 }
        );
    }

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json({ success: true, data: result.data });

  } catch (error) {
    console.error('Dashboard POST error:', error);
    return NextResponse.json(
      { error: 'Failed to record growth event' },
      { status: 500 }
    );
  }
}