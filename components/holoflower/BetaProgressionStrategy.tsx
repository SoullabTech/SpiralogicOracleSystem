"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BetaHoloflower } from './BetaHoloflower';
import { MaiaRitualGuide, withMaiaRitual } from './MaiaRitualGuide';
import { QuadrantManager, createBetaSoulprint } from './QuadrantGrouping';
import { MicrocopyManager } from './SyncedPetalMicrocopy';

interface UserProgressionData {
  userId: string;
  sessionCount: number;
  totalInteractionTime: number; // minutes
  consecutiveDays: number;
  deepEngagement: boolean; // Has user spent >5min in single session
  facetCuriosity: boolean; // Has user explored tooltip/help features
  balanceAchieved: boolean; // Has achieved >80% balance score
  lastSessionDate: Date;
}

interface ProgressionMilestone {
  id: string;
  requiredSessionCount: number;
  additionalCriteria?: (userData: UserProgressionData) => boolean;
  unlocks: string[];
  celebrationMessage: string;
  maiaGuidance: string;
}

// Beta launch progression milestones
const PROGRESSION_MILESTONES: ProgressionMilestone[] = [
  {
    id: 'first_soulprint',
    requiredSessionCount: 1,
    unlocks: ['basic_insights', 'session_memory'],
    celebrationMessage: 'Your first soulprint blooms! 🌸',
    maiaGuidance: 'You\'ve created your first sacred pattern. Notice how it feels.'
  },
  {
    id: 'pattern_recognition', 
    requiredSessionCount: 3,
    unlocks: ['pattern_comparison', 'elemental_history'],
    celebrationMessage: 'Your flower remembers your patterns',
    maiaGuidance: 'I can see how your energy shifts day to day. Beautiful.'
  },
  {
    id: 'deeper_layers_hint',
    requiredSessionCount: 5,
    additionalCriteria: (user) => user.deepEngagement || user.facetCuriosity,
    unlocks: ['facet_mode_preview', 'archetype_glimpses'],
    celebrationMessage: 'Your flower has deeper petals...',
    maiaGuidance: 'Every element has layers when you\'re ready to see them.'
  },
  {
    id: 'facet_mode_unlock',
    requiredSessionCount: 8,
    additionalCriteria: (user) => user.deepEngagement && user.balanceAchieved,
    unlocks: ['full_12_facets', 'archetypal_insights', 'advanced_patterns'],
    celebrationMessage: 'The 12 Sacred Facets reveal themselves ✨',
    maiaGuidance: 'Welcome to the deeper mandala of your being.'
  },
  {
    id: 'wisdom_keeper',
    requiredSessionCount: 20,
    additionalCriteria: (user) => user.consecutiveDays >= 7,
    unlocks: ['oracle_dialogue', 'collective_patterns', 'teaching_insights'],
    celebrationMessage: 'You\'ve become a keeper of your own wisdom',
    maiaGuidance: 'Your journey becomes a gift to others who seek their path.'
  }
];

interface BetaProgressionProps {
  userId: string;
  initialUserData?: Partial<UserProgressionData>;
  onProgressionUpdate?: (milestone: ProgressionMilestone, userData: UserProgressionData) => void;
}

