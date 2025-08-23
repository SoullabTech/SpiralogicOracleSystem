/**
 * Supabase Infrastructure Adapter
 * Pure infrastructure layer for Supabase database operations
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { 
  UserHolisticProfile, 
  HolisticDomain, 
  DevelopmentStage, 
  UserState 
} from "../../domain/types/integration";

export interface SupabaseUserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  bio?: string;
  account_type: "user" | "professional" | "mentor" | "researcher" | "admin";
  professional_type?: "therapist" | "coach" | "spiritual_director" | "counselor" | "somatic_practitioner";
  current_state: UserState;
  stress_level: number;
  energy_level: number;
  integration_stage: string;
  community_visibility: string;
  professional_support_consent: boolean;
  research_participation_consent: boolean;
  professional_credentials?: any;
  verified_professional: boolean;
  created_at: string;
  updated_at: string;
  last_active: string;
}

export interface SupabaseDomainProfile {
  id: string;
  user_id: string;
  domain: HolisticDomain;
  current_level: number;
  development_stage: DevelopmentStage;
  strengths: string[];
  growth_edges: string[];
  practices_engaged: string[];
  last_assessment_date?: string;
  assessment_responses?: any;
  created_at: string;
  updated_at: string;
}

/**
 * Pure infrastructure adapter for Supabase operations
 * Contains no business logic - only data access patterns
 */
export class SupabaseAdapter {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  // === USER PROFILE OPERATIONS ===
  
  async createUserProfile(userId: string, profileData: Partial<SupabaseUserProfile>): Promise<SupabaseUserProfile> {
    const { data, error } = await this.supabase
      .from("user_profiles")
      .insert({
        user_id: userId,
        display_name: profileData.display_name,
        bio: profileData.bio,
        account_type: profileData.account_type || "user",
        professional_type: profileData.professional_type,
        current_state: profileData.current_state || "balanced",
        stress_level: profileData.stress_level || 5,
        energy_level: profileData.energy_level || 5,
        community_visibility: profileData.community_visibility || "supportive",
        professional_support_consent: profileData.professional_support_consent || false,
        research_participation_consent: profileData.research_participation_consent || false,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create user profile: ${error.message}`);
    return data;
  }

  async getUserProfile(userId: string): Promise<SupabaseUserProfile | null> {
    const { data, error } = await this.supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
    return data;
  }

  async updateUserProfile(userId: string, updates: Partial<SupabaseUserProfile>): Promise<SupabaseUserProfile> {
    const { data, error } = await this.supabase
      .from("user_profiles")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update user profile: ${error.message}`);
    return data;
  }

  // === DOMAIN PROFILE OPERATIONS ===
  
  async createDomainProfile(userId: string, domain: HolisticDomain, profileData: any): Promise<SupabaseDomainProfile> {
    const { data, error } = await this.supabase
      .from("domain_profiles")
      .insert({
        user_id: userId,
        domain,
        current_level: profileData.currentLevel,
        development_stage: profileData.developmentStage,
        strengths: profileData.strengths,
        growth_edges: profileData.growthEdges,
        practices_engaged: profileData.practicesEngaged,
        assessment_responses: profileData.assessmentResponses,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create domain profile: ${error.message}`);
    return data;
  }

  async getDomainProfiles(userId: string): Promise<SupabaseDomainProfile[]> {
    const { data, error } = await this.supabase
      .from("domain_profiles")
      .select("*")
      .eq("user_id", userId);

    if (error) throw new Error(`Failed to get domain profiles: ${error.message}`);
    return data || [];
  }

  async updateDomainProfile(userId: string, domain: HolisticDomain, updates: any): Promise<SupabaseDomainProfile> {
    const { data, error } = await this.supabase
      .from("domain_profiles")
      .update(updates)
      .eq("user_id", userId)
      .eq("domain", domain)
      .select()
      .single();

    if (error) throw new Error(`Failed to update domain profile: ${error.message}`);
    return data;
  }

  // === AUTHENTICATION OPERATIONS ===
  
  async signInWithPassword(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (error) throw new Error(`Authentication failed: ${error.message}`);
    return data;
  }

  async refreshSession(refreshToken: string) {
    const { data, error } = await this.supabase.auth.refreshSession({ 
      refresh_token: refreshToken 
    });

    if (error) throw new Error(`Session refresh failed: ${error.message}`);
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw new Error(`Sign out failed: ${error.message}`);
  }

  // === GENERIC DATA OPERATIONS ===
  
  async insert(table: string, data: any) {
    const { data: result, error } = await this.supabase
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(`Failed to insert into ${table}: ${error.message}`);
    return result;
  }

  async select(table: string, filters: Record<string, any> = {}) {
    let query = this.supabase.from(table).select("*");
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    if (error) throw new Error(`Failed to select from ${table}: ${error.message}`);
    return data || [];
  }

  async update(table: string, filters: Record<string, any>, updates: any) {
    let query = this.supabase.from(table).update(updates);
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query.select().single();
    if (error) throw new Error(`Failed to update ${table}: ${error.message}`);
    return data;
  }

  async delete(table: string, filters: Record<string, any>) {
    let query = this.supabase.from(table).delete();
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { error } = await query;
    if (error) throw new Error(`Failed to delete from ${table}: ${error.message}`);
  }

  // === UTILITY METHODS ===
  
  async hashUserId(userId: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(userId);
    const hashBuffer = await globalThis.crypto?.subtle?.digest("SHA-256", data) || new ArrayBuffer(32);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
}