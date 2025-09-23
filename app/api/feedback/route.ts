import { NextRequest, NextResponse } from 'next/server';

interface FeedbackData {
  question: string;
  answer: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const feedback = await request.json() as FeedbackData;

    // Log beta feedback for analysis
    console.log('Beta Feedback:', {
      timestamp: feedback.timestamp,
      question: feedback.question,
      answer: feedback.answer
    });

    // In production, save to database
    // For beta, just acknowledge receipt

    return NextResponse.json({
      success: true,
      message: 'Feedback received. Thank you for helping shape the oracle!'
    });
  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save feedback'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Return feedback summary for beta monitoring
  return NextResponse.json({
    status: 'Beta Feedback Active',
    metrics: {
      resonance_rate: 'tracking',
      ease_of_use: 'tracking',
      daily_intent: 'tracking'
    }
  });
}
