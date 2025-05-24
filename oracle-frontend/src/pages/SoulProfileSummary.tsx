// src/pages/SoulProfileSummary.tsx
import React, { useEffect, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { getSoulProfile, SoulProfile } from '@/lib/soulProfile';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';

export default function SoulProfileSummary() {
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

  if (loading)
    return (
      <div className="text-center p-6 text-xl text-soullab-aether animate-pulse">
        Loading Soul Profile...
      </div>
    );

  if (!profile)
    return (
      <div className="text-center p-6 text-red-500">
        No Soul Profile found. Begin your Spiral Journey to reveal your path.
      </div>
    );

  return (
    <PageTransition>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto p-8 text-center bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200"
      >
        <h2 className="text-4xl font-serif text-soullab-aether mb-6">✨ Your Soul Profile</h2>
        <div className="space-y-4 text-left text-lg">
          <div><strong className="text-soullab-air">Soul Name:</strong> {profile.soulName}</div>
          <div>
            <strong className="text-soullab-fire">Aura Color:</strong>{' '}
            <span
              className="inline-block w-4 h-4 rounded-full align-middle"
              style={{ backgroundColor: profile.auraColor }}
            ></span>{' '}
            <span className="ml-2 align-middle">{profile.auraColor}</span>
          </div>
          <div><strong className="text-soullab-earth">Totem:</strong> {profile.totem}</div>
          <div><strong className="text-soullab-water">Element:</strong> {profile.element}</div>
          <div><strong className="text-soullab-aether">Archetype:</strong> {profile.archetype}</div>
          {profile.spiralPhase && (
            <div><strong className="text-soullab-aether">Spiral Phase:</strong> {profile.spiralPhase}</div>
          )}
          {profile.guideAgentId && (
            <div><strong className="text-soullab-air">Guide Agent:</strong> {profile.guideAgentId}</div>
          )}
          <div className="text-xs text-gray-500 mt-4 italic">
            Profile initiated: {new Date(profile.createdAt || '').toLocaleString()}
          </div>
        </div>
      </motion.div>
    </PageTransition>
  );
}

// To use: add <SoulProfileSummary /> route to protected dashboard or onboarding completion screen.
