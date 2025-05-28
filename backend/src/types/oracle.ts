import { z } from 'zod';

export const elementalThemeSchema = z.enum(['fire', 'water', 'earth', 'air', 'aether']);
export type ElementalTheme = z.infer<typeof elementalThemeSchema>;

export interface StoryRequest {
  focusArea: string;
  elementalTheme: ElementalTheme;
  archetype: string;
  emotionalTone?: string;
  spiralPhase?: string;
  depthLevel?: number;
}

export interface StoryResponse {
  narrative: string;
  reflections: string[];
  symbols: string[];
}

export interface OracleContext {
  elementalProfile: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  crystalFocus?: {
    type: string;
    challenges: string;
    aspirations: string;
  };
  currentPhase?: string;
}