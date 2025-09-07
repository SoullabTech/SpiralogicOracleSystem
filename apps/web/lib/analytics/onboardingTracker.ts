/**
 * Onboarding Milestone Analytics Tracker
 * Tracks the 4 critical "wow moments" in Maya beta onboarding
 */

import { betaTracker } from './betaTracker';

export type OnboardingMilestone = 
  | 'torus_activated'      // User sees pulsing Tesla torus
  | 'voice_flow_complete'  // Mic → transcription → TTS loop successful
  | 'memory_recall_success' // Maya references previous input
  | 'multimodal_analyzed'; // File/URL upload analyzed

export interface MilestoneEvent {
  milestone: OnboardingMilestone;
  success: boolean;
  timeToComplete?: number; // milliseconds from session start
  metadata?: {
    attempt?: number;
    errorMessage?: string;
    context?: string;
    [key: string]: any;
  };
}

export class OnboardingTracker {
  private sessionStartTime: number = Date.now();
  private completedMilestones: Set<OnboardingMilestone> = new Set();
  private milestoneAttempts: Map<OnboardingMilestone, number> = new Map();
  private userId: string | null = null;

  constructor(userId?: string) {
    this.userId = userId || null;
    this.sessionStartTime = Date.now();
    
    // Initialize attempt counters
    this.milestoneAttempts.set('torus_activated', 0);
    this.milestoneAttempts.set('voice_flow_complete', 0);
    this.milestoneAttempts.set('memory_recall_success', 0);
    this.milestoneAttempts.set('multimodal_analyzed', 0);
  }

  /**
   * Track a milestone event
   */
  async trackMilestone(event: MilestoneEvent): Promise<void> {
    const currentAttempt = (this.milestoneAttempts.get(event.milestone) || 0) + 1;
    this.milestoneAttempts.set(event.milestone, currentAttempt);

    const timeToComplete = event.timeToComplete || (Date.now() - this.sessionStartTime);
    const isFirstSuccess = !this.completedMilestones.has(event.milestone) && event.success;

    if (event.success) {
      this.completedMilestones.add(event.milestone);
    }

    // Log to beta analytics
    try {
      await betaTracker.submitFeedback({
        rating: event.success ? 5 : 3, // Success = 5 stars, failure = 3 stars
        feedbackText: `Onboarding milestone: ${event.milestone} ${event.success ? 'completed' : 'failed'}`,
        category: 'experience',
        metadata: {
          milestoneType: event.milestone,
          success: event.success,
          attempt: currentAttempt,
          timeToComplete,
          isFirstSuccess,
          sessionStartTime: this.sessionStartTime,
          ...event.metadata
        }
      });

      // Also log as a memory event for dashboard integration
      await betaTracker.trackMemoryEvent('load', 'session', {
        success: event.success,
        latencyMs: timeToComplete,
        contextSize: JSON.stringify(event).length,
        errorMessage: event.metadata?.errorMessage,
        metadata: {
          onboardingMilestone: event.milestone,
          attempt: currentAttempt,
          isFirstSuccess,
          ...event.metadata
        }
      });

    } catch (error) {
      console.warn('Failed to track onboarding milestone:', error);
    }

    // Log locally for debugging
    console.log(`🎯 Onboarding Milestone: ${event.milestone}`, {
      success: event.success,
      attempt: currentAttempt,
      timeToComplete,
      isFirstSuccess,
      totalCompleted: this.completedMilestones.size,
      metadata: event.metadata
    });

    // Check if this completes the onboarding funnel
    if (isFirstSuccess && this.completedMilestones.size === 4) {
      await this.trackOnboardingComplete();
    }
  }

  /**
   * Convenience methods for each milestone
   */

  // Milestone 1: Torus Activated
  async trackTorusActivated(activated: boolean, metadata?: any): Promise<void> {
    await this.trackMilestone({
      milestone: 'torus_activated',
      success: activated,
      metadata: {
        torusVisible: activated,
        ...metadata
      }
    });
  }

