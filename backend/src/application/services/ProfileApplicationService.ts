// 🎯 PROFILE APPLICATION SERVICE
// Orchestration layer that coordinates between domain logic and infrastructure

import { ProfileDomainService, UserProfile } from '../../domain/services/ProfileDomainService';
import { IProfileRepository } from '../../infrastructure/repositories/ProfileRepository';
import { logger } from '../../utils/logger';
import { eventBus } from '../../core/events/EventBus';

export interface ProfileApplicationService {
  getProfile(userId: string): Promise<UserProfile>;
  updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile>;
  getProfileHealth(userId: string): Promise<any>;
  getProfileInsights(userId: string): Promise<any>;
}

export class ProfileApplicationServiceImpl implements ProfileApplicationService {
  constructor(private profileRepository: IProfileRepository) {}

  /**
   * Get user profile, creating default if not exists
   */
  async getProfile(userId: string): Promise<UserProfile> {
    try {
      // Check if profile exists
      let profile = await this.profileRepository.getProfile(userId);
      
      // Create default profile if not found
      if (!profile) {
        logger.info('Creating default profile for new user', { userId });
        
        const defaultProfile = ProfileDomainService.createDefaultProfile();
        profile = await this.profileRepository.createProfile(userId, defaultProfile);
        
        // Publish profile created event
        await eventBus.publish({
          type: 'profile.created',
          source: 'ProfileApplicationService',
          payload: { userId, profile },
          userId
        });
      }

      return profile;
    } catch (error) {
      logger.error('Failed to get user profile', { userId, error });
      throw new Error(`Unable to retrieve profile for user ${userId}`);
    }
  }

  /**
   * Update user profile with validation
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // Get current profile
      const currentProfile = await this.getProfile(userId);
      
      // Use domain service to merge and validate updates
      const mergeResult = ProfileDomainService.mergeProfileUpdates(currentProfile, updates);
      
      if (!mergeResult.success) {
        throw new Error(`Profile validation failed: ${mergeResult.errors.join(', ')}`);
      }

      // Update in repository
      const updatedProfile = await this.profileRepository.updateProfile(
        userId, 
        mergeResult.updatedProfile!
      );

      // Publish profile updated event
      await eventBus.publish({
        type: 'profile.updated',
        source: 'ProfileApplicationService',
        payload: { 
          userId, 
          updatedProfile, 
          changes: updates 
        },
        userId
      });

      logger.info('Profile updated successfully', { 
        userId, 
        changedFields: Object.keys(updates) 
      });

      return updatedProfile;
    } catch (error) {
      logger.error('Failed to update user profile', { userId, updates, error });
      throw error;
    }
  }

  /**
   * Get profile health assessment
   */
  async getProfileHealth(userId: string): Promise<any> {
    try {
      const profile = await this.getProfile(userId);
      
      const health = ProfileDomainService.assessProfileHealth(profile);
      const completeness = ProfileDomainService.calculateProfileCompleteness(profile);
      
      return {
        ...health,
        completeness,
        lastUpdated: profile.updated_at,
        userId
      };
    } catch (error) {
      logger.error('Failed to assess profile health', { userId, error });
      throw new Error(`Unable to assess profile health for user ${userId}`);
    }
  }

  /**
   * Get profile personalization insights
   */
  async getProfileInsights(userId: string): Promise<any> {
    try {
      const profile = await this.getProfile(userId);
      
      const insights = ProfileDomainService.generateProfileInsights(profile);
      const health = ProfileDomainService.assessProfileHealth(profile);
      const completeness = ProfileDomainService.calculateProfileCompleteness(profile);
      
      return {
        ...insights,
        health: health.status,
        completeness,
        profileAge: profile.created_at 
          ? Math.floor((Date.now() - profile.created_at.getTime()) / (1000 * 60 * 60 * 24))
          : 0,
        userId
      };
    } catch (error) {
      logger.error('Failed to generate profile insights', { userId, error });
      throw new Error(`Unable to generate insights for user ${userId}`);
    }
  }

  /**
   * Batch profile operations for admin/analytics
   */
  async getProfilesHealth(userIds: string[]): Promise<Record<string, any>> {
    const healthResults: Record<string, any> = {};
    
    await Promise.allSettled(
      userIds.map(async (userId) => {
        try {
          healthResults[userId] = await this.getProfileHealth(userId);
        } catch (error) {
          healthResults[userId] = { 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    return healthResults;
  }

  /**
   * Reset profile to defaults (admin function)
   */
  async resetProfileToDefaults(userId: string): Promise<UserProfile> {
    try {
      const defaultProfile = ProfileDomainService.createDefaultProfile();
      const updatedProfile = await this.profileRepository.updateProfile(userId, defaultProfile);
      
      // Publish profile reset event
      await eventBus.publish({
        type: 'profile.reset',
        source: 'ProfileApplicationService',
        payload: { userId, resetProfile: updatedProfile },
        userId
      });

      logger.warn('Profile reset to defaults', { userId });
      
      return updatedProfile;
    } catch (error) {
      logger.error('Failed to reset profile', { userId, error });
      throw new Error(`Unable to reset profile for user ${userId}`);
    }
  }

  /**
   * Delete user profile (GDPR compliance)
   */
  async deleteProfile(userId: string): Promise<void> {
    try {
      await this.profileRepository.deleteProfile(userId);
      
      // Publish profile deleted event
      await eventBus.publish({
        type: 'profile.deleted',
        source: 'ProfileApplicationService',
        payload: { userId, deletedAt: new Date().toISOString() },
        userId
      });

      logger.info('Profile deleted successfully', { userId });
    } catch (error) {
      logger.error('Failed to delete profile', { userId, error });
      throw new Error(`Unable to delete profile for user ${userId}`);
    }
  }
}