import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkAdminAccess() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { authorized: false, error: "Not authenticated" };
  
  const adminEmails = process.env.ADMIN_ALLOWED_EMAILS?.split(",") || [];
  const isAdmin = adminEmails.includes(user.email || "");
  
  if (!isAdmin) return { authorized: false, error: "Not authorized" };
  
  return { authorized: true, user };
}

export async function GET() {
  const { authorized, error } = await checkAdminAccess();
  if (!authorized) return NextResponse.json({ error }, { status: 401 });

  const supabase = createClient();
  
  try {
    // Get whispers usage metrics
    const { data: memoryStats, error: memoryError } = await supabase.rpc('get_whispers_metrics');
    
    if (memoryError) {
      console.error("Memory stats error:", memoryError);
    }

    // Get weight distribution
    const { data: weightStats, error: weightError } = await supabase
      .from('whisper_weights')
      .select('weights, updated_at');

    if (weightError) {
      console.error("Weight stats error:", weightError);
    }

    // Process weight statistics
    const processedWeights = weightStats ? {
      totalUsers: weightStats.length,
      averages: {
        elementBoost: weightStats.reduce((sum, w) => sum + (w.weights?.elementBoost || 0), 0) / weightStats.length,
        recencyDays: weightStats.reduce((sum, w) => sum + (w.weights?.recencyHalfLifeDays || 3), 0) / weightStats.length,
        recallBoost: weightStats.reduce((sum, w) => sum + (w.weights?.recallBoost || 0), 0) / weightStats.length,
      },
      ranges: {
        elementBoost: {
          min: Math.min(...weightStats.map(w => w.weights?.elementBoost || 0)),
          max: Math.max(...weightStats.map(w => w.weights?.elementBoost || 0))
        },
        recencyDays: {
          min: Math.min(...weightStats.map(w => w.weights?.recencyHalfLifeDays || 3)),
          max: Math.max(...weightStats.map(w => w.weights?.recencyHalfLifeDays || 3))
        },
        recallBoost: {
          min: Math.min(...weightStats.map(w => w.weights?.recallBoost || 0)),
          max: Math.max(...weightStats.map(w => w.weights?.recallBoost || 0))
        }
      }
    } : null;

    // Mock additional metrics that would come from telemetry/logging
    const metrics = {
      activeUsers: 127,
      avgRankingTime: 98,
      clickThroughRate: 18.5,
      fallbackRate: 1.2,
      memorySurfacing: 2847,
      timeouts: 0.05,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      metrics,
      memoryStats: memoryStats || [],
      weightDistribution: processedWeights
    });
    
  } catch (error: any) {
    console.error("Admin metrics error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch metrics", 
      details: error.message 
    }, { status: 500 });
  }
}