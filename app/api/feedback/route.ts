/**
 * Beta Feedback Collection API
 * Gathering sacred insights from beta testers
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';

// In production, store in database - this is for beta collection
let feedbackStore: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const cookieStore = cookies();
    const betaAccess = cookieStore.get('beta_access');

    // Check beta access
    if (!betaAccess) {
      return NextResponse.json(
        { error: 'Beta access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      type, 
      feedback: feedbackText, 
      timestamp, 
      page,
      category,
      rating,
      resonance,
      insight,
      suggestions,
      emotionalShift,
      wouldRecommend
    } = body;

    // Basic validation
    if (!feedbackText && !rating) {
      return NextResponse.json(
        { error: 'Feedback content or rating required' },
        { status: 400 }
      );
    }

    const feedbackEntry = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: session?.user?.id || 'anonymous',
      betaCode: betaAccess.value,
      type: type || 'general',
      feedbackText,
      page,
      timestamp: timestamp || new Date().toISOString(),
      metadata: {
        category,
        rating,
        resonance,
        insight,
        suggestions,
        emotionalShift,
        wouldRecommend,
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer')
      }
    };

    // Store feedback (in production, save to database)
    feedbackStore.push(feedbackEntry);

    // Log feedback for immediate visibility
    console.log('Beta Feedback Received:', {
      id: feedbackEntry.id,
      type: feedbackEntry.type,
      userId: feedbackEntry.userId,
      page: feedbackEntry.page,
      rating: rating || 'N/A',
      timestamp: feedbackEntry.timestamp
    });

    // Log detailed feedback if it's a full survey
    if (category && rating) {
      console.log('Detailed Beta Survey:', {
        category,
        rating,
        resonance: resonance?.substring(0, 100) + (resonance?.length > 100 ? '...' : ''),
        wouldRecommend
      });
    }

    // In production, you might want to:
    // - Send to analytics service
    // - Trigger notifications for urgent feedback
    // - Update user's beta status
    // - Send thank you email

    return NextResponse.json({
      success: true,
      message: 'Thank you for your sacred feedback',
      feedbackId: feedbackEntry.id
    });

  } catch (error) {
    console.error('Feedback collection error:', error);
    return NextResponse.json(
      { error: 'Failed to collect feedback' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/feedback
 * Retrieve beta feedback analytics (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const cookieStore = cookies();
    const betaAccess = cookieStore.get('beta_access');

    // Check if user has founder/admin access
    if (!betaAccess || !betaAccess.value.includes('ALPHA')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const view = searchParams.get('view') || 'summary';

    switch (view) {
      case 'summary':
        // Generate feedback summary
        const totalFeedback = feedbackStore.length;
        const ratingsData = feedbackStore
          .filter(f => f.metadata.rating)
          .map(f => f.metadata.rating);
        
        const averageRating = ratingsData.length > 0 
          ? ratingsData.reduce((a, b) => a + b, 0) / ratingsData.length 
          : 0;

        const typeBreakdown = feedbackStore.reduce((acc, f) => {
          acc[f.type] = (acc[f.type] || 0) + 1;
          return acc;
        }, {});

        const categoryBreakdown = feedbackStore
          .filter(f => f.metadata.category)
          .reduce((acc, f) => {
            acc[f.metadata.category] = (acc[f.metadata.category] || 0) + 1;
            return acc;
          }, {});

        const wouldRecommend = feedbackStore
          .filter(f => f.metadata.wouldRecommend !== undefined)
          .map(f => f.metadata.wouldRecommend);
        
        const recommendationRate = wouldRecommend.length > 0
          ? wouldRecommend.filter(Boolean).length / wouldRecommend.length
          : 0;

        return NextResponse.json({
          summary: {
            totalFeedback,
            averageRating: Math.round(averageRating * 10) / 10,
            recommendationRate: Math.round(recommendationRate * 100),
            typeBreakdown,
            categoryBreakdown,
            lastUpdated: new Date().toISOString()
          }
        });

      case 'recent':
        // Get recent feedback
        const recentFeedback = feedbackStore
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 20)
          .map(f => ({
            id: f.id,
            type: f.type,
            timestamp: f.timestamp,
            page: f.page,
            rating: f.metadata.rating,
            category: f.metadata.category,
            feedbackPreview: f.feedbackText?.substring(0, 100) + (f.feedbackText?.length > 100 ? '...' : ''),
            wouldRecommend: f.metadata.wouldRecommend
          }));

        return NextResponse.json({ recentFeedback });

      case 'insights':
        // Extract key insights
        const highRatedFeedback = feedbackStore
          .filter(f => f.metadata.rating >= 4)
          .map(f => f.metadata.resonance || f.feedbackText)
          .filter(Boolean);

        const lowRatedFeedback = feedbackStore
          .filter(f => f.metadata.rating <= 2)
          .map(f => f.metadata.suggestions || f.feedbackText)
          .filter(Boolean);

        const keyInsights = feedbackStore
          .map(f => f.metadata.insight)
          .filter(Boolean)
          .slice(0, 10);

        return NextResponse.json({
          insights: {
            positiveResonance: highRatedFeedback.slice(0, 10),
            improvementAreas: lowRatedFeedback.slice(0, 10),
            keyInsights
          }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid view parameter' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Feedback analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve feedback analytics' },
      { status: 500 }
    );
  }
}