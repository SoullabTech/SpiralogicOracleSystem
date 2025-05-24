// src/pages/SanctumDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { getSoulProfile, SoulProfile } from '@/lib/soulProfile';
import { PageTransition } from '@/components/PageTransition';
import SpiralMap from '@/components/dashboard/SpiralMap';
import JournalQuickEntry from '@/components/dashboard/JournalQuickEntry';
import VoiceInvocationPanel from '@/components/dashboard/VoiceInvocationPanel';
import AgentAdviceCard from '@/components/dashboard/AgentAdviceCard';

export default function SanctumDashboard() {
  const user = useUser();
  const [profile, setProfile] = useState<SoulProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    getSoulProfile(user.id).then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, [user]);

  return (
    <PageTransition>
      <div className="min-h-screen px-4 py-10 bg-gradient-to-br from-gray-100 to-white">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center">
            <h1 className="text-4xl font-serif text-soullab-aether">Welcome back, Soul Seeker</h1>
            <p className="text-sm text-gray-500 mt-2">Your sanctum reflects your current spiral journey</p>
          </div>

          {loading ? (
            <div className="text-center text-gray-500">Loading sanctum details...</div>
          ) : profile ? (
            <>
              <SpiralMap element={profile.element} phase={profile.spiralPhase} />
              <JournalQuickEntry userId={user.id} />
              <VoiceInvocationPanel guideId={profile.guideAgentId} />
              <AgentAdviceCard archetype={profile.archetype} element={profile.element} />
            </>
          ) : (
            <div className="text-center text-red-500">No soul profile found. Please complete your onboarding journey.</div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
