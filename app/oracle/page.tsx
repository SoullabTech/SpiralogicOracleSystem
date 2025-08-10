"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamic import to handle client-side components
const PersonalOracleHome = dynamic(
  () => import("../../frontend/src/components/oracle/PersonalOracleHome"),
  { ssr: false },
);

function OracleLoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0E0F1B] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-[#F6E27F] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-2xl">🔮</span>
        </div>
        <p className="text-[#F6E27F] text-lg">
          Connecting to your Personal Oracle...
        </p>
      </div>
    </div>
  );
}

export default function OraclePage() {
  return (
    <div className="min-h-screen bg-[#0E0F1B]">
      <Suspense fallback={<OracleLoadingFallback />}>
        <PersonalOracleHome />
      </Suspense>
    </div>
  );
}
