import { useState, useEffect } from 'react';
import type { SpiralContext, ArchetypeData, ConversationEntry } from './types';

const defaultContext: SpiralContext = {
  relationshipStage: 'initial',
  interactionCount: 0,
  firstInteraction: Date.now()
};

export function useSpiralContext() {
  const [context, setContext] = useState<SpiralContext>(() => {
    try {
      const saved = localStorage.getItem('spiral_context');
      return saved ? JSON.parse(saved) : defaultContext;
    } catch {
      return defaultContext;
    }
  });

  const [history, setHistory] = useState<ConversationEntry[]>(() => {
    try {
      const saved = localStorage.getItem('spiral_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('spiral_context', JSON.stringify(context));
  }, [context]);

  useEffect(() => {
    localStorage.setItem('spiral_history', JSON.stringify(history));
  }, [history]);

  const updateRelationshipStage = () => {
    const newContext = { ...context };
    
    if (newContext.interactionCount > 15) {
      newContext.relationshipStage = 'deep';
    } else if (newContext.interactionCount > 8) {
      newContext.relationshipStage = 'established';
    } else if (newContext.interactionCount > 3) {
      newContext.relationshipStage = 'developing';
    } else {
      newContext.relationshipStage = 'initial';
    }
    
    setContext(newContext);
  };

  const addInteraction = (input: string, response: string, archetype: string) => {
    const newEntry: ConversationEntry = {
      timestamp: Date.now(),
      input,
      response,
      archetype
    };
    
    setHistory(prev => [...prev, newEntry]);
    setContext(prev => ({
      ...prev,
      interactionCount: prev.interactionCount + 1
    }));
    
    updateRelationshipStage();
  };

  return {
    context,
    history,
    addInteraction
  };
}

export function getArchetype(input: string): ArchetypeData {
  const inputLower = input.toLowerCase();
  
  if (inputLower.includes('emotion') || inputLower.includes('feel') || inputLower.includes('water')) {
    return {
      name: 'Siren',
      element: 'Water',
      spiralLevel: 'Spiral 1',
      alchemyPhase: 'Solutio',
      shadowPresence: 60,
      shadowSymptoms: ['Emotional overwhelm', 'Drowning in feelings', 'Boundary dissolution'],
      integratedQualities: ['Emotional intelligence', 'Intuitive flow', 'Depth of feeling'],
      color: '#3b82f6'
    };
  }
  
  if (inputLower.includes('ground') || inputLower.includes('solid') || inputLower.includes('earth')) {
    return {
      name: 'Blacksmith',
      element: 'Earth',
      spiralLevel: 'Spiral 2',
      alchemyPhase: 'Coagulatio',
      shadowPresence: 35,
      shadowSymptoms: ['Rigidity', 'Excessive control', 'Perfectionism'],
      integratedQualities: ['Groundedness', 'Form-giving', 'Material wisdom'],
      color: '#65a30d'
    };
  }
  
  if (inputLower.includes('think') || inputLower.includes('mind') || inputLower.includes('air')) {
    return {
      name: 'Alchemist',
      element: 'Air',
      spiralLevel: 'Spiral 2',
      alchemyPhase: 'Sublimatio',
      shadowPresence: 40,
      shadowSymptoms: ['Mental loops', 'Overthinking', 'Disconnection from body'],
      integratedQualities: ['Clarity of thought', 'Pattern recognition', 'Mental transmutation'],
      color: '#d8b4fe'
    };
  }
  
  if (inputLower.includes('spirit') || inputLower.includes('whole') || inputLower.includes('divine')) {
    return {
      name: 'Oracle',
      element: 'Aether',
      spiralLevel: 'Spiral 3',
      alchemyPhase: 'Coniunctio',
      shadowPresence: 25,
      shadowSymptoms: ['Spiritual bypass', 'Escapism', 'Disconnection from reality'],
      integratedQualities: ['Wholeness perception', 'Integration capacity', 'Spiritual embodiment'],
      color: '#8b5cf6'
    };
  }
  
  // Default to Phoenix
  return {
    name: 'Phoenix',
    element: 'Fire',
    spiralLevel: 'Spiral 1',
    alchemyPhase: 'Calcinatio',
    shadowPresence: 45,
    shadowSymptoms: ['Destructive impulses', 'Burning bridges', 'Uncontrolled anger'],
    integratedQualities: ['Courage', 'Catalyst energy', 'Renewal capacity'],
    color: '#ef4444'
  };
}