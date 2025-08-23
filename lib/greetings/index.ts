// Greeting System - Rotating, contextual greetings for conversational Oracle
// Loads greetings.json and picks appropriate greeting based on archetype/state

import * as fs from 'fs';
import * as path from 'path';

export interface GreetingOptions {
  name?: string;
  tone?: 'default' | 'warm' | 'threshold' | 'seeker' | 'warrior' | 'mystic' | 'casual-wise' | 'auto';
  archetypeHint?: string;
  soulPhase?: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed';
  userInput?: string;
}

export interface GreetingLibrary {
  default: string[];
  warm: string[];
  threshold: string[];
  seeker: string[];
  warrior: string[];
  mystic: string[];
  'casual-wise': string[];
}

let greetingCache: GreetingLibrary | null = null;
const usedGreetings = new Map<string, Set<string>>();

/**
 * Load greetings from JSON file
 */
function loadGreetings(): GreetingLibrary {
  if (greetingCache) return greetingCache;
  
  try {
    const greetingPath = path.join(process.cwd(), 'data', 'greetings.json');
    const greetingData = fs.readFileSync(greetingPath, 'utf8');
    greetingCache = JSON.parse(greetingData) as GreetingLibrary;
    return greetingCache;
  } catch (error) {
    console.warn('Failed to load greetings.json, using fallback:', error);
    
    // Fallback greetings if file load fails
    greetingCache = {
      default: [
        "Hey {name}, good to see you.",
        "Hi {name}—glad you're here.",
        "What's up, {name}? I'm tuned in."
      ],
      warm: [
        "Hi {name}, take a breath—you're in the right place.",
        "Hey {name}, I'm listening already."
      ],
      threshold: [
        "Hi {name}, feels like you're standing at a new edge.",
        "Hey {name}, change is right at the door, isn't it?"
      ],
      seeker: [
        "Hi {name}, your curiosity has a spark—let's follow it.",
        "Hey {name}, the questions you're carrying matter."
      ],
      warrior: [
        "Hey {name}, I can hear the edge of your courage.",
        "Hi {name}, strength is moving through your words."
      ],
      mystic: [
        "Hi {name}, I catch that quiet undercurrent in what you bring.",
        "Hey {name}, something subtle is humming here."
      ],
      'casual-wise': [
        "Yo {name}, let's get into the real stuff.",
        "Hey {name}, what's stirring today?"
      ]
    };
    
    return greetingCache;
  }
}

/**
 * Pick appropriate greeting based on context
 */
export function pickGreeting(options: GreetingOptions = {}): string {
  const greetings = loadGreetings();
  const name = options.name || 
               process.env.MAYA_FORCE_NAME || 
               process.env.MAYA_DEFAULT_NAME_FALLBACK || 
               'friend';
  
  // Determine tone bucket
  let tone = options.tone || 'auto';
  
  if (tone === 'auto') {
    tone = selectAutoTone(options);
  }
  
  // Get available greetings for this tone
  const toneGreetings = greetings[tone as keyof GreetingLibrary] || greetings.default;
  
  // Select greeting with rotation logic
  const selectedGreeting = selectWithRotation(toneGreetings, tone, name);
  
  // Replace name placeholder
  const finalGreeting = selectedGreeting.replace(/{name}/g, name);
  
  // Debug log in development
  if (process.env.NODE_ENV === 'development') {
    console.debug('[greet]', finalGreeting.slice(0, 120));
  }
  
  return finalGreeting;
}

/**
 * Auto-select tone based on archetype hints and context
 */
function selectAutoTone(options: GreetingOptions): string {
  const { archetypeHint, soulPhase, sentiment, userInput } = options;
  
  // Check for threshold/transition indicators
  if (hasThresholdIndicators(soulPhase, userInput)) {
    return 'threshold';
  }
  
  // Map archetypes to tone buckets
  if (archetypeHint) {
    const archetypeMap: Record<string, string> = {
      'seeker': 'seeker',
      'explorer': 'seeker',
      'questioner': 'seeker',
      'student': 'seeker',
      
      'warrior': 'warrior',
      'challenger': 'warrior',
      'activist': 'warrior',
      'defender': 'warrior',
      'leader': 'warrior',
      
      'mystic': 'mystic',
      'sage': 'mystic',
      'oracle': 'mystic',
      'shaman': 'mystic',
      'wise_one': 'mystic',
      'hermit': 'mystic',
      
      'casual': 'casual-wise',
      'friend': 'casual-wise',
      'buddy': 'casual-wise'
    };
    
    const mappedTone = archetypeMap[archetypeHint.toLowerCase()];
    if (mappedTone) return mappedTone;
  }
  
  // Sentiment-based fallback
  if (sentiment === 'negative' || sentiment === 'mixed') {
    return 'warm';
  }
  
  return 'default';
}

