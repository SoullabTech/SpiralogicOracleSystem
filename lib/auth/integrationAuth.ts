"use client";

import { createBrowserClient } from "@supabase/ssr";
import { User } from "@supabase/supabase-js";
import { HolisticDomain, DevelopmentStage, UserState } from "../types/holistic";
import { getSupabaseConfig } from "../config/supabase";

export interface IntegrationUserMetadata {
  developmentStage: DevelopmentStage;
  primaryDomains: HolisticDomain[];
  currentState: UserState;
  onboardingCompleted: boolean;
  professionalSupport: boolean;
  communityParticipation: boolean;
  integrationLevel: number;
  lastAssessment?: string;
}

export interface OnboardingData {
  personalInfo: {
    displayName: string;
    bio?: string;
    professionalBackground?: string;
  };
  developmentAssessment: {
    currentChallenges: string[];
    supportSought: string[];
    experienceLevel: string;
    professionalSupportHistory: boolean;
  };
  privacySettings: {
    communityVisibility: "private" | "supportive" | "open";
    professionalSupportConsent: boolean;
    researchParticipation: boolean;
    dataRetentionPreference: number; // years
  };
  integrationCommitment: {
    reflectionPeriodConsent: boolean;
    realityCheckingConsent: boolean;
    communityAccountabilityConsent: boolean;
    professionalReferralConsent: boolean;
  };
}

export class IntegrationAuthService {
  private _supabase: any = null;
  private _config: any = null;

  constructor() {
    if (typeof window !== "undefined") {
      this._config = getSupabaseConfig();
      if (this._config.isConfigured) {
        this._supabase = createBrowserClient(
          this._config.url,
          this._config.anonKey,
        );
      }
    }
  }

  private get supabase() {
    if (!this._supabase) {
      throw new Error(
        "Supabase client not available - check environment variables or use demo mode",
      );
    }
    return this._supabase;
  }

  // Check if Supabase is properly configured
  private isSupabaseAvailable(): boolean {
    return !!(this._supabase && this._config && this._config.isConfigured);
  }

