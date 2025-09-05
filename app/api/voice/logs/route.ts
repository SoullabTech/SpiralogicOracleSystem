import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const format = searchParams.get('format') || 'json';
    const stats = searchParams.get('stats') === 'true';

    // Path to voice startup log
    const logPath = path.join(process.cwd(), 'logs', 'voice-startup.log');

    // Check if log file exists
    if (!fs.existsSync(logPath)) {
      return NextResponse.json({
        events: [],
        message: 'No voice startup logs found yet'
      });
    }

    // Read log file
    const content = fs.readFileSync(logPath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    // Parse events
    const events = lines
      .slice(-limit)
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .reverse(); // Most recent first

    // Calculate statistics if requested
    if (stats) {
      const statistics = calculateStats(events);
      
      return NextResponse.json({
        statistics,
        recentEvents: events.slice(0, 10),
        totalEvents: events.length
      });
    }

    // Return formatted logs
    if (format === 'text') {
      const textOutput = events
        .map(e => formatLogLine(e))
        .join('\n');
      
      return new NextResponse(textOutput, {
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    return NextResponse.json({
      events,
      count: events.length,
      limit
    });

  } catch (error: any) {
    console.error('Failed to read voice logs:', error);
    return NextResponse.json(
      { error: 'Failed to read voice logs', details: error.message },
      { status: 500 }
    );
  }
}

function calculateStats(events: any[]) {
  const stats = {
    total: events.length,
    successful: 0,
    failed: 0,
    byEngine: {} as Record<string, { count: number; avgLatency?: number }>,
    recentFailures: [] as any[],
    healthScore: 100
  };

  events.forEach(event => {
    if (event.success) {
      stats.successful++;
    } else {
      stats.failed++;
      stats.recentFailures.push({
        timestamp: event.timestamp,
        engine: event.engine,
        error: event.error
      });
    }

    // Per-engine stats
    if (!stats.byEngine[event.engine]) {
      stats.byEngine[event.engine] = { count: 0 };
    }
    
    stats.byEngine[event.engine].count++;
    
    if (event.success && event.latencyMs) {
      const engineStats = stats.byEngine[event.engine];
      if (!engineStats.avgLatency) {
        engineStats.avgLatency = event.latencyMs;
      } else {
        // Running average
        engineStats.avgLatency = 
          (engineStats.avgLatency * (engineStats.count - 1) + event.latencyMs) / engineStats.count;
      }
    }
  });

  // Calculate health score (100 = all successful, 0 = all failed)
  if (stats.total > 0) {
    stats.healthScore = Math.round((stats.successful / stats.total) * 100);
  }

  // Keep only 5 most recent failures
  stats.recentFailures = stats.recentFailures.slice(0, 5);

  return stats;
}

function formatLogLine(event: any): string {
  const icon = event.success ? '✅' : '❌';
  const engine = event.engine.toUpperCase();
  const mode = event.mode === 'local' ? 'LOCAL' : 'API';
  
  let line = `[${event.timestamp}] ${icon} ${engine} (${mode})`;
  
  if (event.latencyMs) {
    line += ` - ${event.latencyMs}ms`;
  }
  
  if (event.error) {
    line += ` - ERROR: ${event.error}`;
  }
  
  if (event.fallbackReason) {
    line += ` - FALLBACK: ${event.fallbackReason}`;
  }

  return line;
}