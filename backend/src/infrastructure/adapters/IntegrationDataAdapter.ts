/**
 * Integration Data Infrastructure Adapter
 * Moved from SupabaseIntegrationService - pure data access layer
 */

import { SupabaseAdapter } from "./SupabaseAdapter";
import type {
  UserHolisticProfile,
  HolisticDomain,
  DevelopmentStage,
  UserState,
} from "../../domain/types/integration";

export interface IntegrationDataAdapter {
  // User Profiles
  createUserProfile(userId: string, profileData: any): Promise<any>;
  getUserProfile(userId: string): Promise<any>;
  updateUserProfile(userId: string, updates: any): Promise<any>;
  
  // Domain Profiles
  createDomainProfile(userId: string, domain: HolisticDomain, profileData: any): Promise<any>;
  getDomainProfiles(userId: string): Promise<any[]>;
  updateDomainProfile(userId: string, domain: HolisticDomain, updates: any): Promise<any>;
  
  // Spiral Progress
  createSpiralProgress(userId: string, progressData: any): Promise<any>;
  getSpiralProgress(userId: string): Promise<any[]>;
  validateSpiralProgress(spiralId: string, validatorId: string): Promise<any>;
  
  // Integration Journeys
  createIntegrationJourney(userId: string, journeyData: any): Promise<any>;
  getIntegrationJourneys(userId: string): Promise<any[]>;
  updateIntegrationJourney(journeyId: string, updates: any): Promise<any>;
  
  // Embodied Wisdom
  createEmbodiedWisdom(userId: string, wisdomData: any): Promise<any>;
  getEmbodiedWisdom(userId: string, type?: string): Promise<any[]>;
  validateEmbodiedWisdom(wisdomId: string, validationNotes: string): Promise<any>;
  
  // Bypassing Detection
  createBypassingDetection(userId: string, detectionData: any): Promise<any>;
  getBypassingDetections(userId: string, unaddressedOnly?: boolean): Promise<any[]>;
  addressBypassingDetection(detectionId: string, resolutionNotes: string): Promise<any>;
  
  // Integration Gates
  createIntegrationGate(userId: string, gateData: any): Promise<any>;
  getIntegrationGates(userId: string, unlockedOnly?: boolean): Promise<any[]>;
  unlockIntegrationGate(gateId: string): Promise<any>;
  recordBypassAttempt(gateId: string): Promise<any>;
}

/**
 * Supabase implementation of IntegrationDataAdapter
 */
export class SupabaseIntegrationDataAdapter implements IntegrationDataAdapter {
  constructor(private supabaseAdapter: SupabaseAdapter) {}

  // === USER PROFILES ===
  
  async createUserProfile(userId: string, profileData: any): Promise<any> {
    return await this.supabaseAdapter.insert("user_profiles", {
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
    });
  }

  async getUserProfile(userId: string): Promise<any> {
    const results = await this.supabaseAdapter.select("user_profiles", { user_id: userId });
    return results.length > 0 ? results[0] : null;
  }

  async updateUserProfile(userId: string, updates: any): Promise<any> {
    return await this.supabaseAdapter.update("user_profiles", { user_id: userId }, updates);
  }

  // === DOMAIN PROFILES ===
  
  async createDomainProfile(userId: string, domain: HolisticDomain, profileData: any): Promise<any> {
    return await this.supabaseAdapter.insert("domain_profiles", {
      user_id: userId,
      domain,
      current_level: profileData.currentLevel,
      development_stage: profileData.developmentStage,
      strengths: profileData.strengths,
      growth_edges: profileData.growthEdges,
      practices_engaged: profileData.practicesEngaged,
      assessment_responses: profileData.assessmentResponses,
    });
  }

  async getDomainProfiles(userId: string): Promise<any[]> {
    return await this.supabaseAdapter.select("domain_profiles", { user_id: userId });
  }

  async updateDomainProfile(userId: string, domain: HolisticDomain, updates: any): Promise<any> {
    return await this.supabaseAdapter.update("domain_profiles", { user_id: userId, domain }, updates);
  }

  // === SPIRAL PROGRESS ===
  
  async createSpiralProgress(userId: string, progressData: any): Promise<any> {
    return await this.supabaseAdapter.insert("spiral_progress", {
      user_id: userId,
      theme: progressData.theme,
      depth: progressData.depth,
      phase: progressData.phase,
      visit_date: progressData.visitDate,
      previous_visits: progressData.previousVisits,
      integration_quality: progressData.integrationQuality,
      real_world_application: progressData.realWorldApplication,
      struggles_encountered: progressData.strugglesEncountered,
      ordinary_moments: progressData.ordinaryMoments,
    });
  }

  async getSpiralProgress(userId: string): Promise<any[]> {
    return await this.supabaseAdapter.select("spiral_progress", { user_id: userId });
  }

  async validateSpiralProgress(spiralId: string, validatorId: string): Promise<any> {
    return await this.supabaseAdapter.update("spiral_progress", { id: spiralId }, {
      community_validated: true,
      validated_by: validatorId,
      validation_date: new Date().toISOString(),
    });
  }

  // === INTEGRATION JOURNEYS ===
  
