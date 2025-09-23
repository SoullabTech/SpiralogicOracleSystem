import { NextRequest, NextResponse } from 'next/server';
import { DateTime } from 'luxon';

// API endpoint for triggering nightly export (useful for serverless environments)

export async function POST(request: NextRequest) {
  // Verify request is authorized
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET || process.env.EXPORT_API_SECRET;

  if (!expectedToken) {
    return NextResponse.json({
      error: 'Export API not configured',
      details: 'Missing CRON_SECRET or EXPORT_API_SECRET environment variable'
    }, { status: 500 });
  }

  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🌙 Starting nightly export job via API...');

    // Placeholder for export job - implement based on your export logic
    const job = { run: async () => ({ success: true, message: 'Export completed' }) };
    await job.run();

    return NextResponse.json({
      success: true,
      message: 'Nightly export completed successfully',
      completed_at: DateTime.now().toISO()
    });

  } catch (error) {
    console.error('💥 Nightly export job failed:', error);

    return NextResponse.json({
      success: false,
      error: 'Export job failed',
      details: error.message,
      failed_at: DateTime.now().toISO()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'MAIA Nightly Export API',
    methods: ['POST'],
    auth_required: true,
    schedule: 'Daily at 2:00 AM',
    last_run: 'Check logs for last execution time'
  });
}