"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OraclePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to oracle-conversation
    router.push('/oracle-conversation');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-[#1a1f3a] to-black flex items-center justify-center p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p className="text-white/60 mt-4">Redirecting to Oracle...</p>
      </div>
    </div>
  );
}