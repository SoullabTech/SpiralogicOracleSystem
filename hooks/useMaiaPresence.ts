"use client";

import { useState, useEffect } from "react";
import { useMaiaContext } from "./useMaiaContext";

interface PresenceConfig {
  pauseThreshold: number; // seconds before offering support
  lowCoherenceThreshold: number; // coherence level triggering support
  celebrationThreshold: number; // coherence spike for breakthrough
  quietHours: { start: number; end: number }; // less intrusive during these hours
}

const DEFAULT_CONFIG: PresenceConfig = {
  pauseThreshold: 30,
  lowCoherenceThreshold: 0.4,
  celebrationThreshold: 0.85,
  quietHours: { start: 22, end: 7 } // 10pm to 7am
};

export function useMaiaPresence(coherenceLevel: number = 0.7) {
  const { context, activity } = useMaiaContext();
  const [shouldInvite, setShouldInvite] = useState(false);
  const [invitationType, setInvitationType] = useState<string>("");
  const [lastInvitation, setLastInvitation] = useState<Date | null>(null);

  // Check if we're in quiet hours
  const isQuietHours = () => {
    const hour = new Date().getHours();
    return hour >= DEFAULT_CONFIG.quietHours.start || 
           hour < DEFAULT_CONFIG.quietHours.end;
  };

  // Determine if invitation is appropriate
  useEffect(() => {
    // Don't invite too frequently (min 5 minutes between invitations)
    if (lastInvitation) {
      const timeSinceLastInvite = Date.now() - lastInvitation.getTime();
      if (timeSinceLastInvite < 300000) return; // 5 minutes
    }

    // Context-specific invitations
    let shouldShow = false;
    let type = "";

    // 1. Pause detection (journal/reflection contexts)
    if (context === "journal" && activity.pauseDuration > DEFAULT_CONFIG.pauseThreshold * 1000) {
      shouldShow = true;
      type = "pause";
    }

    // 2. Low coherence support
    if (coherenceLevel < DEFAULT_CONFIG.lowCoherenceThreshold && !isQuietHours()) {
      shouldShow = true;
      type = "low-coherence";
    }

    // 3. Breakthrough celebration
    if (coherenceLevel > DEFAULT_CONFIG.celebrationThreshold) {
      shouldShow = true;
      type = "breakthrough";
    }

    // 4. Deep scroll engagement
    if (activity.scrollDepth > 75 && activity.focusTime > 120) {
      shouldShow = true;
      type = "deep-engagement";
    }

    // 5. Context transitions (entering sacred spaces)
    if (context === "sacred" || context === "oracle") {
      if (activity.focusTime < 5) { // Just arrived
        shouldShow = true;
        type = "sacred-welcome";
      }
    }

    // Be more subtle during quiet hours
    if (isQuietHours() && type !== "breakthrough") {
      shouldShow = false;
    }

    setShouldInvite(shouldShow);
    setInvitationType(type);

    if (shouldShow) {
      setLastInvitation(new Date());
    }
  }, [context, activity, coherenceLevel, lastInvitation]);

  return {
    shouldInvite,
    invitationType,
    suppress: () => setShouldInvite(false)
  };
}