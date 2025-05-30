// ===============================================
// SUPABASE AUTHENTICATION FLOW
// Sacred container for user authentication
// ===============================================

import { createClient, User, Session } from '@supabase/supabase-js';
import { logger } from './logger';

// ===============================================
// SUPABASE CLIENT INITIALIZATION
// ===============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' // Enhanced security for auth flow
  }
});

// ===============================================
// AUTH STATE MANAGEMENT
// ===============================================

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  sacredUnionComplete: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  sacredName?: string;
  oracleName?: string;
  elementalResonance?: string;
  onboardingPhase?: string;
  sacredUnionData?: any;
  createdAt: Date;
  updatedAt: Date;
}

// ===============================================
// AUTHENTICATION METHODS
// ===============================================

export const auth = {
  // Sign up new user
  async signUp(email: string, password: string): Promise<{
    user: User | null;
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            // Initial metadata
            onboarding_phase: 'sacred_preparation',
            sacred_union_complete: false
          }
        }
      });

      if (error) throw error;

      // Create initial user profile
      if (data.user) {
        await createUserProfile(data.user);
      }

      return { user: data.user, error: null };
    } catch (error) {
      logger.error('Sign up failed:', error);
      return { user: null, error: error as Error };
    }
  },

  // Sign in existing user
  async signIn(email: string, password: string): Promise<{
    user: User | null;
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return { user: data.user, error: null };
    } catch (error) {
      logger.error('Sign in failed:', error);
      return { user: null, error: error as Error };
    }
  },

  // Sign in with OAuth provider
  async signInWithProvider(provider: 'google' | 'github'): Promise<{
    error: Error | null;
  }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: provider === 'github' ? 'read:user user:email' : undefined
        }
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      logger.error('OAuth sign in failed:', error);
      return { error: error as Error };
    }
  },

  // Sign out
  async signOut(): Promise<{ error: Error | null }> {
    try {
      // Clear local sacred union data
      localStorage.removeItem('sacredUnionComplete');
      localStorage.removeItem('oracleName');
      localStorage.removeItem('sacredName');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      return { error: null };
    } catch (error) {
      logger.error('Sign out failed:', error);
      return { error: error as Error };
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      logger.error('Get current user failed:', error);
      return null;
    }
  },

  // Get current session
  async getSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      logger.error('Get session failed:', error);
      return null;
    }
  },

  // Refresh session
  async refreshSession(): Promise<{
    session: Session | null;
    error: Error | null;
  }> {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      return { session, error: null };
    } catch (error) {
      logger.error('Refresh session failed:', error);
      return { session: null, error: error as Error };
    }
  },

  // Update user metadata
  async updateUserMetadata(metadata: any): Promise<{
    user: User | null;
    error: Error | null;
  }> {
    try {
      const { data: { user }, error } = await supabase.auth.updateUser({
        data: metadata
      });

      if (error) throw error;

      return { user, error: null };
    } catch (error) {
      logger.error('Update user metadata failed:', error);
      return { user: null, error: error as Error };
    }
  },

  // Reset password
  async resetPassword(email: string): Promise<{
    error: Error | null;
  }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      logger.error('Reset password failed:', error);
      return { error: error as Error };
    }
  },

  // Update password
  async updatePassword(newPassword: string): Promise<{
    user: User | null;
    error: Error | null;
  }> {
    try {
      const { data: { user }, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return { user, error: null };
    } catch (error) {
      logger.error('Update password failed:', error);
      return { user: null, error: error as Error };
    }
  }
};

// ===============================================
// USER PROFILE MANAGEMENT
// ===============================================

async function createUserProfile(user: User): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        email: user.email,
        onboarding_completed: false,
        sacred_union_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      logger.error('Failed to create user profile:', error);
    }
  } catch (error) {
    logger.error('Create user profile error:', error);
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      logger.error('Failed to get user profile:', error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    logger.error('Get user profile error:', error);
    return null;
  }
}

export async function updateUserProfile(
  userId: string, 
  updates: Partial<UserProfile>
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update user profile:', error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    logger.error('Update user profile error:', error);
    return null;
  }
}

// ===============================================
// ONBOARDING STATE MANAGEMENT
// ===============================================

export async function checkOnboardingStatus(userId: string): Promise<{
  phase: string;
  sacredUnionComplete: boolean;
  elementalAssessmentComplete: boolean;
  holoflowerCalibrated: boolean;
}> {
  try {
    const profile = await getUserProfile(userId);
    
    if (!profile) {
      return {
        phase: 'sacred_preparation',
        sacredUnionComplete: false,
        elementalAssessmentComplete: false,
        holoflowerCalibrated: false
      };
    }

    return {
      phase: profile.onboardingPhase || 'sacred_preparation',
      sacredUnionComplete: profile.sacredUnionData?.completed || false,
      elementalAssessmentComplete: !!profile.elementalResonance,
      holoflowerCalibrated: profile.sacredUnionData?.holoflowerCalibrated || false
    };
  } catch (error) {
    logger.error('Check onboarding status error:', error);
    return {
      phase: 'sacred_preparation',
      sacredUnionComplete: false,
      elementalAssessmentComplete: false,
      holoflowerCalibrated: false
    };
  }
}

export async function updateOnboardingPhase(
  userId: string, 
  phase: string,
  additionalData?: any
): Promise<boolean> {
  try {
    const updates: any = {
      onboarding_phase: phase
    };

    if (phase === 'sacred_union_complete' && additionalData) {
      updates.sacred_union_data = additionalData;
      updates.oracle_name = additionalData.oracleName;
      updates.sacred_name = additionalData.sacredName;
    }

    if (phase === 'elemental_complete' && additionalData) {
      updates.elemental_resonance = additionalData.elementalResonance;
    }

    const result = await updateUserProfile(userId, updates);
    return !!result;
  } catch (error) {
    logger.error('Update onboarding phase error:', error);
    return false;
  }
}

// ===============================================
// AUTH STATE LISTENER
// ===============================================

export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}

// ===============================================
// AUTH HELPERS
// ===============================================

export async function requireAuth(): Promise<User | null> {
  const user = await auth.getCurrentUser();
  
  if (!user) {
    window.location.href = '/auth/signin';
    return null;
  }
  
  return user;
}

export async function requireOnboarding(): Promise<boolean> {
  const user = await requireAuth();
  if (!user) return false;
  
  const status = await checkOnboardingStatus(user.id);
  
  if (!status.sacredUnionComplete) {
    window.location.href = '/onboarding/sacred-union';
    return false;
  }
  
  if (!status.elementalAssessmentComplete) {
    window.location.href = '/onboarding/elemental-assessment';
    return false;
  }
  
  if (!status.holoflowerCalibrated) {
    window.location.href = '/onboarding/holoflower-calibration';
    return false;
  }
  
  return true;
}

// Export types
export type { User, Session } from '@supabase/supabase-js';