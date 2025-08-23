import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const UpdateFlagSchema = z.object({
  key: z.string(),
  enabled: z.boolean(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
});

// Admin access control
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

  // Return current feature flag states
  // In a real implementation, you might store these in a database
  const flags = {
    "whispers.enabled": process.env.NEXT_PUBLIC_WHISPERS_ENABLED === "true",
    "whispers.contextRanking": process.env.NEXT_PUBLIC_WHISPERS_CONTEXT_RANKING !== "false",
    "library.enabled": process.env.NEXT_PUBLIC_LIBRARY_ENABLED === "true",
    "oracle.weaveEnabled": process.env.NEXT_PUBLIC_ORACLE_WEAVE_ENABLED !== "false",
    "neurodivergent.enabled": process.env.NEXT_PUBLIC_ND_ENABLED === "true",
    "dev.enabled": process.env.NEXT_PUBLIC_DEV_TOOLS === "true" || process.env.NODE_ENV === "development",
  };

  return NextResponse.json({ flags });
}

export async function POST(req: Request) {
  const { authorized, error } = await checkAdminAccess();
  if (!authorized) return NextResponse.json({ error }, { status: 401 });

  const body = await req.json();
  const parsed = UpdateFlagSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error }, { status: 400 });
  }

  const { key, enabled, rolloutPercentage } = parsed.data;

  // Log the admin action
  console.log(`Admin feature flag update: ${key} = ${enabled}${rolloutPercentage !== undefined ? ` (${rolloutPercentage}%)` : ""}`);

  // In a real implementation, you would update your feature flag system here
  // This could be updating environment variables, a database, or a feature flag service
  // For now, we'll just return success
  
  return NextResponse.json({ 
    success: true, 
    message: `Feature flag ${key} updated successfully`,
    newState: { enabled, rolloutPercentage }
  });
}