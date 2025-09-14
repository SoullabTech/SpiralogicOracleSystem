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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white text-lg font-light">Initializing system...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-thin text-white mb-8 tracking-wide">MAYA</h1>
        <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-white text-xl font-light">Connecting...</p>
        <p className="text-gray-400 text-sm mt-3 font-light">AI Conversation Interface</p>
      </div>
    </div>
  );
}