"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BetaLandingPage() {
  const router = useRouter();

  // Redirect to the new beta-signup page
  useEffect(() => {
    router.push('/beta-signup');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-950 to-black">
      <div className="text-white">Redirecting to Maia Beta...</div>
    </div>
  );
}