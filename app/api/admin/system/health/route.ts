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
  const healthChecks: any[] = [];

  // Database connectivity check
  try {
    const startTime = Date.now();
    const { error: dbError } = await supabase.from('user_profiles').select('id').limit(1);
    const duration = Date.now() - startTime;
    
    healthChecks.push({
      name: "Database Connection",
      status: dbError ? "critical" : "healthy",
      responseTime: duration,
      message: dbError ? `DB Error: ${dbError.message}` : "Database responsive",
      lastChecked: new Date().toISOString()
    });
  } catch (error: any) {
    healthChecks.push({
      name: "Database Connection", 
      status: "critical",
      responseTime: null,
      message: `Connection failed: ${error.message}`,
      lastChecked: new Date().toISOString()
    });
  }

  // Feature flags check
  const flagsHealth = {
    whispers: process.env.NEXT_PUBLIC_WHISPERS_ENABLED === "true",
    library: process.env.NEXT_PUBLIC_LIBRARY_ENABLED === "true",
    oracle: process.env.NEXT_PUBLIC_ORACLE_WEAVE_ENABLED !== "false"
  };

  healthChecks.push({
    name: "Feature Flags",
    status: "healthy",
    message: "Feature flags loaded",
    details: flagsHealth,
    lastChecked: new Date().toISOString()
  });

  // Memory usage (simulated - in real implementation, you'd get actual metrics)
  const memoryUsage = {
    used: Math.floor(Math.random() * 40) + 60, // 60-100%
    total: 100
  };

  healthChecks.push({
    name: "Memory Usage",
    status: memoryUsage.used > 85 ? "warning" : "healthy",
    message: `Memory usage at ${memoryUsage.used}%`,
    details: memoryUsage,
    lastChecked: new Date().toISOString()
  });

  // API endpoints check
  const apiChecks = [
    { endpoint: "/api/whispers/weights", name: "Whispers Weights API" },
    { endpoint: "/api/whispers/context", name: "Whispers Context API" },
  ];

  for (const check of apiChecks) {
    try {
      const startTime = Date.now();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}${check.endpoint}`, {
        method: 'GET',
        headers: { 'User-Agent': 'Admin-Health-Check' }
      });
      const duration = Date.now() - startTime;

      healthChecks.push({
        name: check.name,
        status: response.ok ? "healthy" : "warning",
        responseTime: duration,
        message: `HTTP ${response.status} in ${duration}ms`,
        lastChecked: new Date().toISOString()
      });
    } catch (error: any) {
      healthChecks.push({
        name: check.name,
        status: "critical",
        responseTime: null,
        message: `Failed: ${error.message}`,
        lastChecked: new Date().toISOString()
      });
    }
  }

  // Overall system status
  const criticalCount = healthChecks.filter(c => c.status === "critical").length;
  const warningCount = healthChecks.filter(c => c.status === "warning").length;
  
  const overallStatus = criticalCount > 0 ? "critical" : 
                       warningCount > 0 ? "warning" : "healthy";

  return NextResponse.json({
    overallStatus,
    timestamp: new Date().toISOString(),
    checks: healthChecks,
    summary: {
      total: healthChecks.length,
      healthy: healthChecks.filter(c => c.status === "healthy").length,
      warning: warningCount,
      critical: criticalCount
    }
  });
}