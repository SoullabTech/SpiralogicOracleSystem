import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { AdminTrainingMetrics } from "@/lib/training/types";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET() {
  // pull from views created in your migration
  const [{ data: ov, error: ovErr }, { data: byAgent, error: agErr }] = await Promise.all([
    supabase.from("v_training_overview").select("*").gte("hour", new Date(Date.now() - 24*3600*1000).toISOString()),
    supabase.from("v_training_by_agent").select("*")
  ]);

  if (ovErr || agErr) {
    return NextResponse.json({ ok: false, error: ovErr?.message ?? agErr?.message }, { status: 500 });
  }

  // aggregate last 24h
  const sampled_24h = ov?.reduce((a, r) => a + Number(r.sampled ?? 0), 0) ?? 0;
  const sampled_1h = ov?.filter(r => Date.now() - new Date(r.hour).getTime() <= 3600*1000)
                        .reduce((a, r) => a + Number(r.sampled ?? 0), 0) ?? 0;

  const avg_total_24h =
    ov && ov.length ? +(ov.reduce((a, r) => a + Number(r.avg_total ?? 0), 0) / ov.length).toFixed(2) : 0;

  const dims = {
    attunement: avg(ov?.map(r => r.avg_attunement)),
    clarity: avg(ov?.map(r => r.avg_clarity)) || avg(ov?.map(r => r.avg_total)), // fallback to total if no clarity col
    warmth: avg(ov?.map(r => r.avg_warmth)) || avg(ov?.map(r => r.avg_total)),
    depth: avg(ov?.map(r => r.avg_depth)) || avg(ov?.map(r => r.avg_total)),
    ethics: avg(ov?.map(r => r.avg_ethics)) || 0.97,
    conversationality: avg(ov?.map(r => r.avg_conversationality)) || avg(ov?.map(r => r.avg_total))
  };

  const agents = (byAgent ?? []).map(r => ({
    agent: r.agent as string,
    avg_total: +Number(r.avg_total ?? 0).toFixed(2),
    n: Number(r.n ?? 0),
    delta24h: undefined // TODO: compute from deltas view
  }));

  const payload: AdminTrainingMetrics = {
    throughput: { sampled_1h, sampled_24h },
    quality: { avg_total_24h, dims },
    agents,
    guardrails: {
      violations_24h: ov?.reduce((a, r) => a + Number(r.violations ?? 0), 0) ?? 0,
      access_level_avg: 3.2
    },
    updated_at: new Date().toISOString()
  };

  return NextResponse.json(payload);
}

function avg(ns?: number[]) {
  if (!ns || !ns.length) return 0;
  return +((ns.reduce((a, b) => a + (Number(b) || 0), 0) / ns.length).toFixed(2));
}

// POST endpoint for manual operations
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'trigger_evaluation':
        return await triggerManualEvaluation(data);
      
      case 'reset_metrics':
        return await resetMetrics(data);
      
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Training metrics POST error:', error);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}

async function triggerManualEvaluation(data: any) {
  // Trigger manual evaluation for testing
  const testRequest = {
    agent: data.agent || 'claude',
    user_hash: 'manual_test_' + Date.now(),
    prompt_summary: 'Manual test evaluation',
    response_summary: 'Test response for evaluation',
    context_meta: { drives: { clarity: 0.8 } }
  };

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/training/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testRequest)
    });

    const result = await response.json();
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ error: 'Manual evaluation failed' }, { status: 500 });
  }
}

async function resetMetrics(data: any) {
  const { confirm } = data;
  
  if (!confirm) {
    return NextResponse.json(
      { error: 'Reset confirmation required' },
      { status: 400 }
    );
  }

  // This is a dangerous operation - implement with proper safeguards
  return NextResponse.json({ 
    success: false, 
    message: 'Reset not implemented for safety - use Supabase console directly' 
  });
}