"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// Dynamically import OracleConversation to avoid SSR issues
const OracleConversation = dynamic(
  () => import("@/components/OracleConversation"),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading Oracle System...</div>
      </div>
    )
  }
);

export default function OracleConversationPage() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState({
    userId: "",
    username: "",
    sessionId: "",
    agentId: ""
  });

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingComplete = localStorage.getItem("onboardingComplete");
    if (!onboardingComplete) {
      router.push("/oracle");
      return;
    }

    // Get session data from localStorage
    const userId = localStorage.getItem("userId") || "";
    const username = localStorage.getItem("username") || "";
    const sessionId = localStorage.getItem("sessionId") || "";
    const agentData = localStorage.getItem("assignedAgent");
    const agent = agentData ? JSON.parse(agentData) : null;

    setSessionData({
      userId,
      username,
      sessionId,
      agentId: agent?.id || ""
    });
  }, [router]);

  if (!sessionData.userId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Initializing...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header with user info */}
      <div className="absolute top-4 left-4 z-50">
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
          <div className="text-sm text-gray-400">Connected as</div>
          <div className="font-medium">{sessionData.username}</div>
        </div>
      </div>

      {/* Sign out button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => {
            localStorage.clear();
            router.push("/oracle");
          }}
          className="bg-slate-800/80 backdrop-blur-sm rounded-lg px-4 py-2 text-white hover:bg-slate-700/80 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Oracle Conversation Component */}
      <OracleConversation
        userId={sessionData.userId}
        sessionId={sessionData.sessionId}
        voiceEnabled={true}
        showAnalytics={false}
      />
    </div>
  );
}