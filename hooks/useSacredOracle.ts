// React Hook for Sacred Oracle Integration
import { useState, useCallback, useEffect } from 'react';
import { SPIRALOGIC_FACETS, getFacetById } from '@/data/spiralogic-facets';

interface OracleResponse {
  primaryFacetId: string;
  secondaryFacetIds: string[];
  elementalBalance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  interpretation: {
    essence: string;
    practice: string;
    archetype: string;
    keywords: string[];
  };
  guidance: string;
  sessionId: string;
  timestamp: string;
  facetDetails?: {
    primary: typeof SPIRALOGIC_FACETS[0];
    secondary: typeof SPIRALOGIC_FACETS[];
  };
}

interface CheckIn {
  facetId: string;
  intensity: number;
  timestamp: string;
}

export function useSacredOracle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oracleResponse, setOracleResponse] = useState<OracleResponse | null>(null);
  const [checkIns, setCheckIns] = useState<Record<string, number>>({});
  const [sessionHistory, setSessionHistory] = useState<OracleResponse[]>([]);

  // Consult the Oracle with query and current check-ins
  const consultOracle = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/oracle-sacred', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          checkIns,
          userId: localStorage.getItem('userId') // Optional user tracking
        })
      });

      if (!response.ok) {
        throw new Error('Oracle consultation failed');
      }

      const data: OracleResponse = await response.json();
      
      // Enrich with local facet data if not provided
      if (!data.facetDetails) {
        data.facetDetails = {
          primary: getFacetById(data.primaryFacetId),
          secondary: data.secondaryFacetIds.map(id => getFacetById(id))
        };
      }

      setOracleResponse(data);
      setSessionHistory(prev => [...prev, data].slice(-10)); // Keep last 10

      // Auto-activate the primary facet in check-ins
      if (data.primaryFacetId) {
        setCheckIns(prev => ({
          ...prev,
          [data.primaryFacetId]: 1
        }));
      }

      return data;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkIns]);

  // Toggle check-in for a facet
  const toggleCheckIn = useCallback((facetId: string) => {
    setCheckIns(prev => {
      const current = prev[facetId] || 0;
      const next = current === 0 ? 0.5 : current === 0.5 ? 1 : 0;
      
      if (next === 0) {
        const { [facetId]: _, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [facetId]: next };
    });
  }, []);

  // Clear all check-ins
  const clearCheckIns = useCallback(() => {
    setCheckIns({});
  }, []);

  // Get combined guidance from check-ins and oracle
  const getCombinedGuidance = useCallback(() => {
    const checkedFacets = Object.entries(checkIns)
      .filter(([_facetId, intensity]) => intensity > 0)
      .sort(([_facetIdA, a], [_facetIdB, b]) => b - a)
      .map(([facetId]) => getFacetById(facetId));

    if (checkedFacets.length === 0 && !oracleResponse) {
      return null;
    }

    // Combine user check-ins with oracle guidance
    const elements = new Set<string>();
    const practices: string[] = [];
    const keywords: string[] = [];

    // Add from check-ins
    checkedFacets.forEach(facet => {
      elements.add(facet.element);
      practices.push(facet.practice);
      keywords.push(...facet.keywords);
    });

    // Add from oracle response
    if (oracleResponse) {
      const primaryFacet = getFacetById(oracleResponse.primaryFacetId);
      elements.add(primaryFacet.element);
      practices.push(oracleResponse.interpretation.practice);
      keywords.push(...oracleResponse.interpretation.keywords);
    }

    return {
      dominantElements: Array.from(elements),
      combinedPractices: [...new Set(practices)].slice(0, 3),
      unifiedKeywords: [...new Set(keywords)].slice(0, 7),
      primaryGuidance: oracleResponse?.guidance || checkedFacets[0]?.essence || '',
      activeFacetCount: checkedFacets.length
    };
  }, [checkIns, oracleResponse]);

  // Calculate elemental balance from check-ins
  const getElementalBalance = useCallback(() => {
    const balance = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };
    let total = 0;

    Object.entries(checkIns).forEach(([facetId, intensity]) => {
      const facet = getFacetById(facetId);
      balance[facet.element as keyof typeof balance] += intensity;
      total += intensity;
    });

    // Normalize if there are check-ins
    if (total > 0) {
      Object.keys(balance).forEach(key => {
        balance[key as keyof typeof balance] /= total;
      });
    } else if (oracleResponse) {
      // Use oracle's elemental balance
      return oracleResponse.elementalBalance;
    } else {
      // Default equal balance
      return { fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2 };
    }

    return balance;
  }, [checkIns, oracleResponse]);

  // Get journey arc from session history
  const getJourneyArc = useCallback(() => {
    if (sessionHistory.length < 2) return null;

    const elements = sessionHistory.map(s => {
      const facet = getFacetById(s.primaryFacetId);
      return facet.element;
    });

    const stages = sessionHistory.map(s => {
      const facet = getFacetById(s.primaryFacetId);
      return facet.stage;
    });

    return {
      elementProgression: elements,
      stageProgression: stages,
      currentElement: elements[elements.length - 1],
      currentStage: stages[stages.length - 1],
      isDeepening: stages[stages.length - 1] > stages[0],
      isShifting: elements[elements.length - 1] !== elements[0]
    };
  }, [sessionHistory]);

  return {
    // State
    loading,
    error,
    oracleResponse,
    checkIns,
    sessionHistory,
    
    // Actions
    consultOracle,
    toggleCheckIn,
    clearCheckIns,
    
    // Computed
    combinedGuidance: getCombinedGuidance(),
    elementalBalance: getElementalBalance(),
    journeyArc: getJourneyArc()
  };
}