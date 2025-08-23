import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { text = "Debug test from Maya" } = await req.json();
  const endpoint = process.env.RUNPOD_SESAME_ENDPOINT_ID;
  const key = process.env.RUNPOD_API_KEY;
  
  const debug: any = {
    timestamp: new Date().toISOString(),
    env: {
      hasEndpoint: !!endpoint,
      hasKey: !!key,
      endpointId: endpoint,
      provider: process.env.VOICE_PROVIDER,
      sesameProv: process.env.SESAME_PROVIDER,
    },
    stages: {},
  };

  if (!endpoint || !key) {
    return NextResponse.json({
      ...debug,
      error: "Missing RUNPOD_API_KEY or RUNPOD_SESAME_ENDPOINT_ID",
    }, { status: 500 });
  }

  try {
    // 1. Submit job
    const runStart = Date.now();
    const runRes = await fetch(
      `https://api.runpod.ai/v2/${endpoint}/run`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({ input: { text } }),
      }
    );
    
    debug.stages.submit = {
      duration: Date.now() - runStart,
      status: runRes.status,
      ok: runRes.ok,
    };

    if (!runRes.ok) {
      const body = await runRes.text();
      debug.stages.submit.error = body;
      return NextResponse.json(debug, { status: 502 });
    }

    const { id: jobId } = await runRes.json();
    debug.jobId = jobId;

    // 2. Poll for completion
    const pollStart = Date.now();
    let polls = 0;
    let lastStatus = "";
    
    while (Date.now() - pollStart < 30000) { // 30s max
      polls++;
      const statusRes = await fetch(
        `https://api.runpod.ai/v2/${endpoint}/status/${jobId}`,
        {
          headers: { Authorization: `Bearer ${key}` },
          cache: "no-store",
        }
      );
      
      if (!statusRes.ok) {
        debug.stages.poll = {
          duration: Date.now() - pollStart,
          polls,
          error: `Status check failed: ${statusRes.status}`,
        };
        return NextResponse.json(debug, { status: 502 });
      }

      const data = await statusRes.json();
      lastStatus = data.status;
      
      if (data.status === "COMPLETED") {
        debug.stages.poll = {
          duration: Date.now() - pollStart,
          polls,
          status: "COMPLETED",
        };
        
        // Check output structure
        debug.output = {
          hasOutput: !!data.output,
          keys: data.output ? Object.keys(data.output) : [],
          audioFields: {
            audio_base64: !!data.output?.audio_base64,
            "audio.base64": !!data.output?.audio?.base64,
            wavBase64: !!data.output?.wavBase64,
            wav_base64: !!data.output?.wav_base64,
          },
        };
        
        debug.totalDuration = Date.now() - runStart;
        return NextResponse.json(debug);
      }
      
      if (["FAILED", "CANCELLED", "TIMED_OUT"].includes(data.status)) {
        debug.stages.poll = {
          duration: Date.now() - pollStart,
          polls,
          status: data.status,
          error: data.error,
        };
        return NextResponse.json(debug, { status: 502 });
      }
      
      await new Promise(r => setTimeout(r, 1500));
    }
    
    debug.stages.poll = {
      duration: Date.now() - pollStart,
      polls,
      lastStatus,
      error: "Polling timeout",
    };
    return NextResponse.json(debug, { status: 504 });
    
  } catch (e: any) {
    debug.error = e?.message || "Unknown error";
    return NextResponse.json(debug, { status: 500 });
  }
}