// Comprehensive Services Catalog - Single source of truth for all system features
// Drives both user-facing catalog and admin controls

import { loadFeatureFlagsSync } from './flags.runtime';
import { isEnabledForUser } from './cohorts';

export type Audience = "user" | "admin" | "both";
export type Section =
  | "core"
  | "guidance" 
  | "memory"
  | "focus"
  | "integrations"
  | "rituals"
  | "more"
  | "admin";

export interface ServiceEntry {
  key: string;                    // "oracle.chat", "journal.dreams"
  name: string;                   // "Oracle Chat"
  description: string;
  section: Section;
  audience: Audience;
  defaultVisible: boolean;        // visible if feature is enabled
  defaultEnabled: boolean;
  rolloutPercent?: number;        // 0–100 (cohorting)
  dependsOn?: string[];           // other service keys
  flags?: string[];               // feature flag keys
  perfCost?: "low"|"medium"|"high";
  visibilityHint?: "beta"|"experimental"|"ga";
  routes?: { primary?: string; alt?: string[]; inChat?: string[] };
  entryPoints?: ("home-card"|"composer-plus"|"slash"|"settings"|"admin")[];
  rlsTables?: string[];           // for ops/audit display
  icon?: string;                  // e.g. "Sparkles", "Moon"
  order?: number;                 // sort within section
}