  async createIntegrationJourney(userId: string, journeyData: any): Promise<any> {
    return await this.supabaseAdapter.insert("integration_journeys", {
      user_id: userId,
      insight_content: journeyData.insightContent,
      content_source: journeyData.contentSource,
      real_world_applications: journeyData.realWorldApplications,
      challenges_encountered: journeyData.challengesEncountered,
      adaptations_made: journeyData.adaptationsMade,
      timeframe: journeyData.timeframe,
      ongoing_practice: journeyData.ongoingPractice,
      integration_evidence: journeyData.integrationEvidence,
    });
  }

  async getIntegrationJourneys(userId: string): Promise<any[]> {
    return await this.supabaseAdapter.select("integration_journeys", { user_id: userId });
  }

  async updateIntegrationJourney(journeyId: string, updates: any): Promise<any> {
    return await this.supabaseAdapter.update("integration_journeys", { id: journeyId }, updates);
  }

  // === EMBODIED WISDOM ===
  
  async createEmbodiedWisdom(userId: string, wisdomData: any): Promise<any> {
    return await this.supabaseAdapter.insert("embodied_wisdom", {
      user_id: userId,
      type: wisdomData.type,
      title: wisdomData.title,
      description: wisdomData.description,
      somatic_awareness: wisdomData.somaticAwareness,
      physical_practice: wisdomData.physicalPractice,
      body_wisdom: wisdomData.bodyWisdom,
      struggle_details: wisdomData.struggleDetails,
      lessons_learned: wisdomData.lessonsLearned,
      ongoing_challenges: wisdomData.ongoingChallenges,
      humility_developed: wisdomData.humilityDeveloped,
      moment_description: wisdomData.momentDescription,
      awareness_quality: wisdomData.awarenessQuality,
      practice_applied: wisdomData.practiceApplied,
      humanness_acknowledged: wisdomData.humannessAcknowledged,
      practice_name: wisdomData.practiceName,
      frequency: wisdomData.frequency,
      consistency_rating: wisdomData.consistencyRating,
      maintained_days: wisdomData.maintainedDays,
      embodiment_quality: wisdomData.embodimentQuality,
    });
  }

  async getEmbodiedWisdom(userId: string, type?: string): Promise<any[]> {
    const filters: any = { user_id: userId };
    if (type) filters.type = type;
    return await this.supabaseAdapter.select("embodied_wisdom", filters);
  }

  async validateEmbodiedWisdom(wisdomId: string, validationNotes: string): Promise<any> {
    return await this.supabaseAdapter.update("embodied_wisdom", { id: wisdomId }, {
      validated: true,
      validation_notes: validationNotes,
    });
  }

  // === BYPASSING DETECTION ===
  
  async createBypassingDetection(userId: string, detectionData: any): Promise<any> {
    return await this.supabaseAdapter.insert("bypassing_detections", {
      user_id: userId,
      pattern: detectionData.pattern,
      severity: detectionData.severity,
      trigger_events: detectionData.triggerEvents,
      behavior_indicators: detectionData.behaviorIndicators,
      pattern_frequency: detectionData.patternFrequency,
      intervention_recommended: detectionData.interventionRecommended,
      professional_referral_suggested: detectionData.professionalReferralSuggested,
    });
  }

  async getBypassingDetections(userId: string, unaddressedOnly: boolean = false): Promise<any[]> {
    const filters: any = { user_id: userId };
    if (unaddressedOnly) filters.addressed = false;
    return await this.supabaseAdapter.select("bypassing_detections", filters);
  }

  async addressBypassingDetection(detectionId: string, resolutionNotes: string): Promise<any> {
    return await this.supabaseAdapter.update("bypassing_detections", { id: detectionId }, {
      addressed: true,
      addressed_date: new Date().toISOString(),
      resolution_notes: resolutionNotes,
    });
  }

  // === INTEGRATION GATES ===
  
  async createIntegrationGate(userId: string, gateData: any): Promise<any> {
    return await this.supabaseAdapter.insert("integration_gates", {
      user_id: userId,
      content_to_unlock: gateData.contentToUnlock,
      gate_type: gateData.gateType,
      minimum_integration_days: gateData.minimumIntegrationDays,
      requirements: gateData.requirements,
      real_world_application_required: gateData.realWorldApplicationRequired,
      community_validation_required: gateData.communityValidationRequired,
    });
  }

  async getIntegrationGates(userId: string, unlockedOnly: boolean = false): Promise<any[]> {
    const filters: any = { user_id: userId };
    if (unlockedOnly) filters.unlocked = false;
    return await this.supabaseAdapter.select("integration_gates", filters);
  }

  async unlockIntegrationGate(gateId: string): Promise<any> {
    return await this.supabaseAdapter.update("integration_gates", { id: gateId }, {
      unlocked: true,
      unlocked_date: new Date().toISOString(),
    });
  }

  async recordBypassAttempt(gateId: string): Promise<any> {
    // This would require custom SQL for incrementing - simplified for now
    return await this.supabaseAdapter.update("integration_gates", { id: gateId }, {
      last_bypass_attempt: new Date().toISOString(),
    });
  }
}