#!/usr/bin/env node

/**
 * QA Script for Whispers System
 * Run with: node scripts/qa-whispers.js
 */

const scenarios = {
  "New account with no whispers": {
    setup: "Fresh account, no micro-memories",
    expect: "Widget hidden, no Maya cue, no API calls"
  },
  "1-2 whispers created now": {
    setup: "Create 1-2 micro-memories with current timestamp",
    expect: "Visible + ranked, telemetry fires 'shown'"
  },
  "Element overlap ranking": {
    setup: "Memory with 'fire' element, recap context with fire bucket",
    expect: "Memory gets element boost in score"
  },
  "Keyphrase overlap ranking": {
    setup: "Memory containing 'deadline', recap with 'deadline' keyword",
    expect: "Memory gets keyphrase boost"
  },
  "Recency decay": {
    setup: "Memory from 3+ days ago vs recent memory",
    expect: "Recent memory scores higher"
  },
  "Recall due boost": {
    setup: "Memory with recall_at in past",
    expect: "Memory gets recall boost"
  },
  "Personalization toggle OFF": {
    setup: "Save custom weights, then disable personalization",
    expect: "Weights revert to defaults immediately"
  },
  "Feature flags OFF": {
    setup: "NEXT_PUBLIC_WHISPERS_ENABLED=false",
    expect: "/dev/whispers works, main UI hides Whispers"
  }
};

console.log("🧪 Whispers QA Checklist\n");

Object.entries(scenarios).forEach(([name, scenario], i) => {
  console.log(`${i + 1}. ${name}`);
  console.log(`   Setup: ${scenario.setup}`);
  console.log(`   Expect: ${scenario.expect}`);
  console.log("");
});

console.log("🔍 Quick Verifications:\n");

console.log("Client flags check:");
console.log("console.log(window.__FLAGS?.whispers) // Check in browser console");
console.log("");

console.log("Context endpoint smoke test:");
console.log("curl -s -H 'Authorization: Bearer <jwt>' \\");
console.log("  'http://localhost:3001/api/whispers/context' \\");
console.log("  -X POST -H 'Content-Type: application/json' \\");
console.log("  -d '{\"recapBuckets\":[{\"element\":\"fire\"}],\"limit\":6}' | jq .");
console.log("");

console.log("📊 Useful SQL Queries:\n");

console.log("-- Top tags last 14 days");
console.log(`select
  tag,
  count(*) as c
from public.micro_memories mm
cross join lateral unnest(mm.nd_tags) as tag
where mm.user_id = auth.uid()
  and mm.created_at >= now() - interval '14 days'
group by tag
order by c desc;`);

console.log("");
console.log("-- Whisper weights per user");
console.log(`select 
  user_id,
  weights->>'elementBoost' as element_boost,
  weights->>'recencyHalfLifeDays' as recency_days,
  updated_at
from public.whisper_weights
order by updated_at desc;`);

console.log("");
console.log("-- Telemetry funnel (if implemented)");
console.log(`select
  date_trunc('day', created_at) as day,
  count(*) filter (where event_type = 'whispers_shown') as shown,
  count(*) filter (where event_type = 'whispers_used') as used
from public.telemetry
where created_at >= now() - interval '7 days'
group by 1
order by 1 desc;`);

console.log("");
console.log("🚨 Alert Conditions:");
console.log("• Error rate > 2% on /api/whispers/context (5m window)");
console.log("• Ranking timeout > 200ms (check logs for 'ranking exceeded budget')");
console.log("• Weight fallback rate > 10% (check logs for 'weights fallback')");
console.log("");

console.log("📋 Support Playbook:");
console.log("1. Whispers not showing?");
console.log("   - Check NEXT_PUBLIC_WHISPERS_ENABLED");
console.log("   - Verify user has micro_memories");
console.log("   - Check API returns 200 with data");
console.log("   - Verify RLS permissions");
console.log("");
console.log("2. Ranking feels off?");
console.log("   - Open /dev/whispers/tune");
console.log("   - Compare local vs server weights in Settings");
console.log("   - Check for fallback reasons in API response");
console.log("");

console.log("✅ Production Rollout:");
console.log("1. Set NEXT_PUBLIC_WHISPERS_ENABLED=true for 5-10% canary");
console.log("2. Monitor error rates and performance");
console.log("3. Ramp to 100% if metrics look good");
console.log("4. Consider raising maxItems if performance allows");