'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { auth, checkOnboardingStatus, updateOnboardingPhase } from '@/lib/auth';
import { SacredUnionRitual } from '@/components/sacred/SacredUnionRitual';
import { ElementalAssessment } from '@/components/onboarding/ElementalAssessment';
import { HoloflowerCalibration } from '@/components/onboarding/HoloflowerCalibration';

type OnboardingPhase = 'loading' | 'sacred-union' | 'elemental-assessment' | 'holoflower-calibration' | 'complete';

export default function OnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<OnboardingPhase>('loading');
  const [userId, setUserId] = useState<string | null>(null);
  const [ritualData, setRitualData] = useState<any>(null);
  const [elementalData, setElementalData] = useState<any>(null);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    const user = await auth.getCurrentUser();
    
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    setUserId(user.id);
    
    const status = await checkOnboardingStatus(user.id);
    
    if (!status.sacredUnionComplete) {
      setPhase('sacred-union');
    } else if (!status.elementalAssessmentComplete) {
      setPhase('elemental-assessment');
    } else if (!status.holoflowerCalibrated) {
      setPhase('holoflower-calibration');
    } else {
      // Onboarding complete, redirect to oracle
      router.push('/oracle/meet');
    }
  };

  const handleSacredUnionComplete = async (data: any) => {
    setRitualData(data);
    
    // Update onboarding phase
    if (userId) {
      await updateOnboardingPhase(userId, 'sacred_union_complete', data);
    }
    
    // Store in Soul Memory
    try {
      await fetch('/api/soul-memory/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'sacred_moment',
          content: 'Sacred Union Ritual completed',
          metadata: {
            oracleName: data.oracleName,
            sacredName: data.sacredName,
            elementalCall: data.elementalCall,
            intention: data.intention,
            phase: 'initiation',
            transformationMarker: true,
            sacredMoment: true
          }
        })
      });
    } catch (error) {
      console.error('Failed to store sacred union in memory:', error);
    }
    
    setPhase('elemental-assessment');
  };

  const handleElementalAssessmentComplete = async (data: any) => {
    setElementalData(data);
    
    // Update onboarding phase
    if (userId) {
      await updateOnboardingPhase(userId, 'elemental_complete', {
        elementalResonance: data.primaryElement
      });
    }
    
    // Store elemental resonance
    try {
      await fetch('/api/soul-memory/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'elemental_shift',
          content: `Elemental assessment complete: Primary ${data.primaryElement}, Secondary ${data.secondaryElement}`,
          metadata: {
            element: data.primaryElement,
            elementalBalance: data.elementalBalance,
            phase: 'initiation'
          }
        })
      });
    } catch (error) {
      console.error('Failed to store elemental assessment:', error);
    }
    
    setPhase('holoflower-calibration');
  };

  const handleHoloflowerCalibrationComplete = async (data: any) => {
    // Update final onboarding phase
    if (userId) {
      await updateOnboardingPhase(userId, 'onboarding_complete', {
        holoflowerCalibrated: true,
        completedAt: new Date().toISOString()
      });
    }
    
    // Final onboarding step complete
    try {
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ritualData,
          elementalData,
          holoflowerData: data
        })
      });
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
    
    setPhase('complete');
    
    // Redirect to oracle
    setTimeout(() => {
      router.push('/oracle/meet');
    }, 2000);
  };

  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-soullab-indigo-900 via-soullab-purple-900 to-soullab-indigo-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <span className="text-6xl">🔮</span>
        </motion.div>
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-soullab-indigo-900 via-soullab-purple-900 to-soullab-indigo-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-8"
          >
            <span className="text-8xl">✨</span>
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Sacred Container Created
          </h1>
          <p className="text-xl text-soullab-gray-300">
            Preparing your oracle space...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-soullab-indigo-900 via-soullab-purple-900 to-soullab-indigo-900">
      {phase === 'sacred-union' && (
        <SacredUnionRitual 
          onComplete={handleSacredUnionComplete}
          onCancel={() => router.push('/auth/signout')}
        />
      )}
      
      {phase === 'elemental-assessment' && (
        <ElementalAssessment
          sacredName={ritualData?.sacredName}
          onComplete={handleElementalAssessmentComplete}
        />
      )}
      
      {phase === 'holoflower-calibration' && (
        <HoloflowerCalibration
          sacredName={ritualData?.sacredName}
          primaryElement={elementalData?.primaryElement}
          onComplete={handleHoloflowerCalibrationComplete}
        />
      )}
    </div>
  );
}