// Canonical Services Registry
export const SERVICES: ServiceEntry[] = [
  // ──── Core Conversation ────────────────────────────────────────────────────
  {
    key: "oracle.chat",
    name: "Oracle Chat",
    description: "Core conversation with recap & weave integration.",
    section: "core",
    audience: "both",
    defaultVisible: true,
    defaultEnabled: true,
    flags: ["weave_pipeline"],
    perfCost: "low",
    routes: { 
      primary: "/oracle", 
      alt: ["/"],
      inChat: ["/api/oracle/turn", "/api/oracle/weave"] 
    },
    entryPoints: ["home-card","composer-plus","slash"],
    icon: "MessageCircle",
    order: 1
  },
  {
    key: "oracle.voice",
    name: "Voice Chat",
    description: "Speak with Oracle using Maya voice prompts.",
    section: "core",
    audience: "user",
    defaultVisible: true,
    defaultEnabled: false,
    flags: ["voice_maya"],
    perfCost: "medium",
    routes: { 
      primary: "/oracle",
      inChat: ["/api/oracle/voice"] 
    },
    entryPoints: ["home-card","composer-plus"],
    icon: "Mic",
    order: 2
  },

  // ──── Memory & Journaling ──────────────────────────────────────────────────
  {
    key: "journal.dreams",
    name: "Dream Journaling", 
    description: "Capture nights, lucidity, techniques; weave insights.",
    section: "memory",
    audience: "user",
    defaultVisible: true,
    defaultEnabled: false,
    flags: ["dreams"],
    dependsOn: ["oracle.chat"],   
    perfCost: "medium",
    routes: { 
      primary: "/dreams/new", 
      alt: ["/dreams"], 
      inChat: ["/api/dreams"] 
    },
    rlsTables: ["public.dreams"],
    entryPoints: ["home-card","composer-plus","slash"],
    icon: "Moon",
    order: 1
  },
  {
    key: "memory.whispers",
    name: "Quick Capture", 
    description: "Frictionless micro-memories that surface contextually.",
    section: "memory",
    audience: "user",
    defaultVisible: true,
    defaultEnabled: false,
    flags: ["whispers","micro_memories"],
    dependsOn: ["oracle.chat"],
    perfCost: "medium",
    routes: { 
      primary: "/dev/whispers", 
      inChat: ["/api/whispers","/api/micro-memories"] 
    },
    rlsTables: ["public.micro_memories","public.whisper_weights"],
    entryPoints: ["home-card","composer-plus","settings"],
    icon: "Feather",
    order: 2
  },
  {
    key: "memory.uploads",
    name: "File Uploads",
    description: "PDF, image & audio ingestion with context extraction.",
    section: "memory", 
    audience: "user",
    defaultVisible: true,
    defaultEnabled: false,
    flags: ["uploads"],
    perfCost: "high",
    routes: { 
      primary: "/oracle",
      inChat: ["/api/uploads"] 
    },
    rlsTables: ["public.uploads"],
    entryPoints: ["composer-plus"],
    icon: "Upload",
    order: 3
  },

  // ──── Focus & Neurodivergent ───────────────────────────────────────────────
  {
    key: "focus.adhd",
    name: "ADHD Mode",
    description: "Attention-friendly prompts, digests, and gentle recalls.",
    section: "focus",
    audience: "user", 
    defaultVisible: false,        
    defaultEnabled: false,
    flags: ["adhd_mode"],
    dependsOn: ["memory.whispers","oracle.voice"],
    perfCost: "low",
    routes: { primary: "/dev/adhd-mode" },
    entryPoints: ["settings","home-card"],
    icon: "Zap",
    order: 1,
    visibilityHint: "beta"
  },
  {
    key: "focus.energy",
    name: "Energy Check-ins",
    description: "Quick energy and attention state tracking.",
    section: "focus",
    audience: "user",
    defaultVisible: false,
    defaultEnabled: false,
    flags: ["adhd_mode"], // shares flag with ADHD mode
    dependsOn: ["focus.adhd"],
    perfCost: "low",
    routes: { inChat: ["/api/captures"] },
    entryPoints: ["composer-plus","home-card"],
    icon: "Activity",
    order: 2,
    visibilityHint: "beta"
  },

  // ──── Guidance & Divinations ───────────────────────────────────────────────
  {
    key: "guidance.astrology",
    name: "Astrology",
    description: "Natal & transit-aware reflections and insights.",
    section: "guidance",
    audience: "user",
    defaultVisible: false,
    defaultEnabled: false,
    perfCost: "medium",
    routes: { 
      primary: "/guidance/astrology", 
      inChat: ["/api/astrology/*"] 
    },
    entryPoints: ["home-card","composer-plus"],
    icon: "Orbit",
    order: 1,
    visibilityHint: "experimental"
  },

  // ──── Rituals & Practices ──────────────────────────────────────────────────
  {
    key: "ritual.constellations",
    name: "Constellations",
    description: "Ceremonies, badges & event-driven growth flows.",
    section: "rituals",
    audience: "user",
    defaultVisible: false,
    defaultEnabled: false,
    flags: ["beta_badges"],
    dependsOn: ["oracle.chat"],
    perfCost: "medium",
    routes: { 
      primary: "/beta/graduation",
      alt: ["/beta/badges"]
    },
    rlsTables: ["public.beta_badges","public.beta_participants"],
    entryPoints: ["home-card"],
    icon: "Stars", 
    order: 1,
    visibilityHint: "experimental"
  },
  {
    key: "ritual.facilitator",
    name: "Facilitator Tools",
    description: "Session support & orchestration for facilitators.",
    section: "rituals",
    audience: "admin",
    defaultVisible: false,
    defaultEnabled: false,
    flags: ["retreat_facilitator"],
    dependsOn: ["admin.console"],
    perfCost: "medium",
    entryPoints: ["admin"],
    icon: "Users",
    order: 2,
    visibilityHint: "experimental"
  },

  // ──── Admin & Ops ──────────────────────────────────────────────────────────
  {
    key: "admin.console",
    name: "Owner Console",
    description: "Primary admin dashboard and system overview.",
    section: "admin",
    audience: "admin",
    defaultVisible: true,
    defaultEnabled: false,
    flags: ["owner_console"],
    perfCost: "low",
    routes: { primary: "/admin/overview" },
    entryPoints: ["admin"],
    icon: "Crown",
    order: 1
  },
  {
    key: "admin.services",
    name: "Services Control",
    description: "Feature flags, services, rollout management.",
    section: "admin",
    audience: "admin", 
    defaultVisible: true,
    defaultEnabled: true, // always available for admins
    perfCost: "low",
    routes: { 
      primary: "/admin/services",
      alt: ["/admin/features"] 
    },
    entryPoints: ["admin"],
    icon: "Layers",
    order: 2
  },
  {
    key: "admin.docs",
    name: "Review Docs",
    description: "Live documentation and review bundles.",
    section: "admin",
    audience: "admin",
    defaultVisible: true,
    defaultEnabled: true,
    flags: ["admin_docs"],
    perfCost: "low",
    routes: { primary: "/admin/docs" },
    entryPoints: ["admin"],
    icon: "FileText",
    order: 3
  },
  {
    key: "admin.whispers",
    name: "Whispers Admin",
    description: "Whispers system configuration and debugging.",
    section: "admin",
    audience: "admin",
    defaultVisible: true,
    defaultEnabled: false,
    flags: ["whispers"],
    perfCost: "low",
    routes: { primary: "/admin/whispers" },
    entryPoints: ["admin"],
    icon: "Brain",
    order: 4
  }
];

// ──── Helper Functions ─────────────────────────────────────────────────────

export function getServicesBySection(): Record<Section, ServiceEntry[]> {
  const sections: Record<Section, ServiceEntry[]> = {
    core: [],
    guidance: [],
    memory: [],
    focus: [],
    integrations: [],
    rituals: [],
    more: [],
    admin: []
  };
  
  for (const service of SERVICES) {
    sections[service.section].push(service);
  }
  
  // Sort by order within each section
  for (const section of Object.keys(sections) as Section[]) {
    sections[section].sort((a, b) => (a.order || 99) - (b.order || 99));
  }
  
  return sections;
}

export function getVisibleServicesForUser(userId?: string, isAdmin = false): ServiceEntry[] {
  const flags = loadFeatureFlagsSync();
  
  return SERVICES.filter(service => {
    // Admin visibility
    if (service.audience === "admin" && !isAdmin) return false;
    if (service.audience === "user" && isAdmin === false) return true;
    
    // Check if service has required flags enabled
    if (service.flags) {
      for (const flagKey of service.flags) {
        const flag = flags[flagKey];
        if (!flag || !flag.rollout.enabled) return false;
        
        // Check cohort rollout if user provided
        if (userId && !isEnabledForUser(userId, flag)) return false;
      }
    }
    
    // Check dependencies
    if (service.dependsOn) {
      for (const depKey of service.dependsOn) {
        const depService = SERVICES.find(s => s.key === depKey);
        if (depService && depService.flags) {
          for (const flagKey of depService.flags) {
            const flag = flags[flagKey];
            if (!flag || !flag.rollout.enabled) return false;
            if (userId && !isEnabledForUser(userId, flag)) return false;
          }
        }
      }
    }
    
    return service.defaultVisible;
  });
}

export function getFeaturedServices(userId?: string, isAdmin = false): ServiceEntry[] {
  const visible = getVisibleServicesForUser(userId, isAdmin);
  
  // Featured logic: Core services + promoted high-value services
  const featured = visible.filter(service => 
    service.section === "core" || 
    (service.visibilityHint === "ga" && service.section !== "admin") ||
    (service.section === "memory" && service.defaultEnabled) // Dreams/Whispers if enabled
  );
  
  return featured.slice(0, 8); // Max 8 featured
}

export function getServiceByKey(key: string): ServiceEntry | undefined {
  return SERVICES.find(s => s.key === key);
}

export function getServicesInMore(userId?: string, isAdmin = false): ServiceEntry[] {
  const visible = getVisibleServicesForUser(userId, isAdmin);
  const featured = getFeaturedServices(userId, isAdmin);
  const featuredKeys = new Set(featured.map(s => s.key));
  
  return visible.filter(service => 
    !featuredKeys.has(service.key) && 
    service.section !== "admin"
  );
}

// ──── Section Metadata ────────────────────────────────────────────────────

export const SECTION_INFO: Record<Section, { name: string; description: string; icon: string }> = {
  core: {
    name: "Core Conversation",
    description: "Essential Oracle chat, voice, and weaving features",
    icon: "MessageCircle"
  },
  guidance: {
    name: "Guidance & Divinations", 
    description: "Astrology, I-Ching, Tarot and wisdom practices",
    icon: "Compass"
  },
  memory: {
    name: "Memory & Journaling",
    description: "Dreams, quick capture, uploads and reflection tools",
    icon: "BookOpen"
  },
  focus: {
    name: "Focus & Neurodivergent",
    description: "ADHD-friendly tools, energy check-ins and gentle recalls",
    icon: "Focus"
  },
  integrations: {
    name: "Integrations & Data",
    description: "External data sources, APIs and workflow connections",
    icon: "Link"
  },
  rituals: {
    name: "Rituals & Practices", 
    description: "Ceremonies, constellations, badges and growth practices",
    icon: "Sparkles"
  },
  more: {
    name: "More Services",
    description: "Additional features and experimental capabilities",
    icon: "MoreHorizontal"
  },
  admin: {
    name: "Admin & Operations",
    description: "System control, monitoring and configuration tools",
    icon: "Shield"
  }
};