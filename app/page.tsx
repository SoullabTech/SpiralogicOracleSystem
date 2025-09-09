"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BetaOnboarding from "@/components/BetaOnboarding";

export default function HomePage() {
  const router = useRouter();
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check onboarding status (removed beta gate requirement)
    const betaOnboarded = localStorage.getItem("betaOnboardingComplete") === "true";
    const legacyOnboarded = localStorage.getItem("sacredMirrorOnboarded") === "true";
    
    // If not onboarded, redirect to welcome
    if (!betaOnboarded && !legacyOnboarded) {
      router.push('/welcome');
      return;
    }
    
    setIsOnboarded(true);
    
    // If onboarded, go to maia
    if (betaOnboarded || legacyOnboarded) {
      router.push('/maia');
    }
  }, [router]);

  // Show loading while checking onboarding status
  if (isOnboarded === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e293b] to-[#2e3a4b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  // Show onboarding if not completed
  if (!isOnboarded) {
    return <BetaOnboarding />;
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e293b] to-[#2e3a4b] flex items-center justify-center">
      <p className="text-white text-xl">Loading your sacred space...</p>
    </div>
  );
}