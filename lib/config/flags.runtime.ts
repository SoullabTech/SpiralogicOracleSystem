import { FeatureFlagsZ, FeatureFlags } from "./flags.schema";

// Source of truth loader — merges ENV, docs, and code defaults
export function loadFeatureFlags(): FeatureFlags {
  // 1) Base defaults (safe/off in prod)
  const defaults: FeatureFlags = {
    dreams: { key:"dreams", label:"Dream Journaling", category:"UserFacing",
      dependsOn:[], rollout:{enabled:false, percentage:0},
      description:"Capture & weave dreams into recap system.",
      perfCost:{cpu:"med", memory:"low", latencyHintMs:10}},
    whispers: { key:"whispers", label:"Contextual Whispers", category:"UserFacing",
      dependsOn:["micro_memories"], rollout:{enabled:false, percentage:0},
      description:"Surface micro-memories contextually in recaps.",
      perfCost:{cpu:"med", memory:"low", latencyHintMs:12}},
    micro_memories: { key:"micro_memories", label:"Quick Capture", category:"UserFacing",
      dependsOn:[], rollout:{enabled:false, percentage:0},
      description:"Frictionless capture of sparks/worries/todos.",
      perfCost:{cpu:"low", memory:"low", latencyHintMs:6}},
    adhd_mode: { key:"adhd_mode", label:"ADHD / Neurodivergent Mode", category:"UserFacing",
      dependsOn:["micro_memories","voice_maya"], rollout:{enabled:false, percentage:0},
      description:"Attention-friendly prompts, digests, recalls.",
      perfCost:{cpu:"low", memory:"low", latencyHintMs:8}},
    voice_maya: { key:"voice_maya", label:"Maya Voice", category:"Core",
      dependsOn:[], rollout:{enabled:false, percentage:0},
      description:"Cue & feedback voice prompts (Maya).",
      perfCost:{cpu:"med", memory:"med", latencyHintMs:25}},
    retreat_facilitator: { key:"retreat_facilitator", label:"Facilitator Tools", category:"Facilitator",
      dependsOn:["owner_console"], rollout:{enabled:false, percentage:0},
      description:"Session support & orchestration for facilitators.",
      perfCost:{cpu:"med", memory:"med", latencyHintMs:20}},
    owner_console: { key:"owner_console", label:"Owner Console", category:"Core",
      dependsOn:[], rollout:{enabled:false, percentage:0},
      description:"Owner/primary admin views & controls.",
      perfCost:{cpu:"low", memory:"low", latencyHintMs:5}},
    uploads: { key:"uploads", label:"Multimodal Uploads", category:"Core",
      dependsOn:[], rollout:{enabled:false, percentage:0},
      description:"PDF/image/audio ingestion and context.",
      perfCost:{cpu:"med", memory:"med", latencyHintMs:18}},
    beta_badges: { key:"beta_badges", label:"Beta Badges & Ceremonies", category:"Experimental",
      dependsOn:[], rollout:{enabled:false, percentage:0},
      description:"Gamified badges for beta program.",
      perfCost:{cpu:"low", memory:"low", latencyHintMs:5}},
    admin_docs: { key:"admin_docs", label:"Admin Docs", category:"Debug",
      dependsOn:[], rollout:{enabled:true, percentage:100},
      description:"Render review docs inside admin console.",
      perfCost:{cpu:"low", memory:"low", latencyHintMs:2}},
    weave_pipeline: { key:"weave_pipeline", label:"Oracle Weaving", category:"Core",
      dependsOn:[], rollout:{enabled:true, percentage:100},
      description:"Recap/elemental weaving pipeline.",
      perfCost:{cpu:"med", memory:"low", latencyHintMs:15}},
  };

  // 2) Overlay ENV toggles (NEXT_PUBLIC_* or SERVER_* as needed)
  const envOverlays: Partial<FeatureFlags> = {};
  for (const key of Object.keys(defaults)) {
    const envEnable = process.env[`NEXT_PUBLIC_${key.toUpperCase()}_ENABLED`];
    if (envEnable != null) {
      envOverlays[key] = {
        ...defaults[key],
        rollout: { ...defaults[key].rollout, enabled: envEnable === "true" }
      };
    }
  }

  // 3) Merge & validate
  const merged = { ...defaults, ...envOverlays };
  return FeatureFlagsZ.parse(merged);
}