export const BetaProgressionStrategy: React.FC<BetaProgressionProps> = ({
  userId,
  initialUserData,
  onProgressionUpdate
}) => {
  const [userData, setUserData] = useState<UserProgressionData>({
    userId,
    sessionCount: 0,
    totalInteractionTime: 0,
    consecutiveDays: 0,
    deepEngagement: false,
    facetCuriosity: false,
    balanceAchieved: false,
    lastSessionDate: new Date(),
    ...initialUserData
  });

  const [currentMilestone, setCurrentMilestone] = useState<ProgressionMilestone | null>(null);
  const [showUnlockCelebration, setShowUnlockCelebration] = useState(false);
  const [sessionStartTime] = useState(new Date());

  // Check for milestone achievements
  useEffect(() => {
    const checkMilestones = () => {
      for (const milestone of PROGRESSION_MILESTONES) {
        const meetsSessionRequirement = userData.sessionCount >= milestone.requiredSessionCount;
        const meetsAdditionalCriteria = !milestone.additionalCriteria || 
                                       milestone.additionalCriteria(userData);
        
        if (meetsSessionRequirement && meetsAdditionalCriteria && !hasUnlockedMilestone(milestone.id)) {
          setCurrentMilestone(milestone);
          setShowUnlockCelebration(true);
          if (onProgressionUpdate) {
            onProgressionUpdate(milestone, userData);
          }
          markMilestoneUnlocked(milestone.id);
          break;
        }
      }
    };

    checkMilestones();
  }, [userData, onProgressionUpdate]);

  // Track session engagement
  const handleSessionComplete = (soulprint: any) => {
    const sessionDuration = (new Date().getTime() - sessionStartTime.getTime()) / (1000 * 60); // minutes
    
    const updatedUserData: UserProgressionData = {
      ...userData,
      sessionCount: userData.sessionCount + 1,
      totalInteractionTime: userData.totalInteractionTime + sessionDuration,
      deepEngagement: userData.deepEngagement || sessionDuration > 5,
      balanceAchieved: userData.balanceAchieved || soulprint.balanceScore > 80,
      lastSessionDate: new Date(),
      consecutiveDays: calculateConsecutiveDays(userData.lastSessionDate)
    };

    setUserData(updatedUserData);
    saveSoulprint(soulprint, updatedUserData);
  };

  const handleTooltipInteraction = () => {
    setUserData(prev => ({
      ...prev,
      facetCuriosity: true
    }));
  };

  // Get current user's available features
  const getAvailableFeatures = (): string[] => {
    const unlockedFeatures: string[] = ['basic_holoflower'];
    
    for (const milestone of PROGRESSION_MILESTONES) {
      if (userData.sessionCount >= milestone.requiredSessionCount) {
        const meetsAdditionalCriteria = !milestone.additionalCriteria || 
                                       milestone.additionalCriteria(userData);
        if (meetsAdditionalCriteria) {
          unlockedFeatures.push(...milestone.unlocks);
        }
      }
    }
    
    return unlockedFeatures;
  };

  const availableFeatures = getAvailableFeatures();
  const canAccessFacetMode = availableFeatures.includes('full_12_facets');
  const showAdvancedInsights = availableFeatures.includes('archetypal_insights');

  return (
    <div className="beta-progression-container">
      {/* Milestone Celebration Modal */}
      <AnimatePresence>
        {showUnlockCelebration && currentMilestone && (
          <MilestoneUnlockModal
            milestone={currentMilestone}
            onClose={() => setShowUnlockCelebration(false)}
          />
        )}
      </AnimatePresence>

      {/* Progress Indicator */}
      <ProgressIndicator 
        userData={userData}
        nextMilestone={getNextMilestone(userData)}
      />

      {/* Main Holoflower Interface */}
      <EnhancedBetaHoloflower
        userId={userId}
        sessionCount={userData.sessionCount}
        availableFeatures={availableFeatures}
        onSoulprintComplete={handleSessionComplete}
        onTooltipInteraction={handleTooltipInteraction}
        canAccessFacetMode={canAccessFacetMode}
      />

      {/* Advanced Features Preview */}
      {availableFeatures.includes('facet_mode_preview') && !canAccessFacetMode && (
        <FacetModeTeaser 
          onShowInterest={() => setUserData(prev => ({ ...prev, facetCuriosity: true }))}
        />
      )}
    </div>
  );
};

// Enhanced Holoflower with progression-aware features
const EnhancedBetaHoloflower: React.FC<{
  userId: string;
  sessionCount: number;
  availableFeatures: string[];
  onSoulprintComplete: (soulprint: any) => void;
  onTooltipInteraction: () => void;
  canAccessFacetMode: boolean;
}> = ({ userId, sessionCount, availableFeatures, onSoulprintComplete, onTooltipInteraction, canAccessFacetMode }) => {
  
  const showOnboarding = sessionCount === 0;
  const showPatternMemory = availableFeatures.includes('session_memory');

  return (
    <div className="enhanced-holoflower">
      <BetaHoloflower
        userId={userId}
        onSoulprintComplete={onSoulprintComplete}
        showOnboarding={showOnboarding}
      />
      
      {/* Pattern Memory Display */}
      {showPatternMemory && (
        <PatternMemoryPanel sessionCount={sessionCount} userId={userId} />
      )}
      
      {/* Mode Toggle (if facet mode unlocked) */}
      {canAccessFacetMode && (
        <ModeToggleButton />
      )}
    </div>
  );
};