/**
 * Check for threshold/transition indicators
 */
function hasThresholdIndicators(soulPhase?: string, userInput?: string): boolean {
  const thresholdKeywords = [
    'new', 'change', 'transition', 'edge', 'shift', 'threshold',
    'crossing', 'beginning', 'starting', 'ending', 'transform',
    'breakthrough', 'emergence', 'becoming', 'evolving'
  ];
  
  // Check soul phase
  if (soulPhase && thresholdKeywords.some(keyword => 
    soulPhase.toLowerCase().includes(keyword))) {
    return true;
  }
  
  // Check user input
  if (userInput && thresholdKeywords.some(keyword => 
    userInput.toLowerCase().includes(keyword))) {
    return true;
  }
  
  return false;
}

/**
 * Select greeting with rotation to avoid repetition
 */
function selectWithRotation(greetings: string[], tone: string, name: string): string {
  const cacheKey = `${tone}_${name}`;
  
  if (!usedGreetings.has(cacheKey)) {
    usedGreetings.set(cacheKey, new Set());
  }
  
  const used = usedGreetings.get(cacheKey)!;
  const available = greetings.filter(g => !used.has(g));
  
  // If all greetings have been used, reset and use all
  if (available.length === 0) {
    used.clear();
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Pick random from available
  const selected = available[Math.floor(Math.random() * available.length)];
  used.add(selected);
  
  // Keep used set manageable (max 10 entries)
  if (used.size > 10) {
    const oldest = Array.from(used)[0];
    used.delete(oldest);
  }
  
  return selected;
}

/**
 * Check if this is a first turn that should get a greeting
 */
export function shouldGreetFirstTurn(context: {
  conversationId?: string;
  messageCount?: number;
  themeExchangeCount?: number;
  isNewConversation?: boolean;
}): boolean {
  // Explicit new conversation flag
  if (context.isNewConversation) return true;
  
  // Check message count
  if (typeof context.messageCount === 'number') {
    return context.messageCount === 0 || context.messageCount === 1;
  }
  
  // Check theme exchange count (if available)
  if (typeof context.themeExchangeCount === 'number') {
    return context.themeExchangeCount === 0;
  }
  
  // Heuristic: new conversation ID suggests first turn
  if (context.conversationId) {
    // Check if conversation ID looks new (contains recent timestamp)
    const timestampMatch = context.conversationId.match(/(\d+)/);
    if (timestampMatch) {
      const timestamp = parseInt(timestampMatch[1]);
      const now = Date.now();
      const timeDiff = now - timestamp;
      // If conversation ID was created within last 30 seconds, likely first turn
      return timeDiff < 30000;
    }
  }
  
  // Default to greeting for safety
  return true;
}

/**
 * Get display name from user profile or fallback
 */
export async function getDisplayName(userId?: string): Promise<string> {
  // Check for forced name override (for testing)
  if (process.env.MAYA_FORCE_NAME) {
    return process.env.MAYA_FORCE_NAME;
  }
  
  if (!userId) {
    return process.env.MAYA_DEFAULT_NAME_FALLBACK || 'friend';
  }
  
  try {
    // Try to get from Supabase profile
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const { cookies } = await import('next/headers');
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, first_name, name')
      .eq('id', userId)
      .single();
    
    if (profile) {
      return profile.display_name || 
             profile.first_name || 
             profile.name || 
             process.env.MAYA_DEFAULT_NAME_FALLBACK || 
             'friend';
    }
  } catch (error) {
    console.warn('Failed to fetch display name:', error);
  }
  
  return process.env.MAYA_DEFAULT_NAME_FALLBACK || 'friend';
}

/**
 * Generate greeting for first turn with full context
 */
export async function generateFirstTurnGreeting(context: {
  userId?: string;
  conversationId?: string;
  archetypeHint?: string;
  soulPhase?: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed';
  userInput?: string;
  messageCount?: number;
  themeExchangeCount?: number;
}): Promise<string | null> {
  // Check if greeting should be applied
  if (!shouldGreetFirstTurn(context)) {
    return null;
  }
  
  // Get user's display name
  const name = await getDisplayName(context.userId);
  
  // Pick appropriate greeting
  const greeting = pickGreeting({
    name,
    tone: (process.env.MAYA_GREETING_TONE as any) || 'auto',
    archetypeHint: context.archetypeHint,
    soulPhase: context.soulPhase,
    sentiment: context.sentiment,
    userInput: context.userInput
  });
  
  return greeting;
}

/**
 * Reset greeting rotation for testing
 */
export function resetGreetingRotation(): void {
  usedGreetings.clear();
  greetingCache = null;
}