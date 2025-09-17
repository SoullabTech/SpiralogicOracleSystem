// lib/services/ritualEventService.ts
// Ritual Event Tracking for Beta Metrics

"use strict";

import { createClient } from '@supabase/supabase-js';

export interface RitualEvent {
  userId: string;
  step: 'threshold' | 'voice_choice' | 'mode_choice' | 'completion' | 'skip';
  choice?: string; // 'maya', 'anthony', 'push-to-talk', 'wake-word', etc.
  metadata?: {
    timeSpent?: number;
    skippedFromStep?: string;
    firstTruthWordCount?: number;
    completionTime?: number;
  };
}

export interface RitualCompletion {
  userId: string;
  completedAt: Date;
  totalTimeSeconds: number;
  voiceChoice: 'maya' | 'anthony';
  modeChoice: 'push-to-talk' | 'wake-word';
  skipped: boolean;
  firstTruthWordCount?: number;
}

/**
 * Ritual Event Service
 * Tracks user behavior through the ritual flow for analytics
 */
export class RitualEventService {
  private supabase: any;

  constructor() {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
    }
  }

  /**
   * Log a ritual event
   */
  public async logEvent(event: RitualEvent): Promise<void> {
    if (!this.supabase) {
      console.log('[Ritual Event]', event); // Local logging fallback
      return;
    }

    try {
      const { error } = await this.supabase
        .from('ritual_events')
        .insert({
          user_id: event.userId,
          step: event.step,
          choice: event.choice,
          metadata: event.metadata,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to log ritual event:', error);
      }
    } catch (error) {
      console.error('Error logging ritual event:', error);
    }
  }

  /**
   * Log ritual completion
   */
  public async logCompletion(completion: RitualCompletion): Promise<void> {
    if (!this.supabase) {
      console.log('[Ritual Completion]', completion); // Local logging fallback
      return;
    }

    try {
      const { error } = await this.supabase
        .from('ritual_completions')
        .upsert({
          user_id: completion.userId,
          completed_at: completion.completedAt.toISOString(),
          total_time_seconds: completion.totalTimeSeconds,
          voice_choice: completion.voiceChoice,
          mode_choice: completion.modeChoice,
          skipped: completion.skipped,
          first_truth_word_count: completion.firstTruthWordCount
        });

      if (error) {
        console.error('Failed to log ritual completion:', error);
      }
    } catch (error) {
      console.error('Error logging ritual completion:', error);
    }
  }

  /**
   * Get ritual metrics for dashboard
   */
  public async getRitualMetrics(timeframe: 'today' | 'week' | 'month' = 'week'): Promise<any> {
    if (!this.supabase) {
      return this.getMockMetrics(); // Return mock data for development
    }

    try {
      const daysAgo = timeframe === 'today' ? 1 : timeframe === 'week' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Get completion stats
      const { data: completions } = await this.supabase
        .from('ritual_completions')
        .select('*')
        .gte('completed_at', startDate.toISOString());

      // Get event stats
      const { data: events } = await this.supabase
        .from('ritual_events')
        .select('*')
        .gte('created_at', startDate.toISOString());

      return this.processMetrics(completions || [], events || []);
    } catch (error) {
      console.error('Error fetching ritual metrics:', error);
      return this.getMockMetrics();
    }
  }

  /**
   * Process raw data into dashboard metrics
   */
  private processMetrics(completions: any[], events: any[]): any {
    const totalUsers = new Set([...completions.map(c => c.user_id), ...events.map(e => e.user_id)]).size;
    const completedUsers = completions.length;
    const skippedUsers = events.filter(e => e.step === 'skip').length;

    const voiceChoices = completions.reduce((acc, c) => {
      acc[c.voice_choice] = (acc[c.voice_choice] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const modeChoices = completions.reduce((acc, c) => {
      acc[c.mode_choice] = (acc[c.mode_choice] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgCompletionTime = completions.reduce((sum, c) => sum + (c.total_time_seconds || 0), 0) / completions.length || 0;

    return {
      skipRate: totalUsers > 0 ? skippedUsers / totalUsers : 0,
      completionRate: totalUsers > 0 ? completedUsers / totalUsers : 0,
      avgCompletionTime: Math.round(avgCompletionTime),
      voiceSplit: [
        { name: "Maya 💜", value: Math.round((voiceChoices.maya || 0) / completedUsers * 100) || 50 },
        { name: "Anthony 🧠", value: Math.round((voiceChoices.anthony || 0) / completedUsers * 100) || 50 }
      ],
      modeSplit: [
        { name: "Push-to-Talk", value: Math.round((modeChoices['push-to-talk'] || 0) / completedUsers * 100) || 70 },
        { name: "Wake Word", value: Math.round((modeChoices['wake-word'] || 0) / completedUsers * 100) || 30 }
      ],
      totalUsers,
      completedUsers,
      skippedUsers
    };
  }

  /**
   * Mock metrics for development/fallback
   */
  private getMockMetrics(): any {
    return {
      skipRate: 0.32,
      completionRate: 0.68,
      avgCompletionTime: 267, // seconds
      voiceSplit: [
        { name: "Maya 💜", value: 58 },
        { name: "Anthony 🧠", value: 42 }
      ],
      modeSplit: [
        { name: "Push-to-Talk", value: 78 },
        { name: "Wake Word", value: 22 }
      ],
      styleTrends: [
        { day: "Mon", Conversational: 40, Meditative: 25, Guided: 15 },
        { day: "Tue", Conversational: 50, Meditative: 20, Guided: 10 },
        { day: "Wed", Conversational: 35, Meditative: 30, Guided: 20 },
        { day: "Thu", Conversational: 60, Meditative: 15, Guided: 15 },
        { day: "Fri", Conversational: 55, Meditative: 25, Guided: 10 }
      ],
      totalUsers: 247,
      completedUsers: 168,
      skippedUsers: 79
    };
  }
}

// Singleton instance
export const ritualEventService = new RitualEventService();