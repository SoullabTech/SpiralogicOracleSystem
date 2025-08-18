import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// Minimal validation without extra deps.
function isPersona(x: unknown): x is "mentor" | "shaman" | "analyst" {
  return x === "mentor" || x === "shaman" || x === "analyst";
}

function isValidVoiceProvider(x: unknown): x is "elevenlabs" | "system" {
  return x === "elevenlabs" || x === "system";
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const persona = body?.persona;
    const intention: string = (body?.intention ?? "").toString().slice(0, 500);
    
    // New voice + agent fields
    const agentName: string = (body?.agentName ?? "").toString().slice(0, 32);
    const voiceProvider = body?.voiceProvider;
    const voiceId: string = (body?.voiceId ?? "").toString().slice(0, 100);
    const ttsEnabled: boolean = Boolean(body?.ttsEnabled);

    if (!isPersona(persona)) {
      return NextResponse.json({ ok: false, error: "Invalid persona" }, { status: 400 });
    }

    if (voiceProvider && !isValidVoiceProvider(voiceProvider)) {
      return NextResponse.json({ ok: false, error: "Invalid voice provider" }, { status: 400 });
    }

    // TODO: Replace with real auth guard.
    // For MVP, set a fake auth cookie if not present.
    const jar = cookies();
    if (!jar.get("auth")) jar.set("auth", "1", { path: "/", httpOnly: false });

    // Try to persist to database if Supabase is available
    try {
      const supabase = createRouteHandlerClient({ cookies });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Try oracle_preferences first, fall back to user_preferences
        let { error: oracleError } = await supabase
          .from('oracle_preferences')
          .upsert({
            user_id: user.id,
            persona,
            intention: intention || null,
            agent_name: agentName || null,
            voice_provider: voiceProvider || 'elevenlabs',
            voice_id: voiceId || null,
            tts_enabled: ttsEnabled,
          }, {
            onConflict: 'user_id'
          });

        if (oracleError) {
          // Fallback to user_preferences
          const { error: userError } = await supabase
            .from('user_preferences')
            .upsert({
              user_id: user.id,
              persona,
              intention: intention || null,
              agent_name: agentName || null,
              voice_provider: voiceProvider || 'elevenlabs',
              voice_id: voiceId || null,
              tts_enabled: ttsEnabled,
            }, {
              onConflict: 'user_id'
            });

          if (userError) {
            console.warn('Failed to persist to database:', userError);
            // Continue with cookie fallback
          }
        }
      }
    } catch (dbError) {
      console.warn('Database operation failed, using cookies:', dbError);
      // Continue with cookie fallback
    }

    // Persist to cookies as fallback
    jar.set("persona", persona, { path: "/", httpOnly: false });
    if (intention) jar.set("intention", intention, { path: "/", httpOnly: false });
    if (agentName) jar.set("agentName", agentName, { path: "/", httpOnly: false });
    if (voiceProvider) jar.set("voiceProvider", voiceProvider, { path: "/", httpOnly: false });
    if (voiceId) jar.set("voiceId", voiceId, { path: "/", httpOnly: false });
    jar.set("ttsEnabled", ttsEnabled.toString(), { path: "/", httpOnly: false });
    jar.set("onboarded", "1", { path: "/", httpOnly: false });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Unexpected error" }, { status: 500 });
  }
}