// 🗄️ PROFILE REPOSITORY
// Infrastructure layer for profile data access, handles all database operations

import { UserProfile } from '../../domain/services/ProfileDomainService';

export interface IProfileRepository {
  getProfile(userId: string): Promise<UserProfile | null>;
  updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile>;
  createProfile(userId: string, profile: UserProfile): Promise<UserProfile>;
  deleteProfile(userId: string): Promise<void>;
  profileExists(userId: string): Promise<boolean>;
}

export class SupabaseProfileRepository implements IProfileRepository {
  private supabase: any;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from("user_profiles")
      .select("personal_guide_name, guide_gender, voice_id, guide_language, created_at, updated_at")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      throw new Error(`Failed to get user profile: ${error.message}`);
    }

    return data ? {
      personal_guide_name: data.personal_guide_name,
      guide_gender: data.guide_gender,
      voice_id: data.voice_id,
      guide_language: data.guide_language,
      created_at: data.created_at ? new Date(data.created_at) : undefined,
      updated_at: data.updated_at ? new Date(data.updated_at) : undefined
    } : null;
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    // Convert dates to ISO strings for database
    const dbUpdates = {
      ...updates,
      created_at: updates.created_at?.toISOString(),
      updated_at: updates.updated_at?.toISOString()
    };

    const { data, error } = await this.supabase
      .from("user_profiles")
      .update(dbUpdates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }

    return {
      personal_guide_name: data.personal_guide_name,
      guide_gender: data.guide_gender,
      voice_id: data.voice_id,
      guide_language: data.guide_language,
      created_at: data.created_at ? new Date(data.created_at) : undefined,
      updated_at: data.updated_at ? new Date(data.updated_at) : undefined
    };
  }

  async createProfile(userId: string, profile: UserProfile): Promise<UserProfile> {
    const dbProfile = {
      user_id: userId,
      personal_guide_name: profile.personal_guide_name,
      guide_gender: profile.guide_gender,
      voice_id: profile.voice_id,
      guide_language: profile.guide_language,
      created_at: profile.created_at?.toISOString() || new Date().toISOString(),
      updated_at: profile.updated_at?.toISOString() || new Date().toISOString()
    };

    const { data, error } = await this.supabase
      .from("user_profiles")
      .insert([dbProfile])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }

    return {
      personal_guide_name: data.personal_guide_name,
      guide_gender: data.guide_gender,
      voice_id: data.voice_id,
      guide_language: data.guide_language,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    };
  }

  async deleteProfile(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("user_profiles")
      .delete()
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete user profile: ${error.message}`);
    }
  }

  async profileExists(userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("user_profiles")
      .select("user_id")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return false;
      }
      throw new Error(`Failed to check profile existence: ${error.message}`);
    }

    return !!data;
  }
}

// Mock repository for testing
export class MockProfileRepository implements IProfileRepository {
  private profiles: Map<string, UserProfile> = new Map();

  async getProfile(userId: string): Promise<UserProfile | null> {
    return this.profiles.get(userId) || null;
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const current = this.profiles.get(userId);
    if (!current) {
      throw new Error('Profile not found');
    }

    const updated = { ...current, ...updates, updated_at: new Date() };
    this.profiles.set(userId, updated);
    return updated;
  }

  async createProfile(userId: string, profile: UserProfile): Promise<UserProfile> {
    const newProfile = { 
      ...profile, 
      created_at: new Date(), 
      updated_at: new Date() 
    };
    this.profiles.set(userId, newProfile);
    return newProfile;
  }

  async deleteProfile(userId: string): Promise<void> {
    this.profiles.delete(userId);
  }

  async profileExists(userId: string): Promise<boolean> {
    return this.profiles.has(userId);
  }

  // Testing utilities
  clear(): void {
    this.profiles.clear();
  }

  setProfile(userId: string, profile: UserProfile): void {
    this.profiles.set(userId, profile);
  }
}