export interface BetaConfig {
  badgesEnabled: boolean;
  pathfinderDays: number;
  pathfinderWindowDays: number;
  shadowStewardMinScore: number;
  starterPack: string[];
}

export const DEFAULT_BETA_CONFIG: BetaConfig = {
  badgesEnabled: true,
  pathfinderDays: 3,
  pathfinderWindowDays: 7,
  shadowStewardMinScore: 0.7,
  starterPack: ['oracle_turn', 'voice_preview', 'holoflower_set', 'soul_memory_saved']
};

export interface BetaConfigRow {
  id: string;
  created_at: string;
  updated_at: string;
  config: BetaConfig;
}