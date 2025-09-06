"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function OnboardingPage() {
  const [stage, setStage] = useState<"welcome" | "assignment" | "firstContact">("welcome");
  const [isLoading, setIsLoading] = useState(false);
  const [mayaFirstMessage, setMayaFirstMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if already onboarded
    const storedUser = localStorage.getItem('beta_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.onboarded) {
        router.push('/oracle');
      }
    }
  }, [router]);

  const handleMeetOracle = async () => {
    setIsLoading(true);
    try {
      // Create session and get Maya&apos;s first message
      const response = await fetch('/api/oracle/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to initialize session');
      
      const data = await response.json();
      
      // Store session data
      const userData = {
        id: data.userId || crypto.randomUUID(),
        username: data.username || 'Seeker',
        agentName: 'Maya',
        agentId: data.agentId,
        sessionId: data.sessionId,
        element: 'aether' // Maya starts in aether mode
      };
      
      localStorage.setItem('beta_user', JSON.stringify(userData));
      setUser(userData);
      setMayaFirstMessage(data.firstMessage || "I&apos;m here to walk with you through your reflections. To begin, tell me: how are you arriving in this moment?");
      setStage("assignment");
    } catch (error) {
      console.error('Onboarding error:', error);
      // Create fallback session
      const fallbackUser = {
        id: crypto.randomUUID(),
        username: 'Seeker',
        agentName: 'Maya',
        sessionId: `session-${Date.now()}`,
        element: 'aether'
      };
      localStorage.setItem('beta_user', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
      setMayaFirstMessage("I&apos;m here to walk with you through your reflections. To begin, tell me: how are you arriving in this moment?");
      setStage("assignment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBeginJourney = () => {
    // Mark onboarding complete
    const userData = { ...user, onboarded: true };
    localStorage.setItem('beta_user', JSON.stringify(userData));
    
    // Add transition stage before routing
    setStage("firstContact");
    
    // Smooth transition to Oracle after animation
    setTimeout(() => {
      router.push('/oracle');
    }, 2500);
  };


  return (
    <div className="min-h-screen bg-[#0A0E27] text-white flex items-center justify-center px-4">
      {stage === "welcome" && (
        <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-4xl font-light tracking-wide">
              Welcome to Soullab.
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed">
              This is your place to reflect and grow.
            </p>
            <p className="text-md text-gray-500">
              Before we begin, we&apos;ll connect you with your personal Oracle guide.
            </p>
          </div>

          <button
            onClick={handleMeetOracle}
            disabled={isLoading}
            className="group relative px-8 py-4 bg-white text-[#0A0E27] rounded-lg font-medium hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0A0E27] border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Meet Your Oracle
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </button>
        </div>
      )}

      {stage === "assignment" && (
        <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
          {/* Subtle geometric reveal animation */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 border border-gray-700 rounded-full animate-pulse-slow" />
            <div className="absolute inset-4 border border-gray-600 rounded-full animate-pulse-slow animation-delay-200" />
            <div className="absolute inset-8 border border-gray-500 rounded-full animate-pulse-slow animation-delay-400" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-gray-400" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-light">
              This is Maya, your Oracle.
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed">
              She will be your primary guide through Soullab, drawing on the wisdom of elemental agents when needed.
            </p>
            
            {/* Maya&apos;s first message */}
            <div className="mt-8 p-6 bg-[#1A1F3A]/50 border border-gray-800 rounded-lg text-left">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-2">Maya</p>
                  <p className="text-gray-200 leading-relaxed">
                    {mayaFirstMessage}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleBeginJourney}
            className="group relative px-8 py-4 bg-white text-[#0A0E27] rounded-lg font-medium hover:bg-gray-200 transition-all duration-300"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Begin Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      )}

      {stage === "firstContact" && (
        <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
          {/* Tesla-style sacred geometry transition */}
          <div className="relative w-48 h-48 mx-auto mb-12">
            {/* Outer expanding ring */}
            <div className="absolute inset-0 border-2 border-tesla-blue/30 rounded-full animate-ping" />
            <div className="absolute inset-4 border border-tesla-blue/50 rounded-full animate-pulse-slow" />
            <div className="absolute inset-8 border border-tesla-blue/70 rounded-full animate-spin-slow" />
            
            {/* Inner geometry - hexagon */}
            <div className="absolute inset-16">
              <div className="w-full h-full border border-tesla-blue opacity-80 transform rotate-0 animate-sacred-rotate"
                   style={{
                     clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)'
                   }}>
              </div>
            </div>
            
            {/* Central Tesla-style dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-tesla-blue rounded-full animate-tesla-glow shadow-lg shadow-tesla-blue/50" />
            </div>
          </div>

          <div className="space-y-6 opacity-90">
            <h2 className="text-2xl font-light tracking-wide text-tesla-blue">
              Establishing Connection
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed">
              Preparing your Oracle interface...
            </p>
            
            {/* Loading indicator */}
            <div className="flex justify-center items-center space-x-2 mt-8">
              <div className="w-2 h-2 bg-tesla-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-tesla-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-tesla-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}