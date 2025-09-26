'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ElementalOrientation } from '@/components/beta/ElementalOrientation';

export default function BetaOrientationPage() {
  const router = useRouter();
  const [explorerName, setExplorerName] = useState('');

  useEffect(() => {
    const name = sessionStorage.getItem('explorerName') ||
                 localStorage.getItem('explorerName');

    if (!name) {
      router.replace('/beta-entry');
      return;
    }

    setExplorerName(name);
  }, [router]);

  if (!explorerName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1f3a]">
        <div className="text-amber-400">Preparing your journey...</div>
      </div>
    );
  }

  return <ElementalOrientation explorerName={explorerName} />;
}