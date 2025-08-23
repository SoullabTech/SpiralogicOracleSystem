"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConstellationCanvas } from '@/components/ceremony/ConstellationCanvas';
import { ConstellationVisual } from '@/lib/beta/constellation';
import { Sparkles, ArrowLeft } from 'lucide-react';

interface ConstellationData {
  id: string;
  code: string;
  name: string;
  description: string;
  visual: ConstellationVisual;
  narration_lines: string[];
}

interface CeremonyResponse {
  ceremony_id: string;
  constellation: ConstellationData;
  started_at: string;
  existing: boolean;
}

export default function GraduationCeremonyPage() {
  const router = useRouter();
  const [ceremony, setCeremony] = useState<CeremonyResponse | null>(null);
  const [currentPhase, setCurrentPhase] = useState<string>('loading');
  const [narrationIndex, setNarrationIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    initializeCeremony();
  }, []);

  const initializeCeremony = async () => {
    try {
      // First check if user is eligible
      const previewRes = await fetch('/api/beta/constellation/preview');
      const previewData = await previewRes.json();

      if (!previewRes.ok || !previewData.eligible) {
        setError(previewData.message || 'You are not eligible for graduation yet');
        setLoading(false);
        return;
      }

      // Start or resume ceremony
      const commitRes = await fetch('/api/beta/constellation/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!commitRes.ok) {
        const errorData = await commitRes.json();
        setError(errorData.message || 'Failed to start ceremony');
        setLoading(false);
        return;
      }

      const ceremonyData = await commitRes.json();
      setCeremony(ceremonyData);
      setLoading(false);

    } catch (err) {
      console.error('Failed to initialize ceremony:', err);
      setError('Failed to load graduation ceremony');
      setLoading(false);
    }
  };

  const handlePhaseChange = (phase: string) => {
    setCurrentPhase(phase);
    
    // Update narration based on phase
    if (ceremony?.constellation.narration_lines) {
      const phaseToIndex: Record<string, number> = {
        'title': 0,
        'points': 0,
        'links': 1,
        'badges': 2,
        'seal': 2,
        'complete': 2
      };
      
      const index = phaseToIndex[phase] || 0;
      if (index < ceremony.constellation.narration_lines.length) {
        setNarrationIndex(index);
      }
    }
  };

  const handleComplete = async () => {
    if (!ceremony) return;
    
    setCompleting(true);
    
    try {
      const completeRes = await fetch('/api/beta/constellation/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ceremonyId: ceremony.ceremony_id })
      });

      if (!completeRes.ok) {
        throw new Error('Failed to complete ceremony');
      }

      const result = await completeRes.json();
      
      // Show success message and redirect
      setTimeout(() => {
        router.push('/beta/badges?graduated=true');
      }, 2000);

    } catch (err) {
      console.error('Failed to complete ceremony:', err);
      setError('Failed to complete ceremony');
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Sparkles className="w-8 h-8 text-violet-400 animate-spin mx-auto" />
          <p className="text-zinc-400">Preparing your constellation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-zinc-600" />
          </div>
          <h1 className="text-2xl font-bold">Graduation Not Available</h1>
          <p className="text-zinc-400">{error}</p>
          <button
            onClick={() => router.push('/beta/badges')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
            View Your Badges
          </button>
        </div>
      </div>
    );
  }

  if (!ceremony) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-400">Failed to load ceremony data</p>
      </div>
    );
  }

  const allowSkip = process.env.NODE_ENV === 'development' && 
                  process.env.NEXT_PUBLIC_CEREMONY_ALLOW_SKIP_IN_DEV === 'true';

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative">
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Main Ceremony */}
      <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-8">
        
        {/* Ceremony Title (when not in animation) */}
        {currentPhase === 'loading' && (
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-3xl font-bold">{ceremony.constellation.name}</h1>
            <p className="text-zinc-400 max-w-2xl">
              {ceremony.constellation.description}
            </p>
          </div>
        )}

        {/* Constellation Canvas */}
        <div className="w-full max-w-4xl">
          <ConstellationCanvas
            visual={ceremony.constellation.visual}
            onPhase={handlePhaseChange}
            onComplete={handleComplete}
            allowSkip={allowSkip}
          />
        </div>

        {/* Narration */}
        <div className="text-center space-y-2 min-h-[60px] flex items-center justify-center">
          {ceremony.constellation.narration_lines[narrationIndex] && (
            <p className="text-lg text-zinc-300 max-w-2xl animate-pulse">
              {ceremony.constellation.narration_lines[narrationIndex]}
            </p>
          )}
        </div>

        {/* Progress indicator */}
        {currentPhase !== 'complete' && currentPhase !== 'loading' && (
          <div className="flex items-center space-x-2">
            {['title', 'points', 'links', 'badges', 'seal'].map((phase, index) => (
              <div
                key={phase}
                className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                  ['title', 'points', 'links', 'badges', 'seal'].indexOf(currentPhase) >= index
                    ? 'bg-violet-400'
                    : 'bg-zinc-700'
                }`}
              />
            ))}
          </div>
        )}

        {/* Completion Loading */}
        {completing && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center space-y-4">
              <Sparkles className="w-8 h-8 text-violet-400 animate-spin mx-auto" />
              <p className="text-white">Finalizing your graduation...</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="fixed bottom-6 right-6 text-xs text-zinc-500">
        {ceremony.existing ? 'Resuming ceremony' : 'New ceremony'} • {ceremony.constellation.code}
      </div>
    </div>
  );
}