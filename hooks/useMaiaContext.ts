"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface MaiaContextData {
  context: string;
  activity: {
    lastInteraction: Date | null;
    pauseDuration: number;
    scrollDepth: number;
    focusTime: number;
  };
  patterns: {
    visitFrequency: Map<string, number>;
    timeOfDay: "morning" | "afternoon" | "evening" | "night";
    sessionLength: number;
  };
}

export function useMaiaContext() {
  const pathname = usePathname();
  const [activity, setActivity] = useState({
    lastInteraction: null as Date | null,
    pauseDuration: 0,
    scrollDepth: 0,
    focusTime: 0
  });

  // Determine context from path
  const getContext = () => {
    if (pathname.includes("/journal")) return "journal";
    if (pathname.includes("/check-in")) return "check-in";
    if (pathname.includes("/timeline")) return "timeline";
    if (pathname.includes("/overview")) return "overview";
    if (pathname.includes("/oracle")) return "oracle";
    if (pathname.includes("/sacred")) return "sacred";
    return "general";
  };

  // Track user activity patterns
  useEffect(() => {
    let focusTimer: NodeJS.Timeout;
    let pauseTimer: NodeJS.Timeout;
    let lastActivity = Date.now();

    const trackActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;
      
      // Detect pause (no activity for 15+ seconds)
      if (timeSinceLastActivity > 15000) {
        setActivity(prev => ({
          ...prev,
          pauseDuration: timeSinceLastActivity,
          lastInteraction: new Date(lastActivity)
        }));
      }
      
      lastActivity = now;
    };

    // Track scroll depth
    const trackScroll = () => {
      const scrollPercentage = (window.scrollY / 
        (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setActivity(prev => ({ ...prev, scrollDepth: scrollPercentage }));
      trackActivity();
    };

    // Track focus time
    const trackFocus = () => {
      focusTimer = setInterval(() => {
        setActivity(prev => ({ ...prev, focusTime: prev.focusTime + 1 }));
      }, 1000);
    };

    // Event listeners
    window.addEventListener("scroll", trackScroll);
    window.addEventListener("click", trackActivity);
    window.addEventListener("keydown", trackActivity);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearInterval(focusTimer);
      } else {
        trackFocus();
      }
    });

    trackFocus();

    return () => {
      window.removeEventListener("scroll", trackScroll);
      window.removeEventListener("click", trackActivity);
      window.removeEventListener("keydown", trackActivity);
      clearInterval(focusTimer);
      clearTimeout(pauseTimer);
    };
  }, [pathname]);

  return {
    context: getContext(),
    activity
  };
}