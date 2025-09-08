import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../apps/web/lib/supabaseClient";

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

    // Use the sacred_timeline view for unified history
    const { data, error } = await supabase
      .from("sacred_timeline")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }); // Chronological order for timeline

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch sacred timeline" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      timeline: data || [],
      message: "Sacred timeline retrieved"
    });

  } catch (error) {
    console.error("Error fetching sacred timeline:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sacred timeline" },
      { status: 500 }
    );
  }
}