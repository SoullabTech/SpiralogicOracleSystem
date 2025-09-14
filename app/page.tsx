"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    // Check onboarding status
    const betaOnboarded = localStorage.getItem("betaOnboardingComplete") === "true";
    const legacyOnboarded = localStorage.getItem("sacredMirrorOnboarded") === "true";

    // If not onboarded, redirect to welcome
    if (!betaOnboarded && !legacyOnboarded) {
      router.push('/welcome');
      return;
    }

    setIsOnboarded(true);

    // If onboarded, go directly to oracle conversation
    if (betaOnboarded || legacyOnboarded) {
      router.push('/oracle-conversation');
    }
  }, [router]);

  // Show loading while checking onboarding status
  if (isOnboarded === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-purple-200 text-lg">Awakening the Oracle...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Sacred Oracle System</h1>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
        <p className="text-purple-200 text-xl">Connecting to Maya...</p>
        <p className="text-purple-300 text-sm mt-2">Preparing your personalized consciousness interface</p>
      </div>
    </div>
  );
}