  // Milestone 2: Voice Flow Complete
  async trackVoiceFlowComplete(success: boolean, metadata?: { 
    sttSuccess?: boolean; 
    ttsSuccess?: boolean; 
    transcriptLength?: number;
    audioQuality?: number;
  }): Promise<void> {
    await this.trackMilestone({
      milestone: 'voice_flow_complete',
      success,
      metadata: {
        voiceFlowSuccess: success,
        ...metadata
      }
    });
  }

  // Milestone 3: Memory Recall Success  
  async trackMemoryRecallSuccess(success: boolean, metadata?: {
    memoryType?: 'session' | 'journal' | 'profile';
    contextRecalled?: boolean;
    personalityConsistent?: boolean;
  }): Promise<void> {
    await this.trackMilestone({
      milestone: 'memory_recall_success',
      success,
      metadata: {
        memoryRecallSuccess: success,
        ...metadata
      }
    });
  }

  // Milestone 4: Multimodal Analyzed
  async trackMultimodalAnalyzed(success: boolean, metadata?: {
    fileType?: string;
    analysisAccuracy?: number;
    processingTime?: number;
  }): Promise<void> {
    await this.trackMilestone({
      milestone: 'multimodal_analyzed',
      success,
      metadata: {
        multimodalSuccess: success,
        ...metadata
      }
    });
  }

  /**
   * Track complete onboarding funnel success
   */
  private async trackOnboardingComplete(): Promise<void> {
    const totalTime = Date.now() - this.sessionStartTime;
    const totalAttempts = Array.from(this.milestoneAttempts.values()).reduce((sum, attempts) => sum + attempts, 0);

    try {
      await betaTracker.submitFeedback({
        rating: 5,
        feedbackText: 'Completed full onboarding flow - all milestones achieved!',
        category: 'experience',
        metadata: {
          onboardingComplete: true,
          totalTimeMs: totalTime,
          totalAttempts,
          milestonesCompleted: Array.from(this.completedMilestones),
          completionRate: 100,
          sessionStartTime: this.sessionStartTime,
          completionTimestamp: Date.now()
        }
      });

      console.log('🎉 Onboarding Complete!', {
        totalTime: Math.round(totalTime / 1000) + 's',
        totalAttempts,
        allMilestones: Array.from(this.completedMilestones)
      });

    } catch (error) {
      console.warn('Failed to track onboarding completion:', error);
    }
  }

  /**
   * Get current onboarding progress
   */
  getProgress(): {
    completed: OnboardingMilestone[];
    remaining: OnboardingMilestone[];
    completionRate: number;
    totalTime: number;
    attempts: Record<OnboardingMilestone, number>;
  } {
    const allMilestones: OnboardingMilestone[] = [
      'torus_activated',
      'voice_flow_complete', 
      'memory_recall_success',
      'multimodal_analyzed'
    ];

    const completed = Array.from(this.completedMilestones);
    const remaining = allMilestones.filter(m => !this.completedMilestones.has(m));
    const completionRate = (completed.length / allMilestones.length) * 100;
    const totalTime = Date.now() - this.sessionStartTime;

    return {
      completed,
      remaining,
      completionRate,
      totalTime,
      attempts: Object.fromEntries(this.milestoneAttempts) as Record<OnboardingMilestone, number>
    };
  }

  /**
   * Reset tracker for new session
   */
  reset(): void {
    this.sessionStartTime = Date.now();
    this.completedMilestones.clear();
    this.milestoneAttempts.clear();
    
    // Re-initialize attempt counters
    this.milestoneAttempts.set('torus_activated', 0);
    this.milestoneAttempts.set('voice_flow_complete', 0);
    this.milestoneAttempts.set('memory_recall_success', 0);
    this.milestoneAttempts.set('multimodal_analyzed', 0);
  }
}

// Singleton instance for easy access
export const onboardingTracker = new OnboardingTracker();

// Convenience function for quick milestone tracking
export async function trackOnboardingMilestone(
  milestone: OnboardingMilestone, 
  success: boolean, 
  metadata?: any
): Promise<void> {
  await onboardingTracker.trackMilestone({
    milestone,
    success,
    metadata
  });
}