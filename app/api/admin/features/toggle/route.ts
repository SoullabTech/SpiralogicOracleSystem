import { NextResponse } from "next/server";
import { z } from "zod";
import { loadFeatureFlags } from "@/lib/config/flags.runtime";
import { FeatureFlagsZ } from "@/lib/config/flags.schema";

const ToggleZ = z.object({
  key: z.string(),
  enabled: z.boolean(),
  percentage: z.number().min(0).max(100).optional(),
});

export async function POST(req: Request) {
  // Basic admin check - in production, implement proper requireAdmin() middleware
  const adminEmails = process.env.ADMIN_ALLOWED_EMAILS?.split(',') || [];
  // For now, we'll skip auth check to enable the functionality
  // await requireAdmin(); // implement proper auth later
  
  const body = await req.json();
  const { key, enabled, percentage } = ToggleZ.parse(body);

  // In this scaffold we patch process.env for runtime; in your system,
  // persist to your feature store (DB/KV) and invalidate caches.
  const envKey = `NEXT_PUBLIC_${key.toUpperCase()}_ENABLED`;
  process.env[envKey] = String(enabled);

  // TODO: persist `percentage` in your feature store; for now no-op.

  // Validate resulting config
  const flags = loadFeatureFlags();
  FeatureFlagsZ.parse(flags);

  // Audit log stub
  console.log("[ADMIN] feature.toggle", { key, enabled, percentage });

  return NextResponse.json({ ok:true, flags });
}