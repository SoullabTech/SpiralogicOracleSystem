// frontend/src/utils/onboardingStorage.ts

import { supabase } from '../lib/supabase';

export interface OnboardingConfig {
  step: 1 | 2 | 3;
  oracleName: string;
  oracleVoice: string;
  completed: boolean;
  timestamp: string;
}

class OnboardingStorage {
  private readonly localStorageKey = 'spiralogic-onboarding';
  private readonly completedKey = 'spiralogic-onboarding-complete';

  // LocalStorage methods (always available)
  saveToLocal(config: OnboardingConfig): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(config));
    if (config.completed) {
      localStorage.setItem(this.completedKey, 'true');
    }
  }

  loadFromLocal(): OnboardingConfig | null {
    try {
      const saved = localStorage.getItem(this.localStorageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Failed to parse local onboarding state:', error);
      return null;
    }
  }

  isCompletedLocal(): boolean {
    return localStorage.getItem(this.completedKey) === 'true';
  }

  clearLocal(): void {
    localStorage.removeItem(this.localStorageKey);
    localStorage.removeItem(this.completedKey);
  }

  // Supabase methods (when user is authenticated)
  async saveToSupabase(config: OnboardingConfig, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_onboarding')
        .upsert({
          user_id: userId,
          oracle_name: config.oracleName,
          oracle_voice: config.oracleVoice,
          step: config.step,
          completed: config.completed,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      // Also save locally as backup
      this.saveToLocal(config);
    } catch (error) {
      console.error('Failed to save onboarding to Supabase:', error);
      // Fallback to local storage
      this.saveToLocal(config);
      throw error;
    }
  }

  async loadFromSupabase(userId: string): Promise<OnboardingConfig | null> {
    try {
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found, return null
          return null;
        }
        throw error;
      }

      return {
        step: data.step as 1 | 2 | 3,
        oracleName: data.oracle_name || '',
        oracleVoice: data.oracle_voice || '',
        completed: data.completed || false,
        timestamp: data.updated_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to load onboarding from Supabase:', error);
      // Fallback to local storage
      return this.loadFromLocal();
    }
  }

  async isCompletedSupabase(userId: string): Promise<boolean> {
    try {
      const config = await this.loadFromSupabase(userId);
      return config?.completed || false;
    } catch (error) {
      console.error('Failed to check completion status:', error);
      return this.isCompletedLocal();
    }
  }

  // Unified methods that handle both local and remote storage
  async save(config: OnboardingConfig, userId?: string): Promise<void> {
    if (userId) {
      await this.saveToSupabase(config, userId);
    } else {
      this.saveToLocal(config);
    }
  }

  async load(userId?: string): Promise<OnboardingConfig | null> {
    if (userId) {
      return await this.loadFromSupabase(userId);
    } else {
      return this.loadFromLocal();
    }
  }

  async isCompleted(userId?: string): Promise<boolean> {
    if (userId) {
      return await this.isCompletedSupabase(userId);
    } else {
      return this.isCompletedLocal();
    }
  }

  clear(): void {
    this.clearLocal();
    // Note: We don't auto-clear Supabase data for data preservation
  }
}

export const onboardingStorage = new OnboardingStorage();