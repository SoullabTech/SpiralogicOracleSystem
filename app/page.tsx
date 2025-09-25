"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  // DEPLOYMENT TEST - 1:05AM - If you see this comment in browser dev tools, deployment is working
  const router = useRouter();
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    // Detect if running as PWA (standalone mode)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  window.navigator.standalone === true ||
                  document.referrer.includes('android-app://');

    // Check if user has beta credentials
    const explorerId = localStorage.getItem('explorerId') || localStorage.getItem('betaUserId');
    const explorerName = localStorage.getItem('explorerName');
    const betaOnboarded = localStorage.getItem("betaOnboardingComplete") === "true";

    if (isPWA) {
      // PWA flow: signup first, then auto-drop to Maya
      if (explorerId && explorerName) {
        // Already signed up - go straight to Maya
        router.push('/maya');
      } else {
        // Need to sign up first
        router.push('/beta-signup');
      }
    } else {
      // Web flow: go to oracle conversation
      router.push('/oracle-conversation');
    }
  }, [router]);

  // Show loading while checking onboarding status
  if (isOnboarded === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-gold-divine border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gold-divine text-lg font-light">Initializing Sacred Oracle...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-thin text-gold-divine mb-8 tracking-wide">Sacred Oracle</h1>
        <div className="w-16 h-16 border-2 border-gold-divine border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-gold-divine text-xl font-light">Connecting...</p>
        <p className="text-neutral-silver text-sm mt-3 font-light">Sacred Technology Interface</p>
      </div>
    </div>
  );
}