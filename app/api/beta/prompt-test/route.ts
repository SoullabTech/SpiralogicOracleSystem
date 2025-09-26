/**
 * API Route for Prompt Test Results
 * GET /api/beta/prompt-test - View test results
 */

import { NextResponse } from 'next/server';
import { promptTestTracker } from '@/lib/beta/PromptTestTracking';

export async function GET() {
  try {
    const comparison = promptTestTracker.getComparison();

    return NextResponse.json({
      success: true,
      comparison,
      exportData: promptTestTracker.exportData()
    });
  } catch (error) {
    console.error('Failed to get prompt test results:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve test results' },
      { status: 500 }
    );
  }
}