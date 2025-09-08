import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../apps/web/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      scores, 
      milestone, 
      coherence, 
      elementalBalance,
      sessionDuration,
      interactionCount,
      breakthroughMoments,
      shadowElements
    } = body;

    if (!userId || !scores || !milestone || coherence === undefined) {
      return NextResponse.json(
        { success: false, error: "userId, scores, milestone, and coherence are required" },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 }
      );
    }

    // Calculate total activation
    const totalActivation = Object.values(scores).reduce((sum: number, score) => sum + (score as number), 0);

    const { data, error } = await supabase
      .from("soulprints")
      .insert([{
        user_id: userId,
        scores,
        milestone,
        coherence,
        elemental_balance: elementalBalance || {},
        session_duration: sessionDuration,
        interaction_count: interactionCount || 0,
        total_activation: totalActivation,
        breakthrough_moments: breakthroughMoments || [],
        shadow_elements: shadowElements || []
      }])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to save soulprint" },
        { status: 500 }
      );
    }

    // Update milestone progression
    if (elementalBalance) {
      await supabase.rpc('update_milestone_progression', {
        p_user_id: userId,
        p_milestone: milestone,
        p_coherence: coherence,
        p_elemental_balance: elementalBalance
      });
    }

    return NextResponse.json({ 
      success: true,
      soulprint: data[0],
      message: "Soulprint captured in sacred memory"
    });

  } catch (error) {
    console.error("Error saving soulprint:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save soulprint" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from("soulprints")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch soulprints" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      soulprints: data || []
    });

  } catch (error) {
    console.error("Error fetching soulprints:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch soulprints" },
      { status: 500 }
    );
  }
}