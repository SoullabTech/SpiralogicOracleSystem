import { createClient } from '@supabase/supabase-js';
import { BetaConfig, DEFAULT_BETA_CONFIG, BetaConfigRow } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role for server-side config access
const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

let configCache: { config: BetaConfig; timestamp: number } | null = null;
const CACHE_TTL_MS = 30000; // 30 seconds

/**
 * Get current beta configuration with caching
 */
export async function getBetaConfig(): Promise<BetaConfig> {
  // Check cache first
  if (configCache && Date.now() - configCache.timestamp < CACHE_TTL_MS) {
    return configCache.config;
  }

  try {
    const { data, error } = await supabaseServer
      .from('beta_badges_config')
      .select('config')
      .single();

    if (error) {
      console.warn('Failed to fetch beta config, using defaults:', error);
      return DEFAULT_BETA_CONFIG;
    }

    const config = { ...DEFAULT_BETA_CONFIG, ...data.config };
    
    // Update cache
    configCache = { config, timestamp: Date.now() };
    
    return config;
  } catch (error) {
    console.warn('Beta config fetch error, using defaults:', error);
    return DEFAULT_BETA_CONFIG;
  }
}

/**
 * Update beta configuration (admin only)
 */
export async function updateBetaConfig(patch: Partial<BetaConfig>): Promise<BetaConfig> {
  try {
    // Get current config
    const currentConfig = await getBetaConfig();
    
    // Merge with patch
    const newConfig = { ...currentConfig, ...patch };
    
    // Validate the config
    if (typeof newConfig.badgesEnabled !== 'boolean') {
      throw new Error('badgesEnabled must be boolean');
    }
    if (newConfig.pathfinderDays < 1 || newConfig.pathfinderDays > 7) {
      throw new Error('pathfinderDays must be 1-7');
    }
    if (newConfig.pathfinderWindowDays < 3 || newConfig.pathfinderWindowDays > 14) {
      throw new Error('pathfinderWindowDays must be 3-14');
    }
    if (newConfig.shadowStewardMinScore < 0.5 || newConfig.shadowStewardMinScore > 0.9) {
      throw new Error('shadowStewardMinScore must be 0.5-0.9');
    }
    
    // Update in database
    const { error } = await supabaseServer
      .from('beta_badges_config')
      .update({ config: newConfig })
      .eq('id', (await supabaseServer.from('beta_badges_config').select('id').single()).data?.id);

    if (error) {
      throw error;
    }

    // Clear cache
    configCache = null;
    
    return newConfig;
  } catch (error) {
    console.error('Failed to update beta config:', error);
    throw error;
  }
}

/**
 * Get normalized thresholds for badge engine
 */
export async function getThresholds() {
  const config = await getBetaConfig();
  
  return {
    badgesEnabled: config.badgesEnabled,
    pathfinder: {
      daysNeeded: config.pathfinderDays,
      windowDays: config.pathfinderWindowDays
    },
    shadowSteward: {
      minScore: config.shadowStewardMinScore
    },
    starterPack: config.starterPack
  };
}