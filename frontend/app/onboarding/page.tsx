'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RealOnboarding } from '@/components/onboarding/RealOnboarding';

export default function OnboardingPage() {
  const router = useRouter();
  const [isExistingUser, setIsExistingUser] = useState(false);

  useEffect(() => {
    // Check if user is already onboarded
    const userData = localStorage.getItem('userData');
    if (userData) {
      setIsExistingUser(true);
      // Redirect existing users to dashboard
      router.push('/dashboard');
    }
  }, [router]);

  const handleOnboardingComplete = (userData: any) => {
    // Redirect to dashboard after successful onboarding
    router.push('/dashboard');
  };

  if (isExistingUser) {
    return (
      <div className="min-h-screen bg-soullab-white flex items-center justify-center">
        <div className="text-center">
          <div className="soullab-spinner mb-4" />
          <p className="soullab-text">Welcome back...</p>
        </div>
      </div>
    );
  }

  return <RealOnboarding onComplete={handleOnboardingComplete} />;
}