// Milestone unlock celebration
const MilestoneUnlockModal: React.FC<{
  milestone: ProgressionMilestone;
  onClose: () => void;
}> = ({ milestone, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 bg-gold-divine/20 backdrop-blur-sm flex items-center justify-center p-4"
  >
    <motion.div
      initial={{ scale: 0.618, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.618, opacity: 0, y: 50 }}
      transition={{ duration: 0.618, ease: "easeOut" }}
      className="bg-white/95 backdrop-blur rounded-sacred-lg p-sacred-lg max-w-md w-full shadow-sacred-gold border border-gold-divine/30"
    >
      <div className="text-center">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 360] 
          }}
          transition={{ 
            duration: 2,
            ease: "easeInOut" 
          }}
          className="w-16 h-16 mx-auto mb-sacred-md bg-gradient-to-br from-gold-divine to-gold-amber rounded-full flex items-center justify-center"
        >
          <span className="text-2xl">🌸</span>
        </motion.div>
        
        <h3 className="type-sacred-title text-gold-divine mb-sacred-sm">
          {milestone.celebrationMessage}
        </h3>
        
        <p className="type-body-primary text-neutral-shadow mb-sacred-md">
          {milestone.maiaGuidance}
        </p>
        
        <div className="bg-gold-whisper rounded-sacred p-sacred-sm mb-sacred-md">
          <p className="type-micro-poetry text-gold-divine">
            Unlocked: {milestone.unlocks.join(', ').replace(/_/g, ' ')}
          </p>
        </div>
        
        <button
          onClick={onClose}
          className="bg-gradient-to-r from-gold-amber to-gold-divine text-white px-sacred-lg py-sacred-sm rounded-sacred hover:shadow-sacred-gold transition-all duration-300"
        >
          Continue Journey
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// Progress indicator showing user's journey
const ProgressIndicator: React.FC<{
  userData: UserProgressionData;
  nextMilestone?: ProgressionMilestone;
}> = ({ userData, nextMilestone }) => (
  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-sacred p-3 shadow-sacred-subtle">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-earth-base to-earth-glow flex items-center justify-center">
        <span className="text-white text-xs font-medium">{userData.sessionCount}</span>
      </div>
      <div>
        <div className="text-xs font-medium text-neutral-shadow">Session {userData.sessionCount}</div>
        {nextMilestone && (
          <div className="text-xs text-neutral-mystic">
            Next: {nextMilestone.celebrationMessage}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Teaser for facet mode
const FacetModeTeaser: React.FC<{ onShowInterest: () => void }> = ({ onShowInterest }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="absolute bottom-4 right-4 bg-aether-unity/10 backdrop-blur rounded-sacred p-sacred-sm border border-aether-unity/30"
  >
    <p className="type-micro-poetry text-aether-unity mb-2">
      Your flower has deeper layers...
    </p>
    <button
      onClick={onShowInterest}
      className="text-xs text-aether-unity hover:text-aether-synthesis transition-colors"
    >
      Show me more ✨
    </button>
  </motion.div>
);

// Helper functions
const calculateConsecutiveDays = (lastSessionDate: Date): number => {
  const today = new Date();
  const daysDiff = Math.floor((today.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24));
  return daysDiff <= 1 ? daysDiff + 1 : 1; // Reset if gap > 1 day
};

const hasUnlockedMilestone = (milestoneId: string): boolean => {
  // Check localStorage or backend for unlocked milestones
  const unlocked = localStorage.getItem(`milestone_${milestoneId}`);
  return unlocked === 'true';
};

const markMilestoneUnlocked = (milestoneId: string): void => {
  localStorage.setItem(`milestone_${milestoneId}`, 'true');
};

const getNextMilestone = (userData: UserProgressionData): ProgressionMilestone | undefined => {
  return PROGRESSION_MILESTONES.find(milestone => {
    const meetsSession = userData.sessionCount < milestone.requiredSessionCount;
    return meetsSession;
  });
};

const saveSoulprint = async (soulprint: any, userData: UserProgressionData) => {
  // Save to Supabase or backend
  console.log('Saving soulprint:', soulprint, 'User data:', userData);
};

const PatternMemoryPanel: React.FC<{ sessionCount: number; userId: string }> = ({ sessionCount }) => (
  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-sacred p-3 shadow-sacred-subtle max-w-48">
    <div className="text-xs font-medium text-neutral-shadow mb-2">Your Pattern</div>
    <div className="text-xs text-neutral-mystic">
      Session {sessionCount} • Growing deeper
    </div>
  </div>
);

const ModeToggleButton: React.FC = () => (
  <button className="absolute bottom-4 left-4 bg-aether-unity text-white px-sacred-md py-sacred-sm rounded-sacred text-sm hover:bg-aether-synthesis transition-colors">
    🌸 12 Facets
  </button>
);

export default BetaProgressionStrategy;