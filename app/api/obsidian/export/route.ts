/**
 * Obsidian Export API
 * Exports soulprint data to Obsidian markdown vault
 */

import { NextRequest, NextResponse } from 'next/server';
import { obsidianExporter } from '@/lib/obsidian/ObsidianExporter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, exportAll = false } = body;

    if (!userId && !exportAll) {
      return NextResponse.json(
        { error: 'userId or exportAll required' },
        { status: 400 }
      );
    }

    let result;

    if (exportAll) {
      result = await obsidianExporter.exportAll();
    } else {
      result = await obsidianExporter.exportSoulprint(userId);
    }

    return NextResponse.json({
      success: result.success,
      message: exportAll
        ? `Exported ${result.totalFiles} files for all users`
        : `Exported ${result.files?.length || 0} files`,
      files: result.files || []
    });
  } catch (error) {
    console.error('Obsidian export error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Obsidian Export API',
    vaultPath: '/Volumes/T7 Shield/ObsidianVaults/SoullabDevTeam/AIN',
    endpoints: {
      'POST /api/obsidian/export': 'Export soulprint(s) to Obsidian vault'
    }
  });
}