"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { UnifiedHistoryPage } from "@/components/beta/UnifiedHistoryPage";
import { History, Upload } from "lucide-react";
import { MayaWelcome } from "@/components/oracle/MayaWelcome";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MaiaPage() {
  const router = useRouter();
  const [showHistory, setShowHistory] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [intakeData, setIntakeData] = useState<any>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Check if user has completed onboarding
      const { data: intake, error } = await supabase
        .from('beta_intake')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !intake || !intake.intake_part1_completed_at) {
        // User hasn't completed onboarding
        router.push('/onboarding');
        return;
      }

      setIntakeData(intake);
      setHasCompletedOnboarding(true);

      // Check if it's been 1 week since part 1 and part 2 hasn't been completed
      if (intake.intake_part1_completed_at && !intake.intake_part2_completed_at) {
        const part1Date = new Date(intake.intake_part1_completed_at);
        const oneWeekLater = new Date(part1Date.getTime() + 7 * 24 * 60 * 60 * 1000);
        const now = new Date();

        if (now >= oneWeekLater) {
          // Prompt for Part 2 intake
          router.push('/onboarding?part=2');
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  // Show loading while checking onboarding status
  if (hasCompletedOnboarding === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #2e3a4b 100%)'
      }}>
        <div className="text-center">
          <img src="/holoflower.svg" alt="Loading" className="w-16 h-16 mx-auto animate-spin" />
          <p className="text-white/60 mt-4">Preparing your sacred space...</p>
        </div>
      </div>
    );
  }

  if (!hasCompletedOnboarding) {
    return null; // Will redirect to onboarding
  }

  // Swipe Navigation
  useSwipeNavigation({
    onSwipeLeft: () => setShowHistory(true),
    onSwipeRight: () => setShowHistory(false),
    threshold: 100,
    preventScroll: true
  });

  const handleConversationStart = () => {
    // Navigate to conversation
    window.location.href = '/oracle-conversation';
  };

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #2e3a4b 100%)',
      position: 'relative'
    }}>
      {/* Subtle gradient overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(182, 154, 120, 0.05) 0%, rgba(122, 154, 101, 0.05) 33%, rgba(107, 155, 209, 0.05) 66%, rgba(212, 184, 150, 0.05) 100%)'
        }}
      />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Main Content Area */}
        <div className="max-w-3xl mx-auto">
          <MayaWelcome 
            onConversationStart={handleConversationStart} 
            intakeData={intakeData}
          />
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-3">
          {/* History Button */}
          <button
            onClick={() => setShowHistory(true)}
            className="p-4 rounded-full shadow-lg transition-all hover:scale-110"
            style={{
              background: 'rgba(30, 41, 59, 0.95)',
              border: '1px solid rgba(212, 184, 150, 0.3)',
              color: '#D4B896'
            }}
            title="View History"
          >
            <History size={24} />
          </button>

          {/* Upload Button */}
          <button
            onClick={() => {
              // Handle file upload
              console.log('Upload clicked');
            }}
            className="p-4 rounded-full shadow-lg transition-all hover:scale-110"
            style={{
              background: 'rgba(30, 41, 59, 0.95)',
              border: '1px solid rgba(212, 184, 150, 0.3)',
              color: '#D4B896'
            }}
            title="Share Files"
          >
            <Upload size={24} />
          </button>
        </div>

        {/* Swipe hint for mobile */}
        <div className="fixed bottom-4 left-4 text-xs text-white/40 md:hidden">
          ← Swipe for history
        </div>
      </div>

      {/* History Page Overlay */}
      {showHistory && (
        <UnifiedHistoryPage
          onClose={() => setShowHistory(false)}
          onSelectConversation={(conversation) => {
            console.log('Selected conversation:', conversation);
            setShowHistory(false);
            // Navigate to conversation or load messages
          }}
          onSelectFile={(file) => {
            console.log('Selected file:', file);
            setShowHistory(false);
            // Handle file selection
          }}
        />
      )}
    </div>
  );
}