import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo (replace with database in production)
const userSettings = new Map<string, any>();

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId') || 'default';
    const settings = userSettings.get(userId);

    return NextResponse.json({
      success: true,
      settings: settings || null
    });
  } catch (error) {
    console.error('Failed to get MAIA settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve settings'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = 'default', settings } = body;

    if (!settings) {
      return NextResponse.json({
        success: false,
        error: 'Settings required'
      }, { status: 400 });
    }

    // Store settings (in production, save to database)
    userSettings.set(userId, {
      ...settings,
      updatedAt: new Date().toISOString()
    });

    console.log(`✅ MAIA settings saved for user ${userId}:`, {
      voice: settings.voice?.openaiVoice,
      memoryEnabled: settings.memory?.enabled,
      personalityWarmth: settings.personality?.warmth
    });

    // Trigger any necessary system updates based on settings
    if (settings.technical?.debugMode) {
      console.log('🔍 Debug mode enabled for user', userId);
    }

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully'
    });
  } catch (error) {
    console.error('Failed to save MAIA settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save settings'
    }, { status: 500 });
  }
}