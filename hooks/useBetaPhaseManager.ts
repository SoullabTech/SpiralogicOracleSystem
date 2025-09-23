"use client";

import { useState, useEffect, useCallback } from 'react';
import { betaExperienceManager } from '@/lib/beta/BetaExperienceManager';

interface BetaPhaseState {
  currentDay: number;
  currentPhase: 'entry' | 'journal' | 'chat' | 'integration' | 'evening';
  element: string;
  theme: string;
  entryPrompt: string;
  integrationCue: string;
  eveningCheck: string;
  weekProgress: number;
  showTransition: boolean;
  nextPhase?: 'entry' | 'journal' | 'chat' | 'integration' | 'evening';
  transitionPrompt?: string;
  canSkip: boolean;
}

interface UseBetaPhaseManagerReturn {
  betaState: BetaPhaseState | null;
  transitionToPhase: (phase: string) => void;
  skipPhase: () => void;
  markPhaseComplete: (phase: string, data?: any) => void;
  isInBetaMode: boolean;
  getBetaContext: () => string | null;
}

const PHASE_SEQUENCE: Array<'entry' | 'journal' | 'chat' | 'integration' | 'evening'> = [
  'entry', 'journal', 'chat', 'integration', 'evening'
];

export function useBetaPhaseManager(userId: string, betaMode: boolean = false): UseBetaPhaseManagerReturn {
  const [betaState, setBetaState] = useState<BetaPhaseState | null>(null);
  const [isInBetaMode, setIsInBetaMode] = useState(betaMode);

  // Initialize beta state
  useEffect(() => {
    if (!betaMode || !userId) {
      setBetaState(null);
      setIsInBetaMode(false);
      return;
    }

    setIsInBetaMode(true);
    updateBetaState();
  }, [userId, betaMode]);

  const updateBetaState = useCallback(() => {
    if (!isInBetaMode || !userId) return;

    const userState = betaExperienceManager.getUserState(userId);
    const currentDay = betaExperienceManager.getCurrentDay(userId);

    const currentPhaseIndex = PHASE_SEQUENCE.indexOf(userState.currentPhase);
    const nextPhaseIndex = currentPhaseIndex + 1;
    const nextPhase = nextPhaseIndex < PHASE_SEQUENCE.length ? PHASE_SEQUENCE[nextPhaseIndex] : undefined;

    // Determine if we should show transition
    const showTransition = shouldShowTransition(userState.currentPhase, nextPhase);

    // Get transition prompt
    const transitionPrompt = nextPhase
      ? betaExperienceManager.getTransitionPrompt(userId, userState.currentPhase, nextPhase)
      : undefined;

    // Check if current phase can be skipped
    const canSkip = nextPhase ? betaExperienceManager.canSkipPhase(userId, nextPhase) : false;

    setBetaState({
      currentDay: userState.currentDay,
      currentPhase: userState.currentPhase,
      element: currentDay.element,
      theme: currentDay.theme,
      entryPrompt: currentDay.entryPrompt,
      integrationCue: currentDay.integrationCue,
      eveningCheck: currentDay.eveningCheck,
      weekProgress: userState.weekProgress,
      showTransition,
      nextPhase,
      transitionPrompt,
      canSkip
    });
  }, [userId, isInBetaMode]);

  const shouldShowTransition = (currentPhase: string, nextPhase?: string): boolean => {
    if (!nextPhase) return false;

    const userState = betaExperienceManager.getUserState(userId);

    // Show transition based on phase completion status
    switch (currentPhase) {
      case 'entry':
        // Show transition to journal after entry (always show for first interaction)
        return true;
      case 'journal':
        // Show transition to chat after journal entry is made
        return !!userState.entryResponse;
      case 'chat':
        // Show transition to integration after chat engagement
        return userState.chatEngaged;
      case 'integration':
        // Show transition to evening after integration is complete
        return userState.practiceCompleted;
      default:
        return false;
    }
  };

  const transitionToPhase = useCallback((phase: string) => {
    if (!isInBetaMode || !userId) return;

    const validPhase = phase as 'entry' | 'journal' | 'chat' | 'integration' | 'evening';

    // Update phase in beta manager
    betaExperienceManager.updatePhase(userId, validPhase);

    // If transitioning to next day's entry, advance the day
    if (validPhase === 'entry' && betaState?.currentPhase === 'evening') {
      betaExperienceManager.advanceDay(userId);
    }

    // Update local state
    updateBetaState();
  }, [userId, isInBetaMode, betaState?.currentPhase, updateBetaState]);

  const skipPhase = useCallback(() => {
    if (!isInBetaMode || !userId || !betaState?.nextPhase) return;

    // Skip to the next phase
    transitionToPhase(betaState.nextPhase);
  }, [userId, isInBetaMode, betaState?.nextPhase, transitionToPhase]);

  const markPhaseComplete = useCallback((phase: string, data?: any) => {
    if (!isInBetaMode || !userId) return;

    const validPhase = phase as 'entry' | 'journal' | 'chat' | 'integration' | 'evening';

    // Update phase with completion data
    betaExperienceManager.updatePhase(userId, validPhase, data);

    // Update local state
    updateBetaState();
  }, [userId, isInBetaMode, updateBetaState]);

  const getBetaContext = useCallback((): string | null => {
    if (!isInBetaMode || !userId) return null;

    return betaExperienceManager.getPersonalizedMaiaPrompt(userId);
  }, [userId, isInBetaMode]);

  return {
    betaState,
    transitionToPhase,
    skipPhase,
    markPhaseComplete,
    isInBetaMode,
    getBetaContext
  };
}