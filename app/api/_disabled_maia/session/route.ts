import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Build-time safe Supabase initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const { action, sessionId, timestamp } = await req.json();
    const userId = req.headers.get("x-user-id") || "anonymous";

    if (action === "init") {
      // Check for existing active session
      const { data: existingSession } = await supabase
        .from("maia_sessions")
        .select("*")
        .eq("user_id", userId)
        .gte("last_active", new Date(Date.now() - 3600000).toISOString()) // Active in last hour
        .single();

      if (existingSession) {
        // Return existing session with recent messages
        const { data: recentMessages } = await supabase
          .from("maia_messages")
          .select("*")
          .eq("session_id", existingSession.session_id)
          .order("created_at", { ascending: false })
          .limit(10);

        return NextResponse.json({
          sessionId: existingSession.session_id,
          coherenceLevel: existingSession.coherence_level,
          recentMessages: recentMessages?.reverse() || []
        });
      }

      // Create new session
      const newSessionId = `maia-${userId}-${Date.now()}`;
      const { data: newSession, error } = await supabase
        .from("maia_sessions")
        .insert({
          user_id: userId,
          session_id: newSessionId,
          started_at: timestamp,
          last_active: timestamp
        })
        .select()
        .single();

      if (error) throw error;

      // Get welcome message
      const { data: welcomeInsight } = await supabase
        .from("maia_insights")
        .select("content")
        .eq("insight_type", "welcome")
        .single();

      const welcomeMessage = {
        id: `msg-welcome-${Date.now()}`,
        role: "maia",
        content: welcomeInsight?.content || "Welcome, dear one. How may I support your journey today?",
        timestamp: new Date().toISOString(),
        coherenceLevel: 0.7
      };

      return NextResponse.json({
        sessionId: newSessionId,
        coherenceLevel: 0.7,
        recentMessages: [welcomeMessage]
      });
    }

    if (action === "clear") {
      // Mark session as ended
      await supabase
        .from("maia_sessions")
        .update({ 
          last_active: new Date().toISOString(),
          metadata: { ended_at: new Date().toISOString() }
        })
        .eq("session_id", sessionId);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Session management error:", error);
    return NextResponse.json(
      { error: "Failed to manage session" },
      { status: 500 }
    );
  }
}