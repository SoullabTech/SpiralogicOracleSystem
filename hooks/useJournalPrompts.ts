// React Hook for Journal Prompt Integration
// Connects the 📖 Reflect button with soulprint data and Maia's voice

import { useState, useCallback, useMemo } from 'react';
import { 
  generateJournalPrompt, 
  getPromptForQuickReflection,
  validatePromptRequest,
  type JournalPrompt,
  type JournalPromptRequest,
  type MilestoneState,
  type ContextTag 
} from '@/lib/services/journalPromptGenerator';

export interface UseJournalPromptsOptions {
  petalScores?: Record<string, number>;
  currentMilestone?: MilestoneState;
  recentSessions?: string[];
  autoDetectContext?: boolean;
}

export interface UseJournalPromptsReturn {
  currentPrompt: JournalPrompt | null;
  generateNewPrompt: (contextTag?: ContextTag) => void;
  generateQuickPrompt: (activeFacets: string[]) => void;
  isGenerating: boolean;
  promptHistory: JournalPrompt[];
  clearHistory: () => void;
  getPromptForFacet: (facetId: string) => JournalPrompt | null;
}

export function useJournalPrompts(options: UseJournalPromptsOptions = {}): UseJournalPromptsReturn {
  const {
    petalScores = {},
    currentMilestone = 'FirstBloom',
    recentSessions = [],
    autoDetectContext = true
  } = options;

  const [currentPrompt, setCurrentPrompt] = useState<JournalPrompt | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptHistory, setPromptHistory] = useState<JournalPrompt[]>([]);

  // Auto-detect context based on time and recent activity
  const detectedContext = useMemo((): ContextTag => {
    if (!autoDetectContext) return 'Morning';
    
    const hour = new Date().getHours();
    const recentActivity = recentSessions.length;
    
    // Time-based detection
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 18 && hour < 23) return 'Evening';
    
    // Activity-based detection
    if (recentActivity === 0) return 'Morning'; // First session
    if (recentActivity >= 3) return 'Integration'; // Multiple sessions
    
    return 'Transition'; // Default for midday or unclear states
  }, [autoDetectContext, recentSessions.length]);

  const generateNewPrompt = useCallback((contextTag?: ContextTag) => {
    setIsGenerating(true);
    
    try {
      const request: JournalPromptRequest = {
        petalScores,
        currentMilestone,
        contextTag: contextTag || detectedContext,
        recentOfferingSessions: recentSessions
      };

      if (!validatePromptRequest(request)) {
        console.warn('Invalid prompt request:', request);
        setIsGenerating(false);
        return;
      }

      const prompt = generateJournalPrompt(request);
      
      setCurrentPrompt(prompt);
      setPromptHistory(prev => [prompt, ...prev].slice(0, 10)); // Keep last 10 prompts
      
    } catch (error) {
      console.error('Error generating journal prompt:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [petalScores, currentMilestone, detectedContext, recentSessions]);

  const generateQuickPrompt = useCallback((activeFacets: string[]) => {
    setIsGenerating(true);
    
    try {
      const prompt = getPromptForQuickReflection(activeFacets, currentMilestone);
      
      setCurrentPrompt(prompt);
      setPromptHistory(prev => [prompt, ...prev].slice(0, 10));
      
    } catch (error) {
      console.error('Error generating quick prompt:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [currentMilestone]);

  const getPromptForFacet = useCallback((facetId: string): JournalPrompt | null => {
    try {
      const facetScores = { [facetId]: 1.0 };
      const request: JournalPromptRequest = {
        petalScores: facetScores,
        currentMilestone,
        contextTag: detectedContext,
        recentOfferingSessions: [facetId]
      };

      return generateJournalPrompt(request);
    } catch (error) {
      console.error('Error generating facet-specific prompt:', error);
      return null;
    }
  }, [currentMilestone, detectedContext]);

  const clearHistory = useCallback(() => {
    setPromptHistory([]);
  }, []);

  return {
    currentPrompt,
    generateNewPrompt,
    generateQuickPrompt,
    isGenerating,
    promptHistory,
    clearHistory,
    getPromptForFacet
  };
}

// ========== INTEGRATION EXAMPLES ==========

/**
 * Usage in a Reflect component:
 * 
 * ```tsx
 * function ReflectButton({ petalScores, milestone }) {
 *   const { 
 *     currentPrompt, 
 *     generateNewPrompt, 
 *     isGenerating 
 *   } = useJournalPrompts({
 *     petalScores,
 *     currentMilestone: milestone,
 *     recentSessions: getRecentSessionIds()
 *   });
 * 
 *   const handleReflectClick = () => {
 *     generateNewPrompt();
 *   };
 * 
 *   return (
 *     <button onClick={handleReflectClick} disabled={isGenerating}>
 *       📖 {isGenerating ? 'Listening...' : 'Reflect'}
 *     </button>
 *   );
 * }
 * ```
 */

/**
 * Usage for petal-specific prompts:
 * 
 * ```tsx
 * function PetalPrompt({ facetId }) {
 *   const { getPromptForFacet } = useJournalPrompts();
 *   
 *   const prompt = getPromptForFacet(facetId);
 *   
 *   return prompt ? (
 *     <div className="petal-prompt">
 *       <p className="maia-voice">{prompt.maiaVoice}</p>
 *       <h3>{prompt.prompt}</h3>
 *     </div>
 *   ) : null;
 * }
 * ```
 */

/**
 * Usage with milestone progression:
 * 
 * ```tsx
 * function MilestoneReflection({ currentMilestone, onPromptGenerated }) {
 *   const { generateNewPrompt, currentPrompt } = useJournalPrompts({
 *     currentMilestone,
 *     autoDetectContext: true
 *   });
 * 
 *   useEffect(() => {
 *     if (currentPrompt) {
 *       onPromptGenerated(currentPrompt);
 *     }
 *   }, [currentPrompt, onPromptGenerated]);
 * 
 *   return (
 *     <div className="milestone-reflection">
 *       {currentPrompt && (
 *         <>
 *           <p className="maia-intro">{currentPrompt.maiaVoice}</p>
 *           <blockquote>{currentPrompt.prompt}</blockquote>
 *           {currentPrompt.followUpQuestions && (
 *             <ul className="follow-ups">
 *               {currentPrompt.followUpQuestions.map((q, i) => (
 *                 <li key={i}>{q}</li>
 *               ))}
 *             </ul>
 *           )}
 *         </>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */