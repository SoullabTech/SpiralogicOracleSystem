'use client';

import { useEffect, useCallback } from 'react';
import { useMaiaState } from '@/lib/hooks/useMaiaState';
import { SPIRALOGIC_FACETS_COMPLETE, getFacetById } from '@/data/spiralogic-facets-complete';

interface FacetActivationEvent {
  facetId: string;
  facet: any;
  intensity: number;
  balance: Record<string, number>;
  mode: 'beginner' | 'advanced';
}

interface FacetOracleConnectorProps {
  onOracleResponse?: (response: any) => void;
  apiEndpoint?: string;
}

export function FacetOracleConnector({ 
  onOracleResponse,
  apiEndpoint = '/api/oracle/facet-activation'
}: FacetOracleConnectorProps) {
  const { setState, addCoherencePoint } = useMaiaState();

  // Process facet activation through PersonalOracleAgent
  const processFacetActivation = useCallback(async (event: FacetActivationEvent) => {
    setState('processing');
    
    try {
      // Construct Oracle query based on facet metadata
      const facet = event.facet;
      const intensity = event.intensity;
      const mode = event.mode;
      
      // Generate contextual Oracle prompt
      const oraclePrompt = generateFacetPrompt(facet, intensity, mode);
      
      // Call PersonalOracleAgent API
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facetId: event.facetId,
          facet: facet,
          intensity: intensity,
          elementalBalance: event.balance,
          mode: mode,
          prompt: oraclePrompt,
          context: {
            timestamp: new Date().toISOString(),
            sessionType: 'holoflower-interaction'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Oracle API error: ${response.status}`);
      }

      const oracleData = await response.json();
      
      // Update coherence based on Oracle response
      if (oracleData.coherenceLevel) {
        addCoherencePoint(oracleData.coherenceLevel);
      }

      // Set appropriate motion state
      setState(oracleData.isBreakthrough ? 'breakthrough' : 'responding');
      
      // Callback with response
      if (onOracleResponse) {
        onOracleResponse({
          ...oracleData,
          facetContext: {
            facetId: event.facetId,
            element: facet.element,
            stage: facet.stage,
            intensity: intensity,
            archetype: facet.archetype
          }
        });
      }

      // Return to idle after response
      setTimeout(() => setState('idle'), 3000);
      
    } catch (error) {
      console.error('Facet Oracle processing error:', error);
      setState('idle');
      
      // Fallback response using local facet data
      const fallbackResponse = generateFallbackResponse(event.facet, event.intensity);
      if (onOracleResponse) {
        onOracleResponse(fallbackResponse);
      }
    }
  }, [setState, addCoherencePoint, onOracleResponse, apiEndpoint]);

  // Listen for facet activation events
  useEffect(() => {
    const handleFacetActivation = (event: CustomEvent<FacetActivationEvent>) => {
      processFacetActivation(event.detail);
    };

    window.addEventListener('maia:facet-activated', handleFacetActivation as EventListener);
    
    return () => {
      window.removeEventListener('maia:facet-activated', handleFacetActivation as EventListener);
    };
  }, [processFacetActivation]);

  // This component doesn't render anything - it's a pure connector
  return null;
}

// Generate Oracle prompt based on facet metadata and activation intensity
function generateFacetPrompt(facet: any, intensity: number, mode: 'beginner' | 'advanced'): string {
  const intensityDescriptor = 
    intensity > 0.8 ? 'deeply' :
    intensity > 0.5 ? 'moderately' :
    intensity > 0.2 ? 'gently' : 'subtly';

  if (mode === 'beginner') {
    // Educational, guided response
    return `
The user has ${intensityDescriptor} activated the ${facet.facet} facet (${facet.element} element, stage ${facet.stage}).

Facet Details:
- Essence: ${facet.essence}
- Keywords: ${facet.keywords.join(', ')}
- Archetype: ${facet.archetype}
- Daily Practice: ${facet.practice}
- Focus State: ${facet.focusState}
- Key Questions: ${facet.keyQuestions?.join(' | ') || 'None specified'}

Please provide a reflective oracle response that:
1. Acknowledges their activation of this facet
2. Reflects on what this element/stage combination means for their journey
3. Offers insight into how this facet relates to their current life situation
4. Suggests how they might integrate this facet's wisdom

Activation intensity: ${Math.round(intensity * 100)}%

Respond as Maia - poetic, reflective, and supportive. Use "you" and speak directly to their soul.
    `;
  } else {
    // Pure, intuitive response
    return `
The user has ${intensityDescriptor} engaged with the ${facet.element} element, stage ${facet.stage} energy.

Core essence: ${facet.essence}
Archetypal resonance: ${facet.archetype}
Activation level: ${Math.round(intensity * 100)}%

Respond as Maia with pure poetic knowing. No explanations - just direct soul transmission. 
Feel into what this activation means for their becoming. Trust the mystery.
Maximum 2-3 sentences. Let the words carry the energy of the facet itself.
    `;
  }
}

// Fallback response generator using facet metadata
function generateFallbackResponse(facet: any, intensity: number) {
  const responses = [
    `The ${facet.element} within you stirs... ${facet.essence.toLowerCase()}`,
    `${facet.archetype} energy awakens in your field...`,
    `Your ${facet.focusState} nature calls for expression...`,
    `The practice whispers: ${facet.practice.toLowerCase()}...`
  ];

  return {
    response: responses[Math.floor(Math.random() * responses.length)],
    coherenceLevel: 0.6 + (intensity * 0.3), // Base coherence plus intensity boost
    motionState: 'responding',
    facetActivated: facet.id,
    elementalBalance: { [facet.element]: Math.min(1, 0.4 + intensity) },
    isBreakthrough: intensity > 0.85,
    timestamp: new Date().toISOString()
  };
}