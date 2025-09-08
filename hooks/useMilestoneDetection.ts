import { useState, useEffect } from 'react';

export type MilestoneType = 
  | "first-bloom" 
  | "pattern-keeper" 
  | "depth-seeker" 
  | "sacred-gardener" 
  | "wisdom-keeper";

interface MilestoneDetectionProps {
  sessionCount: number;
  hasFirstSoulprint: boolean;
  hasUsedAllElements: boolean;
  hasDeepExploration: boolean;
}

export function useMilestoneDetection({
  sessionCount,
  hasFirstSoulprint,
  hasUsedAllElements,
  hasDeepExploration,
}: MilestoneDetectionProps) {
  const [currentMilestone, setCurrentMilestone] = useState<MilestoneType | "">("");
  const [celebratedMilestones, setCelebratedMilestones] = useState<Set<MilestoneType>>(new Set());

  useEffect(() => {
    let newMilestone: MilestoneType | "" = "";

    // Check milestones in progression order
    if (hasFirstSoulprint && !celebratedMilestones.has("first-bloom")) {
      newMilestone = "first-bloom";
    } else if (sessionCount >= 5 && !celebratedMilestones.has("pattern-keeper")) {
      newMilestone = "pattern-keeper";
    } else if (hasDeepExploration && !celebratedMilestones.has("depth-seeker")) {
      newMilestone = "depth-seeker";
    } else if (hasUsedAllElements && !celebratedMilestones.has("sacred-gardener")) {
      newMilestone = "sacred-gardener";
    } else if (sessionCount >= 12 && !celebratedMilestones.has("wisdom-keeper")) {
      newMilestone = "wisdom-keeper";
    }

    if (newMilestone) {
      setCurrentMilestone(newMilestone);
    }
  }, [sessionCount, hasFirstSoulprint, hasUsedAllElements, hasDeepExploration, celebratedMilestones]);

  const dismissMilestone = () => {
    if (currentMilestone) {
      setCelebratedMilestones(prev => new Set([...prev, currentMilestone as MilestoneType]));
      setCurrentMilestone("");
    }
  };

  return {
    currentMilestone,
    dismissMilestone,
  };
}