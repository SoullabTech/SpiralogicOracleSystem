import { NextRequest, NextResponse } from 'next/server';
import { soulprintTracker } from '@/lib/beta/SoulprintTracking';
import { SoulprintMarkdownExporter } from '@/lib/beta/SoulprintMarkdownExporter';
import { logAudit } from '@/lib/security/auditLog';

export async function GET(request: NextRequest) {
  const ipAddress = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const format = request.nextUrl.searchParams.get('format') || 'markdown';

    if (!userId) {
      await logAudit({
        timestamp: new Date(),
        userId: 'unknown',
        action: 'export',
        resource: 'soulprint',
        resourceId: 'missing-userId',
        ipAddress,
        userAgent,
        result: 'failure',
        reason: 'userId parameter missing'
      });

      return NextResponse.json({
        success: false,
        error: 'userId required'
      }, { status: 400 });
    }

    let soulprint = soulprintTracker.getSoulprint(userId);

    if (!soulprint) {
      soulprint = soulprintTracker.createSoulprint(userId);
    }

    const markdown = SoulprintMarkdownExporter.generateMarkdown(soulprint);

    await logAudit({
      timestamp: new Date(),
      userId,
      action: 'export',
      resource: 'soulprint',
      resourceId: userId,
      ipAddress,
      userAgent,
      result: 'success',
      metadata: {
        format,
        userName: soulprint.userName,
        markdownSize: markdown.length,
        symbolCount: soulprint.activeSymbols.length,
        milestoneCount: soulprint.milestones.length
      }
    });

    // Return as download or JSON
    if (format === 'download') {
      const filename = `soulprint-${soulprint.userName || userId}-${new Date().toISOString().split('T')[0]}.md`;

      return new NextResponse(markdown, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } else {
      // Return as JSON with markdown content
      return NextResponse.json({
        success: true,
        markdown,
        fileName: `soulprint-${soulprint.userName || userId}-${new Date().toISOString().split('T')[0]}.md`,
        metadata: {
          userId: soulprint.userId,
          userName: soulprint.userName,
          generated: new Date().toISOString(),
          journeyDuration: Math.floor(
            (Date.now() - soulprint.created.getTime()) / (1000 * 60 * 60 * 24)
          )
        }
      });
    }
  } catch (error) {
    await logAudit({
      timestamp: new Date(),
      userId: request.nextUrl.searchParams.get('userId') || 'unknown',
      action: 'export',
      resource: 'soulprint',
      resourceId: 'error',
      ipAddress,
      userAgent,
      result: 'failure',
      reason: (error as Error).message
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to export soulprint'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const ipAddress = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    const body = await request.json();
    const { userIds } = body;

    if (!userIds || !Array.isArray(userIds)) {
      await logAudit({
        timestamp: new Date(),
        userId: 'therapist',
        action: 'export',
        resource: 'soulprint-batch',
        resourceId: 'invalid-request',
        ipAddress,
        userAgent,
        result: 'failure',
        reason: 'userIds array missing or invalid'
      });

      return NextResponse.json({
        success: false,
        error: 'userIds array required'
      }, { status: 400 });
    }

    await logAudit({
      timestamp: new Date(),
      userId: 'therapist',
      action: 'export',
      resource: 'soulprint-batch',
      resourceId: 'batch-start',
      ipAddress,
      userAgent,
      result: 'success',
      metadata: { batchSize: userIds.length }
    });

    const exports: Record<string, string> = {};
    const errors: Record<string, string> = {};

    userIds.forEach(userId => {
      try {
        let soulprint = soulprintTracker.getSoulprint(userId);

        if (!soulprint) {
          soulprint = soulprintTracker.createSoulprint(userId);
        }

        const markdown = SoulprintMarkdownExporter.generateMarkdown(soulprint);
        exports[userId] = markdown;
      } catch (error) {
        errors[userId] = error instanceof Error ? error.message : 'Unknown error';
      }
    });

    await logAudit({
      timestamp: new Date(),
      userId: 'therapist',
      action: 'export',
      resource: 'soulprint-batch',
      resourceId: 'batch-complete',
      ipAddress,
      userAgent,
      result: 'success',
      metadata: {
        requestedCount: userIds.length,
        successCount: Object.keys(exports).length,
        errorCount: Object.keys(errors).length,
        userIds
      }
    });

    return NextResponse.json({
      success: true,
      exports,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
      exportCount: Object.keys(exports).length,
      errorCount: Object.keys(errors).length
    });
  } catch (error) {
    await logAudit({
      timestamp: new Date(),
      userId: 'therapist',
      action: 'export',
      resource: 'soulprint-batch',
      resourceId: 'error',
      ipAddress,
      userAgent,
      result: 'failure',
      reason: (error as Error).message
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to batch export soulprints'
    }, { status: 500 });
  }
}