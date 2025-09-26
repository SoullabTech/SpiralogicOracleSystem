/**
 * MAIA Soulprint Sync API
 * Manual sync and backfill endpoints for Obsidian integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { soulprintSyncManager } from '@/lib/soulprint/syncManager';
import { soulprintTracker } from '@/lib/beta/SoulprintTracking';

export const dynamic = 'force-dynamic';

/**
 * POST /api/maia/soulprint/sync
 * Manually trigger sync for a user or all users
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action = 'sync', force = false } = body;

    console.log(`🔄 Manual sync requested: ${action}`, { userId, force });

    let result: any;

    switch (action) {
      case 'sync':
        // Sync single user
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'userId required for sync action' },
            { status: 400 }
          );
        }

        result = await soulprintSyncManager.syncAll(userId, { force });

        return NextResponse.json({
          success: result.success,
          userId,
          filesWritten: result.filesWritten.length,
          errors: result.errors,
          timestamp: result.timestamp
        });

      case 'sync-incremental':
        // Incremental sync for single user
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'userId required for incremental sync' },
            { status: 400 }
          );
        }

        result = await soulprintSyncManager.syncIncremental(userId);

        return NextResponse.json({
          success: result.success,
          userId,
          filesWritten: result.filesWritten.length,
          errors: result.errors,
          timestamp: result.timestamp
        });

      case 'backfill':
        // Backfill single user
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'userId required for backfill' },
            { status: 400 }
          );
        }

        result = await soulprintSyncManager.backfillUser(userId);

        return NextResponse.json({
          success: result.success,
          userId,
          filesWritten: result.filesWritten.length,
          errors: result.errors,
          timestamp: result.timestamp
        });

      case 'backfill-all':
        // Backfill ALL users (use with caution)
        console.log('⚠️ Backfilling ALL users - this may take time');

        const allResults = await soulprintSyncManager.backfillAll();

        const summary = {
          totalUsers: allResults.size,
          successful: 0,
          failed: 0,
          totalFiles: 0,
          errors: [] as any[]
        };

        allResults.forEach((result, userId) => {
          if (result.success) {
            summary.successful++;
            summary.totalFiles += result.filesWritten.length;
          } else {
            summary.failed++;
            summary.errors.push({ userId, errors: result.errors });
          }
        });

        return NextResponse.json({
          success: true,
          action: 'backfill-all',
          summary,
          timestamp: new Date()
        });

      case 'sync-dashboard':
        // Sync field dashboard
        const dashboardPath = await soulprintSyncManager.syncFieldDashboard();

        return NextResponse.json({
          success: true,
          action: 'sync-dashboard',
          filePath: dashboardPath,
          timestamp: new Date()
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Unknown action: ${action}. Valid actions: sync, sync-incremental, backfill, backfill-all, sync-dashboard`
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Sync API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/maia/soulprint/sync
 * Get sync status for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId parameter required' },
        { status: 400 }
      );
    }

    // Check if soulprint exists
    const soulprint = soulprintTracker.getSoulprint(userId);

    if (!soulprint) {
      return NextResponse.json({
        success: false,
        error: 'Soulprint not found',
        userId
      }, { status: 404 });
    }

    // Get file stats
    const { soulprintFileWriter } = await import('@/lib/soulprint/fileWriter');
    const stats = await soulprintFileWriter.getUserStats(userId);

    return NextResponse.json({
      success: true,
      userId,
      userName: soulprint.userName,
      soulprintExists: !!soulprint,
      fileStats: stats,
      soulprintData: {
        created: soulprint.created,
        lastUpdated: soulprint.lastUpdated,
        currentPhase: soulprint.currentPhase,
        symbolCount: soulprint.activeSymbols.length,
        milestoneCount: soulprint.milestones.length,
        currentArchetype: soulprint.currentArchetype
      }
    });
  } catch (error) {
    console.error('Sync status API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message
      },
      { status: 500 }
    );
  }
}