  async signUp(
    email: string,
    password: string,
    onboardingData: OnboardingData,
  ) {
    try {
      // Create user account
      const { data: authData, error: authError } =
        await this.supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: onboardingData.personalInfo.displayName,
              onboarding_completed: false,
              integration_consent: true,
            },
          },
        });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile with integration-centered data
        await this.createUserProfile(authData.user.id, onboardingData);

        // Initialize domain assessments
        await this.initializeDomainAssessments(authData.user.id);

        // Create initial integration architecture
        await this.initializeIntegrationArchitecture(authData.user.id);
      }

      return { user: authData.user, session: authData.session };
    } catch (error) {
      console.error("Integration-centered signup error:", error);
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Update last active timestamp
      if (data.user) {
        await this.updateLastActive(data.user.id);
      }

      return data;
    } catch (error) {
      console.error("Integration-centered signin error:", error);
      throw error;
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Signout error:", error);
      throw error;
    }
  }

  private async createUserProfile(
    userId: string,
    onboardingData: OnboardingData,
  ) {
    const { data, error } = await this.supabase.from("user_profiles").insert({
      user_id: userId,
      display_name: onboardingData.personalInfo.displayName,
      bio: onboardingData.personalInfo.bio,
      account_type: "user",
      current_state: this.assessInitialState(onboardingData),
      stress_level: 5, // Will be updated through assessment
      energy_level: 5, // Will be updated through assessment
      integration_stage: "initial_insight",
      community_visibility: onboardingData.privacySettings.communityVisibility,
      professional_support_consent:
        onboardingData.privacySettings.professionalSupportConsent,
      research_participation_consent:
        onboardingData.privacySettings.researchParticipation,
    });

    if (error) throw error;
    return data;
  }

  private async initializeDomainAssessments(userId: string) {
    const domains: HolisticDomain[] = [
      HolisticDomain.MIND,
      HolisticDomain.BODY,
      HolisticDomain.SPIRIT,
      HolisticDomain.EMOTIONS,
    ];

    const domainProfiles = domains.map((domain) => ({
      user_id: userId,
      domain,
      current_level: 5.0, // Neutral starting point
      development_stage: "beginner" as DevelopmentStage,
      strengths: [],
      growth_edges: [],
      practices_engaged: [],
    }));

    const { error } = await this.supabase
      .from("domain_profiles")
      .insert(domainProfiles);

    if (error) throw error;
  }

  private async initializeIntegrationArchitecture(userId: string) {
    // Create initial integration gates
    const initialGates = [
      {
        user_id: userId,
        content_to_unlock: "intermediate_practices",
        gate_type: "sequential",
        minimum_integration_days: 7,
        requirements: JSON.stringify([
          {
            type: "reflection",
            description: "Complete daily reflection for one week",
            minimumDays: 7,
            completed: false,
          },
          {
            type: "reality_check",
            description: "Demonstrate real-world application",
            minimumDays: 5,
            completed: false,
          },
        ]),
        real_world_application_required: true,
        community_validation_required: false,
      },
      {
        user_id: userId,
        content_to_unlock: "advanced_integration",
        gate_type: "cumulative",
        minimum_integration_days: 30,
        requirements: JSON.stringify([
          {
            type: "embodiment",
            description: "Demonstrate sustained integration over time",
            minimumDays: 30,
            completed: false,
          },
          {
            type: "community_validation",
            description: "Receive community validation for integration",
            minimumDays: 14,
            completed: false,
          },
        ]),
        real_world_application_required: true,
        community_validation_required: true,
      },
    ];

    const { error } = await this.supabase
      .from("integration_gates")
      .insert(initialGates);

    if (error) throw error;
  }

  private assessInitialState(onboardingData: OnboardingData): UserState {
    const challenges = onboardingData.developmentAssessment.currentChallenges;

    if (challenges.includes("stress") || challenges.includes("overwhelm")) {
      return UserState.STRESSED;
    }
    if (challenges.includes("clarity") || challenges.includes("direction")) {
      return UserState.SEEKING_CLARITY;
    }
    if (challenges.includes("connection") || challenges.includes("meaning")) {
      return UserState.DISCONNECTED;
    }
    if (challenges.includes("physical") || challenges.includes("health")) {
      return UserState.PHYSICAL_CONCERNS;
    }
    if (challenges.includes("energy") || challenges.includes("motivation")) {
      return UserState.ENERGIZED;
    }

    return UserState.BALANCED;
  }

  async updateUserMetadata(
    userId: string,
    metadata: Partial<IntegrationUserMetadata>,
  ) {
    const { data, error } = await this.supabase.auth.updateUser({
      data: metadata,
    });

    if (error) throw error;
    return data;
  }

  async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from("user_profiles")
      .select(
        `
        *,
        domain_profiles(*)
      `,
      )
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserProfile(userId: string, updates: any) {
    const { data, error } = await this.supabase
      .from("user_profiles")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async updateLastActive(userId: string) {
    await this.supabase
      .from("user_profiles")
      .update({ last_active: new Date().toISOString() })
      .eq("user_id", userId);
  }

  async completeOnboarding(onboardingData: OnboardingData) {
    try {
      // Get current user
      const user = await this.getCurrentUser();
      if (!user) throw new Error("No authenticated user");

      // Update user metadata
      const { data, error } = await this.supabase.auth.updateUser({
        data: { 
          onboarding_completed: true,
          display_name: onboardingData.personalInfo.displayName,
          bio: onboardingData.personalInfo.bio,
          professional_background: onboardingData.personalInfo.professionalBackground,
        },
      });

      if (error) throw error;

      // Create/update user profile
      await this.createUserProfile(user.id, {
        display_name: onboardingData.personalInfo.displayName,
        bio: onboardingData.personalInfo.bio || "",
        professional_background: onboardingData.personalInfo.professionalBackground || "",
        current_challenges: onboardingData.developmentAssessment.currentChallenges,
        support_sought: onboardingData.developmentAssessment.supportSought,
        experience_level: onboardingData.developmentAssessment.experienceLevel,
        professional_support_history: onboardingData.developmentAssessment.professionalSupportHistory,
        community_visibility: onboardingData.privacySettings.communityVisibility,
        professional_support_consent: onboardingData.privacySettings.professionalSupportConsent,
        research_participation: onboardingData.privacySettings.researchParticipation,
        data_retention_preference: onboardingData.privacySettings.dataRetentionPreference,
        onboarding_completed: true,
      });

      return data;
    } catch (error) {
      console.error("Onboarding completion error:", error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.isSupabaseAvailable()) {
      // Return null for demo mode - user appears logged out
      return null;
    }
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    return user;
  }

  async getSession() {
    if (!this.isSupabaseAvailable()) {
      return null;
    }
    const {
      data: { session },
    } = await this.supabase.auth.getSession();
    return session;
  }

  // Professional account specific methods
  async requestProfessionalVerification(userId: string, credentials: any) {
    const { data, error } = await this.supabase
      .from("user_profiles")
      .update({
        account_type: "professional",
        professional_credentials: credentials,
        verified_professional: false, // Will be verified by admin
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createProfessionalConnection(
    userId: string,
    professionalId: string,
    connectionType: string,
    reason?: string,
  ) {
    const { data, error } = await this.supabase
      .from("professional_connections")
      .insert({
        user_id: userId,
        professional_id: professionalId,
        connection_type: connectionType,
        initiated_by: userId,
        connection_reason: reason,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Privacy and consent management
  async updatePrivacySettings(userId: string, settings: any) {
    const { data, error } = await this.supabase
      .from("user_profiles")
      .update({
        community_visibility: settings.communityVisibility,
        professional_support_consent: settings.professionalSupportConsent,
        research_participation_consent: settings.researchParticipation,
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async withdrawConsent(userId: string, consentType: string) {
    const updates: any = {};

    switch (consentType) {
      case "professional_support":
        updates.professional_support_consent = false;
        break;
      case "research_participation":
        updates.research_participation_consent = false;
        break;
      case "community_visibility":
        updates.community_visibility = "private";
        break;
    }

    const { data, error } = await this.supabase
      .from("user_profiles")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Integration-specific authentication checks
  async checkIntegrationReadiness(userId: string): Promise<{
    ready: boolean;
    blockers: string[];
    recommendations: string[];
  }> {
    const profile = await this.getUserProfile(userId);
    const blockers: string[] = [];
    const recommendations: string[] = [];

    // Check for active bypassing patterns
    const { data: bypassingDetections } = await this.supabase
      .from("bypassing_detections")
      .select("*")
      .eq("user_id", userId)
      .eq("addressed", false);

    if (bypassingDetections && bypassingDetections.length > 0) {
      blockers.push("Active spiritual bypassing patterns detected");
      recommendations.push(
        "Address current bypassing patterns before continuing",
      );
    }

    // Check for incomplete reflection gaps
    const { data: activeGaps } = await this.supabase
      .from("reflection_gaps")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "processing");

    if (activeGaps && activeGaps.length > 0) {
      blockers.push("Incomplete reflection periods");
      recommendations.push(
        "Complete current reflection gaps before accessing new content",
      );
    }

    // Check integration quality
    const integrationQuality = await this.calculateIntegrationQuality(userId);
    if (integrationQuality < 6) {
      recommendations.push("Focus on deeper integration of current insights");
    }

    return {
      ready: blockers.length === 0,
      blockers,
      recommendations,
    };
  }

  private async calculateIntegrationQuality(userId: string): Promise<number> {
    // Get embodied wisdom entries
    const { data: embodiedWisdom } = await this.supabase
      .from("embodied_wisdom")
      .select("embodiment_quality")
      .eq("user_id", userId)
      .not("embodiment_quality", "is", null);

    if (!embodiedWisdom || embodiedWisdom.length === 0) return 5;

    const avgQuality =
      embodiedWisdom.reduce(
        (sum: number, item: any) => sum + (item.embodiment_quality || 5),
        0,
      ) / embodiedWisdom.length;
    return avgQuality;
  }

  // Data export for user privacy rights
  async exportUserData(userId: string) {
    try {
      const [
        profile,
        domainProfiles,
        spiralProgress,
        integrationJourneys,
        embodiedWisdom,
        bypassingDetections,
        communityInteractions,
        contentInteractions,
      ] = await Promise.all([
        this.supabase.from("user_profiles").select("*").eq("user_id", userId),
        this.supabase.from("domain_profiles").select("*").eq("user_id", userId),
        this.supabase.from("spiral_progress").select("*").eq("user_id", userId),
        this.supabase
          .from("integration_journeys")
          .select("*")
          .eq("user_id", userId),
        this.supabase.from("embodied_wisdom").select("*").eq("user_id", userId),
        this.supabase
          .from("bypassing_detections")
          .select("*")
          .eq("user_id", userId),
        this.supabase
          .from("community_interactions")
          .select("*")
          .eq("user_id", userId),
        this.supabase
          .from("content_interactions")
          .select("*")
          .eq("user_id", userId),
      ]);

      return {
        profile: profile.data,
        domainProfiles: domainProfiles.data,
        spiralProgress: spiralProgress.data,
        integrationJourneys: integrationJourneys.data,
        embodiedWisdom: embodiedWisdom.data,
        bypassingDetections: bypassingDetections.data,
        communityInteractions: communityInteractions.data,
        contentInteractions: contentInteractions.data,
        exportDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Data export error:", error);
      throw error;
    }
  }

  // Account deletion with integration considerations
  async deleteAccount(userId: string, reason?: string) {
    try {
      // Record deletion for research purposes (anonymized)
      const userHash = await this.hashUserId(userId);
      await this.supabase.from("platform_analytics").insert({
        user_hash: userHash,
        session_data: { account_deleted: true, deletion_reason: reason },
        research_consent: false,
        data_retention_end_date: new Date().toISOString().split("T")[0],
      });

      // Delete user account (cascade will handle related data)
      const { error } = await this.supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Account deletion error:", error);
      throw error;
    }
  }

  private async hashUserId(userId: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(userId);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
}
