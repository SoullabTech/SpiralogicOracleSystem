import { NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({ 
  error: z.string(), 
  source: z.enum(["localStorage", "default"]) 
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = Body.safeParse(body);
    
    if (parsed.success) {
      // Log to console for now, could be extended to proper telemetry service
      console.warn("Whispers weights fallback:", parsed.data);
    }
    
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Non-blocking
  }
}