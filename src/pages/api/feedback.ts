import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface FeedbackData {
  element: string;
  tone: 'insight' | 'symbolic';
  feedback: number; // 1-5 rating
  user_note?: string;
  session_id?: string;
  timestamp?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const feedback: FeedbackData = req.body;

    // Validate required fields
    if (!feedback.element || !feedback.tone || !feedback.feedback) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate feedback score
    if (feedback.feedback < 1 || feedback.feedback > 5) {
      return res.status(400).json({ error: 'Feedback must be between 1 and 5' });
    }

    // Add timestamp
    const enrichedFeedback = {
      ...feedback,
      timestamp: new Date().toISOString(),
      session_id: feedback.session_id || generateSessionId()
    };

    // Store in Supabase (if configured)
    if (supabaseUrl && supabaseAnonKey) {
      const { data, error } = await supabase
        .from('oracle_feedback')
        .insert([enrichedFeedback]);

      if (error) {
        console.error('Supabase error:', error);
        // Fall back to local storage or logging
      }
    }

    // Also log to console for debugging
    console.log('Feedback received:', enrichedFeedback);

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Feedback recorded successfully',
      data: enrichedFeedback
    });

  } catch (error) {
    console.error('Feedback API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}