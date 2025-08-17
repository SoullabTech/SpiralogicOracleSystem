import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from "next/headers";

interface VoiceAgentSettings {
  agent_name?: string | null;
  voice_provider?: string;
  voice_id?: string | null;
  tts_enabled?: boolean;
  speech_rate?: number;
  speech_pitch?: number;
}

function isValidVoiceProvider(x: unknown): x is "elevenlabs" | "system" {
  return x === "elevenlabs" || x === "system";
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

async function getUserSettings(supabase: any, userId: string): Promise<VoiceAgentSettings | null> {
  // Try oracle_preferences first
  const { data: oracleData, error: oracleError } = await supabase
    .from('oracle_preferences')
    .select('agent_name, voice_provider, voice_id, tts_enabled, speech_rate, speech_pitch')
    .eq('user_id', userId)
    .single();

  if (!oracleError && oracleData) {
    return oracleData;
  }

  // Fallback to user_preferences
  const { data: userData, error: userError } = await supabase
    .from('user_preferences')
    .select('agent_name, voice_provider, voice_id, tts_enabled, speech_rate, speech_pitch')
    .eq('user_id', userId)
    .single();

  if (!userError && userData) {
    return userData;
  }

  return null;
}

async function upsertUserSettings(supabase: any, userId: string, settings: VoiceAgentSettings): Promise<void> {
  // Try oracle_preferences first
  const { error: oracleError } = await supabase
    .from('oracle_preferences')
    .upsert({
      user_id: userId,
      ...settings,
    }, {
      onConflict: 'user_id'
    });

  if (oracleError) {
    // Fallback to user_preferences
    const { error: userError } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...settings,
      }, {
        onConflict: 'user_id'
      });

    if (userError) {
      throw new Error(`Failed to update settings: ${userError.message}`);
    }
  }
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const settings = await getUserSettings(supabase, user.id);

    // Return default values if no settings found
    const response: VoiceAgentSettings = {
      agent_name: settings?.agent_name || null,
      voice_provider: settings?.voice_provider || 'elevenlabs',
      voice_id: settings?.voice_id || null,
      tts_enabled: settings?.tts_enabled || false,
      speech_rate: settings?.speech_rate || 1.0,
      speech_pitch: settings?.speech_pitch || 1.0,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET /api/settings/voice-agent error:', error);
    return NextResponse.json(
      { error: "Failed to retrieve settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const updates: VoiceAgentSettings = {};

    // Validate and process each field
    if (body.agent_name !== undefined) {
      if (body.agent_name === null || body.agent_name === '') {
        updates.agent_name = null;
      } else if (typeof body.agent_name === 'string') {
        updates.agent_name = body.agent_name.slice(0, 32);
      } else {
        return NextResponse.json(
          { error: "agent_name must be a string or null" },
          { status: 400 }
        );
      }
    }

    if (body.voice_provider !== undefined) {
      if (!isValidVoiceProvider(body.voice_provider)) {
        return NextResponse.json(
          { error: "voice_provider must be 'elevenlabs' or 'system'" },
          { status: 400 }
        );
      }
      updates.voice_provider = body.voice_provider;
    }

    if (body.voice_id !== undefined) {
      if (body.voice_id === null || body.voice_id === '') {
        updates.voice_id = null;
      } else if (typeof body.voice_id === 'string') {
        updates.voice_id = body.voice_id.slice(0, 100);
      } else {
        return NextResponse.json(
          { error: "voice_id must be a string or null" },
          { status: 400 }
        );
      }
    }

    if (body.tts_enabled !== undefined) {
      if (typeof body.tts_enabled !== 'boolean') {
        return NextResponse.json(
          { error: "tts_enabled must be a boolean" },
          { status: 400 }
        );
      }
      updates.tts_enabled = body.tts_enabled;
    }

    if (body.speech_rate !== undefined) {
      if (typeof body.speech_rate !== 'number' || isNaN(body.speech_rate)) {
        return NextResponse.json(
          { error: "speech_rate must be a number" },
          { status: 400 }
        );
      }
      updates.speech_rate = clampNumber(body.speech_rate, 0.8, 1.25);
    }

    if (body.speech_pitch !== undefined) {
      if (typeof body.speech_pitch !== 'number' || isNaN(body.speech_pitch)) {
        return NextResponse.json(
          { error: "speech_pitch must be a number" },
          { status: 400 }
        );
      }
      updates.speech_pitch = clampNumber(body.speech_pitch, 0.8, 1.25);
    }

    // Only update if there are changes
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: true, message: "No changes to update" });
    }

    await upsertUserSettings(supabase, user.id, updates);

    return NextResponse.json({ 
      success: true, 
      updated: updates 
    });

  } catch (error) {
    console.error('PUT /api/settings/voice-agent error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update settings" },
      { status: 500 }
    );
  }
}