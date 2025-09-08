import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PersonalOracleAgent } from "@/apps/api/backend/src/agents/PersonalOracleAgent";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { 
      content, 
      context, 
      sessionId, 
      coherenceLevel,
      timestamp 
    } = await req.json();

    // Get user from session (simplified for example)
    const userId = req.headers.get("x-user-id") || "anonymous";

    // Initialize PersonalOracleAgent
    const agent = new PersonalOracleAgent({
      userId,
      sessionId,
      context,
      currentCoherence: coherenceLevel
    });

    // Process message through the agent
    const response = await agent.processQuery(content);

    // Store messages in Supabase
    const { error: messageError } = await supabase
      .from("maia_messages")
      .insert([
        {
          session_id: sessionId,
          user_id: userId,
          role: "user",
          content,
          context,
          coherence_level: coherenceLevel,
          created_at: timestamp
        },
        {
          session_id: sessionId,
          user_id: userId,
          role: "maia",
          content: response.text,
          coherence_level: response.coherenceLevel,
          motion_state: response.motionState,
          elements: response.elements,
          shadow_petals: response.shadowPetals,
          context,
          is_breakthrough: response.isBreakthrough,
          metadata: {
            practices: response.practices,
            insights: response.insights
          }
        }
      ]);

    if (messageError) {
      console.error("Error storing messages:", messageError);
    }

    return NextResponse.json({
      messageId: `msg-${Date.now()}`,
      response: response.text,
      coherenceLevel: response.coherenceLevel,
      motionState: response.motionState,
      elements: response.elements,
      shadowPetals: response.shadowPetals,
      isBreakthrough: response.isBreakthrough,
      practices: response.practices,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Maia chat error:", error);
    return NextResponse.json(
      { 
        error: "Failed to process message",
        response: "I'm here, though the connection feels distant. Let's breathe together.",
        coherenceLevel: 0.5,
        motionState: "idle"
      },
      { status: 500 }
    );
  }
}