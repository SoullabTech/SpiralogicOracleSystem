"use client";

import { useState, useCallback } from 'react';

interface SoulprintData {
  scores: Record<string, number>;
  milestone: string;
  coherence: number;
  elementalBalance: Record<string, number>;
  sessionDuration?: number;
  interactionCount?: number;
  totalActivation?: number;
  breakthroughMoments?: string[];
  shadowElements?: string[];
  deviceInfo?: Record<string, any>;
  sessionQuality?: 'low' | 'medium' | 'high';
}

interface Soulprint {
  id: string;
  milestone: string;
  coherence: number;
  elemental_balance: Record<string, number>;
  total_activation: number;
  breakthrough_moments: string[];
  shadow_elements: string[];
  created_at: string;
  session_duration?: number;
  interaction_count: number;
}

interface MilestoneProgression {
  id: string;
  user_id: string;
  current_milestone: string;
  milestones_completed: string[];
  total_sessions: number;
  average_coherence: number;
  highest_coherence: number;
  elemental_mastery: Record<string, number>;
  first_session_at: string;
  last_session_at: string;
  created_at: string;
  updated_at: string;
}

interface SoulprintResponse {
  success: boolean;
  soulprint: {
    id: string;
    milestone: string;
    coherence: number;
    totalActivation: number;
    createdAt: string;
  };
  message: string;
}

interface SoulprintHistoryResponse {
  success: boolean;
  soulprints: Soulprint[];
  progression: MilestoneProgression | null;
  pagination: {
    limit: number;
    offset: number;
    count: number;
  };
}

export function useSoulprint() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save a new soulprint from petal interaction
  const saveSoulprint = useCallback(async (data: SoulprintData): Promise<SoulprintResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/soulprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to save soulprint');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error saving soulprint:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's soulprint history
  const getSoulprints = useCallback(async (options?: {
    milestone?: string;
    limit?: number;
    offset?: number;
  }): Promise<SoulprintHistoryResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options?.milestone) params.append('milestone', options.milestone);
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());

      const url = `/api/soulprint${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch soulprints');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching soulprints:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get progression summary for user's spiritual journey
  const getProgressionSummary = useCallback(async (): Promise<MilestoneProgression | null> => {
    const result = await getSoulprints({ limit: 1 });
    return result?.progression || null;
  }, [getSoulprints]);

  // Calculate coherence from petal scores and elemental balance
  const calculateCoherence = useCallback((
    scores: Record<string, number>,
    elementalBalance: Record<string, number>
  ): number => {
    // Sacred coherence calculation based on elemental harmony
    const elements = ['fire', 'water', 'earth', 'air'];
    
    // Calculate variance in elemental balance (lower variance = higher coherence)
    const elementValues = elements.map(element => elementalBalance[element] || 0);
    const mean = elementValues.reduce((sum, val) => sum + val, 0) / elements.length;
    const variance = elementValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / elements.length;
    const harmony = Math.max(0, 1 - variance);

    // Factor in total activation (more engaged petals = higher potential coherence)
    const totalActivation = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const activationFactor = Math.min(1, totalActivation / 6); // Normalize to 6+ active petals

    // Combine harmony and activation for final coherence
    const baseCoherence = (harmony * 0.7) + (activationFactor * 0.3);
    
    // Apply sacred geometry bonus for highly activated states
    const bonus = totalActivation >= 8 ? 0.1 : 0; // 8+ petals = sacred completion bonus
    
    return Math.min(1, baseCoherence + bonus);
  }, []);

  // Helper to determine next milestone based on progression
  const getNextMilestone = useCallback((
    currentMilestone: string,
    averageCoherence: number,
    totalSessions: number
  ): string => {
    const milestoneOrder = [
      'first-bloom',
      'pattern-keeper', 
      'depth-seeker',
      'sacred-gardener',
      'wisdom-keeper'
    ];

    const currentIndex = milestoneOrder.indexOf(currentMilestone);
    
    // Requirements for progression
    const requirements = {
      'pattern-keeper': { minSessions: 3, minCoherence: 0.5 },
      'depth-seeker': { minSessions: 8, minCoherence: 0.6 },
      'sacred-gardener': { minSessions: 15, minCoherence: 0.7 },
      'wisdom-keeper': { minSessions: 25, minCoherence: 0.8 }
    };

    // Check if ready for next milestone
    for (let i = currentIndex + 1; i < milestoneOrder.length; i++) {
      const nextMilestone = milestoneOrder[i];
      const req = requirements[nextMilestone as keyof typeof requirements];
      
      if (req && totalSessions >= req.minSessions && averageCoherence >= req.minCoherence) {
        return nextMilestone;
      }
    }

    return currentMilestone;
  }, []);

  // Get device information for session metadata
  const getDeviceInfo = useCallback((): Record<string, any> => {
    const userAgent = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const memory = (navigator as any).deviceMemory || 'unknown';
    const cores = navigator.hardwareConcurrency || 'unknown';

    return {
      userAgent,
      isMobile,
      memory,
      cores,
      screen: {
        width: screen.width,
        height: screen.height
      },
      timestamp: Date.now()
    };
  }, []);

  return {
    saveSoulprint,
    getSoulprints,
    getProgressionSummary,
    calculateCoherence,
    getNextMilestone,
    getDeviceInfo,
    loading,
    error,
    clearError: () => setError(null)
  };
}

// Export types for external use
export type {
  SoulprintData,
  Soulprint,
  MilestoneProgression,
  SoulprintResponse,
  SoulprintHistoryResponse
};