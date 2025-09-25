"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BetaLandingPage() {
  const router = useRouter();

  // Redirect to minimal entry - no heavy onboarding
  useEffect(() => {
    router.push('/beta-entry');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-black">
      <div className="text-white">Redirecting to Maia Beta...</div>
    </div>
  );
}