// React Hooks for Oracle Session Management
import { useState, useEffect, useCallback } from 'react';
import { useUser, useSupabaseClient } from '@/lib/supabase-hooks';

interface ElementalBalance {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
}

interface SpiralStage {
  element: 'fire' | 'water' | 'earth' | 'air';
  stage: 1 | 2 | 3;
}

interface OracleSession {
  sessionId: string;
  timestamp: string;
  elementalBalance: ElementalBalance;
  spiralStage: SpiralStage;
  reflection: string;
  practice: string;
  archetype: string;
  query?: string;
  fullResponse?: string;
}

interface OracleJourney {
  totalSessions: number;
  dominantElement: string;
  currentStage: SpiralStage;
  evolutionPath: SpiralStage[];
  averageBalance: ElementalBalance;
  nextGuidance: string;
}

// Hook for single oracle session
export function useOracleSession() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<OracleSession | null>(null);
  const user = useUser();

  const runCascade = useCallback(async (
    query: string,
    options: { mode?: string; debug?: boolean } = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/oracle-cascade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          userId: user?.id,
          mode: options.mode || 'full',
          debug: options.debug || false
        })
      });

      if (!response.ok) {
        throw new Error('Failed to run oracle cascade');
      }

      const data: OracleSession = await response.json();
      setSession(data);
      return data;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    session,
    loading,
    error,
    runCascade
  };
}

// Hook for oracle journey (multiple sessions)
export function useOracleJourney() {
  const [journey, setJourney] = useState<OracleJourney | null>(null);
  const [sessions, setSessions] = useState<OracleSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useUser();
  const supabase = useSupabaseClient();

  const fetchJourney = useCallback(async (limit = 10) => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/oracle-cascade?userId=${user.id}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch oracle journey');
      }

      const data = await response.json();
      setJourney(data.journey);
      setSessions(data.sessions || []);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Auto-fetch on mount if user is logged in
  useEffect(() => {
    if (user?.id) {
      fetchJourney();
    }
  }, [user?.id, fetchJourney]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('oracle-sessions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'oracle_sessions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Add new session to the list
          const newSession = payload.new as any;
          setSessions(prev => [newSession, ...prev]);
          
          // Refetch journey metrics
          fetchJourney();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, supabase, fetchJourney]);

  return {
    journey,
    sessions,
    loading,
    error,
    refetch: fetchJourney
  };
}

// Hook for elemental balance animations
export function useElementalAnimation(
  targetBalance: ElementalBalance,
  duration = 1000
) {
  const [animatedBalance, setAnimatedBalance] = useState<ElementalBalance>({
    fire: 0,
    water: 0,
    earth: 0,
    air: 0,
    aether: 0
  });

  useEffect(() => {
    const startTime = Date.now();
    const startBalance = { ...animatedBalance };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3);

      const newBalance: ElementalBalance = {
        fire: startBalance.fire + (targetBalance.fire - startBalance.fire) * eased,
        water: startBalance.water + (targetBalance.water - startBalance.water) * eased,
        earth: startBalance.earth + (targetBalance.earth - startBalance.earth) * eased,
        air: startBalance.air + (targetBalance.air - startBalance.air) * eased,
        aether: startBalance.aether + (targetBalance.aether - startBalance.aether) * eased
      };

      setAnimatedBalance(newBalance);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [targetBalance, duration]);

  return animatedBalance;
}

// Hook for pattern detection across sessions
export function useOraclePatterns(sessions: OracleSession[]) {
  const [patterns, setPatterns] = useState<{
    elementalTrend: 'rising' | 'falling' | 'stable';
    dominantElement: string;
    recurringThemes: string[];
    suggestedNext: string;
  } | null>(null);

  useEffect(() => {
    if (sessions.length < 3) return;

    // Analyze last 10 sessions
    const recentSessions = sessions.slice(0, 10);

    // Calculate element trends
    const elementAverages = recentSessions.reduce((acc, session) => {
      Object.keys(session.elementalBalance).forEach(element => {
        const key = element as keyof ElementalBalance;
        acc[key] = (acc[key] || 0) + session.elementalBalance[key] / recentSessions.length;
      });
      return acc;
    }, {} as ElementalBalance);

    // Find dominant element
    const dominant = Object.entries(elementAverages)
      .sort(([,a], [,b]) => b - a)[0][0];

    // Detect trend (compare first half vs second half)
    const midpoint = Math.floor(recentSessions.length / 2);
    const firstHalf = recentSessions.slice(midpoint);
    const secondHalf = recentSessions.slice(0, midpoint);

    const firstAvg = firstHalf.reduce((sum, s) => 
      sum + s.elementalBalance[dominant as keyof ElementalBalance], 0
    ) / firstHalf.length;

    const secondAvg = secondHalf.reduce((sum, s) => 
      sum + s.elementalBalance[dominant as keyof ElementalBalance], 0
    ) / secondHalf.length;

    const trend = secondAvg > firstAvg + 0.1 ? 'rising' 
                : secondAvg < firstAvg - 0.1 ? 'falling' 
                : 'stable';

    // Extract themes from queries (if available)
    const allQueries = recentSessions
      .map(s => s.query)
      .filter(Boolean)
      .join(' ');
    
    const words = allQueries.toLowerCase().split(/\s+/);
    const wordFreq: Record<string, number> = {};
    
    words.forEach(word => {
      if (word.length > 5) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    const themes = Object.entries(wordFreq)
      .filter(([,count]) => count > 2)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);

    // Generate suggestion
    const suggestions: Record<string, string> = {
      'rising-fire': 'Your fire rises. Channel this energy into decisive action.',
      'falling-fire': 'Your fire dims. Rest and reconnect with your purpose.',
      'stable-water': 'Your waters flow steady. Trust the emotional current.',
      'rising-air': 'Your perspective expands. Seek higher understanding.',
      'stable-earth': 'You are grounded. Build on this foundation.'
    };

    const suggestionKey = `${trend}-${dominant}`;
    const suggestion = suggestions[suggestionKey] || 
      'Continue your journey with curiosity and openness.';

    setPatterns({
      elementalTrend: trend,
      dominantElement: dominant,
      recurringThemes: themes,
      suggestedNext: suggestion
    });

  }, [sessions]);

  return patterns;
}