import { NextResponse } from "next/server";
import { z } from "zod";
import { loadFeatureFlags } from "@/lib/config/flags.runtime";
import { FeatureFlagsZ } from "@/lib/config/flags.schema";
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { isAdminUser } from '@/lib/server/supabaseAdmin';

const ToggleZ = z.object({
  key: z.string(),
  enabled: z.boolean(),
  percentage: z.number().min(0).max(100).optional(),
});

export async function POST(req: Request) {
  try {
    // Admin auth check
    const cookieStore = cookies();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const isAdmin = await isAdminUser(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const body = await req.json();
    const { key, enabled, percentage = 0 } = ToggleZ.parse(body);

    // Validate dependency constraints
    const flags = await loadFeatureFlags();
    if (!flags[key]) {
      return NextResponse.json({ error: 'Invalid feature key' }, { status: 400 });
    }

    // Check dependencies if disabling
    if (!enabled) {
      const dependents = Object.values(flags).filter(f => f.dependsOn.includes(key));
      const enabledDependents = dependents.filter(d => flags[d.key]?.rollout.enabled);
      
      if (enabledDependents.length > 0) {
        return NextResponse.json({ 
          error: `Cannot disable ${key}: required by ${enabledDependents.map(d => d.label).join(', ')}`
        }, { status: 400 });
      }
    }

    // Auto-enable dependencies if enabling
    const toEnable = new Set([key]);
    if (enabled) {
      const checkDeps = (flagKey: string) => {
        const flag = flags[flagKey];
        for (const depKey of flag.dependsOn) {
          if (!flags[depKey]?.rollout.enabled) {
            toEnable.add(depKey);
            checkDeps(depKey);
          }
        }
      };
      checkDeps(key);
    }

    // Persist all changes to DB
    const updates = [];
    for (const flagKey of toEnable) {
      const flagEnabled = flagKey === key ? enabled : true;
      const flagPercentage = flagKey === key ? percentage : 100;
      
      updates.push({
        key: flagKey,
        value: { enabled: flagEnabled, percentage: flagPercentage },
        updated_by: user.id
      });
    }

    const { error: upsertError } = await supabase
      .from('feature_flags')
      .upsert(updates, { onConflict: 'key' });

    if (upsertError) {
      console.error('Failed to persist feature flags:', upsertError);
      return NextResponse.json({ error: 'Failed to persist changes' }, { status: 500 });
    }

    // Also update env vars for immediate effect (until next restart)
    for (const flagKey of toEnable) {
      const flagEnabled = flagKey === key ? enabled : true;
      const flagPercentage = flagKey === key ? percentage : 100;
      
      const envKey = `NEXT_PUBLIC_${flagKey.toUpperCase()}_ENABLED`;
      const percentageKey = `NEXT_PUBLIC_${flagKey.toUpperCase()}_PERCENTAGE`;
      process.env[envKey] = String(flagEnabled);
      process.env[percentageKey] = String(flagPercentage);
    }

    // Reload flags with new values
    const updatedFlags = await loadFeatureFlags();
    
    // Log the change
    console.log("[ADMIN] feature.toggle", { 
      user: user.email, 
      changes: Array.from(toEnable).map(k => ({ key: k, enabled: k === key ? enabled : true, percentage: k === key ? percentage : 100 }))
    });

    return NextResponse.json({ 
      ok: true, 
      flags: updatedFlags,
      autoEnabled: Array.from(toEnable).filter(k => k !== key)
    });

  } catch (error) {
    console.error('Toggle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}