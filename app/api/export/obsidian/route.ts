import { NextRequest, NextResponse } from 'next/server';
import { ObsidianExporter } from '@/lib/export/obsidian-exporter';
import { DateTime } from 'luxon';

// API endpoints for Obsidian vault integration

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    const exporter = new ObsidianExporter(
      process.env.OBSIDIAN_VAULT_PATH || './obsidian-vault'
    );

    switch (action) {
      case 'export_session':
        return await exportSingleSession(exporter, body.session_data);

      case 'batch_export':
        return await batchExportSessions(exporter, body.sessions);

      case 'sync_recent':
        return await syncRecentSessions(exporter, body.since_date);

      case 'initialize_vault':
        return await initializeVault(exporter);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Obsidian export error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'vault_status':
        return await getVaultStatus();

      case 'export_history':
        return await getExportHistory();

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Obsidian export GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export a single session
async function exportSingleSession(exporter: ObsidianExporter, sessionData: any) {
  try {
    const result = await exporter.exportSession(sessionData);

    return NextResponse.json({
      success: true,
      message: 'Session exported successfully',
      files: {
        markdown: result.mdPath,
        canvas: result.canvasPath
      },
      exported_at: DateTime.now().toISO()
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Batch export multiple sessions
async function batchExportSessions(exporter: ObsidianExporter, sessions: any[]) {
  try {
    const result = await exporter.batchExportSessions(sessions);

    return NextResponse.json({
      success: true,
      message: `Batch export completed`,
      stats: {
        total_sessions: sessions.length,
        successful_exports: result.success,
        failed_exports: result.failed
      },
      exported_at: DateTime.now().toISO()
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Sync recent sessions from database
async function syncRecentSessions(exporter: ObsidianExporter, sinceDate?: string) {
  try {
    // This would query your Supabase database for recent sessions
    const since = sinceDate ? DateTime.fromISO(sinceDate) : DateTime.now().minus({ days: 1 });

    // Mock query - replace with actual Supabase call
    const recentSessions = await fetchRecentSessionsFromDB(since);

    if (recentSessions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new sessions to export',
        stats: { total_sessions: 0, exported: 0 }
      });
    }

    const result = await exporter.batchExportSessions(recentSessions);

    return NextResponse.json({
      success: true,
      message: `Synced ${result.success} sessions since ${since.toFormat('MMM dd, yyyy')}`,
      stats: {
        total_sessions: recentSessions.length,
        successful_exports: result.success,
        failed_exports: result.failed,
        sync_period: since.toISO()
      },
      exported_at: DateTime.now().toISO()
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Initialize vault structure
async function initializeVault(exporter: ObsidianExporter) {
  try {
    await exporter.initialize();

    return NextResponse.json({
      success: true,
      message: 'Obsidian vault initialized successfully',
      structure: {
        sessions_folder: 'Sessions/',
        canvas_folder: 'Canvas/',
        index_folder: 'Index/',
        vault_path: process.env.OBSIDIAN_VAULT_PATH || './obsidian-vault'
      },
      initialized_at: DateTime.now().toISO()
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get vault status and statistics
async function getVaultStatus() {
  try {
    const fs = require('fs/promises');
    const path = require('path');

    const vaultPath = process.env.OBSIDIAN_VAULT_PATH || './obsidian-vault';
    const sessionsPath = path.join(vaultPath, 'Sessions');
    const canvasPath = path.join(vaultPath, 'Canvas');

    let sessionCount = 0;
    let canvasCount = 0;
    let vaultExists = false;

    try {
      await fs.access(vaultPath);
      vaultExists = true;

      const sessionFiles = await fs.readdir(sessionsPath);
      sessionCount = sessionFiles.filter(f => f.endsWith('.md')).length;

      const canvasFiles = await fs.readdir(canvasPath);
      canvasCount = canvasFiles.filter(f => f.endsWith('.canvas')).length;
    } catch (error) {
      // Vault doesn't exist yet
    }

    return NextResponse.json({
      vault_exists: vaultExists,
      vault_path: vaultPath,
      statistics: {
        total_sessions: sessionCount,
        total_canvas_files: canvasCount,
        last_checked: DateTime.now().toISO()
      },
      status: vaultExists ? 'operational' : 'not_initialized'
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Get export history and analytics
async function getExportHistory() {
  try {
    // This would query your database for export logs
    // For now, return mock data

    const exportHistory = [
      {
        export_id: 'exp_001',
        exported_at: DateTime.now().minus({ hours: 2 }).toISO(),
        type: 'single_session',
        session_count: 1,
        status: 'success'
      },
      {
        export_id: 'exp_002',
        exported_at: DateTime.now().minus({ hours: 24 }).toISO(),
        type: 'batch_sync',
        session_count: 15,
        status: 'success'
      },
      {
        export_id: 'exp_003',
        exported_at: DateTime.now().minus({ days: 2 }).toISO(),
        type: 'vault_init',
        session_count: 0,
        status: 'success'
      }
    ];

    return NextResponse.json({
      export_history: exportHistory,
      statistics: {
        total_exports: exportHistory.length,
        successful_exports: exportHistory.filter(e => e.status === 'success').length,
        total_sessions_exported: exportHistory.reduce((sum, e) => sum + e.session_count, 0),
        last_export: exportHistory[0]?.exported_at
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Helper function to fetch sessions from database
async function fetchRecentSessionsFromDB(since: DateTime): Promise<any[]> {
  // This would connect to your Supabase database
  // For now, return mock data

  return [
    {
      id: 'session_123',
      user_id: 'user_456',
      therapist_id: 'therapist_789',
      timestamp: DateTime.now().minus({ hours: 1 }).toISO(),
      risk_level: 'moderate',
      status: 'resolved',
      safety_events: [
        {
          timestamp: DateTime.now().minus({ hours: 1 }).toISO(),
          type: 'detection',
          description: 'Moderate risk indicators detected in conversation',
          risk_level: 'moderate',
          action_taken: 'Gentle check-in initiated',
          therapist_involved: false
        }
      ],
      growth_metrics: {
        emotional_weather: {
          fire: 0.6,
          water: 0.8,
          earth: 0.7,
          air: 0.5
        },
        wellness_scores: {
          phq2: 2,
          gad2: 1,
          session_mood: 7
        },
        mindfulness_minutes: 12,
        session_quality: 8.2
      },
      breakthroughs: [
        {
          timestamp: DateTime.now().minus({ minutes: 45 }).toISO(),
          type: 'insight',
          summary: 'User recognized pattern in their anxiety triggers',
          intensity: 0.7,
          archetypal_resonance: 'The Sage - Wisdom through self-reflection'
        }
      ],
      coherence: {
        current: 0.75,
        trend: 'increasing',
        hrv_score: 68
      },
      themes: ['anxiety-management', 'self-awareness', 'breathing-techniques'],
      synchronicities: [
        'User mentioned butterfly symbolism, which appeared in previous session dreams'
      ],
      therapist_notes: 'Strong progress in recognizing anxiety patterns. Continue with breathing exercises.',
      conversation_context: {
        message_count: 23,
        session_duration_minutes: 35,
        emotional_signature: 'contemplative-hopeful'
      }
    }
  ];
}