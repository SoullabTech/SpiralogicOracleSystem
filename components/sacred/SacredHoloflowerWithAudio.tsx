// Sacred Holoflower with Audio Integration
import React, { useRef, useCallback, useEffect } from 'react';
import { SacredHoloflower, SacredHoloflowerProps } from './SacredHoloflower';
import { SacredAudioSystem, SacredAudioEngine, ElementalTone, AudioCue } from '../audio/SacredAudioSystem';
import { getFacetById } from '@/data/spiralogic-facets';

interface SacredHoloflowerWithAudioProps extends SacredHoloflowerProps {
  audioEnabled?: boolean;
  audioVolume?: number;
  playPetalTones?: boolean;
  playCoherenceFeedback?: boolean;
  playStateTransitions?: boolean;
}

// Map elements to audio tones
const getElementalTone = (element: string): ElementalTone => {
  switch (element) {
    case 'fire': return 'fire';
    case 'water': return 'water';
    case 'earth': return 'earth';
    case 'air': return 'air';
    default: return 'aether';
  }
};

export const SacredHoloflowerWithAudio: React.FC<SacredHoloflowerWithAudioProps> = ({
  audioEnabled = true,
  audioVolume = 0.4,
  playPetalTones = true,
  playCoherenceFeedback = true,
  playStateTransitions = true,
  motionState,
  coherenceLevel,
  coherenceShift,
  isListening,
  isProcessing,
  isResponding,
  showBreakthrough,
  onPetalClick,
  ...holoflowerProps
}) => {
  const audioEngineRef = useRef<SacredAudioEngine | null>(null);
  const previousMotionState = useRef(motionState);
  const previousCoherenceLevel = useRef(coherenceLevel);
  const previousCoherenceShift = useRef(coherenceShift);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioEngineRef.current = new SacredAudioEngine();
    }
  }, []);

  // Handle petal click with audio feedback
  const handlePetalClick = useCallback(async (facetId: string) => {
    if (audioEnabled && playPetalTones && audioEngineRef.current) {
      const facet = getFacetById(facetId);
      if (facet) {
        const tone = getElementalTone(facet.element);
        await audioEngineRef.current.playElementalTone(tone, 300, audioVolume * 0.8);
      } else {
        // Fallback gentle tone
        await audioEngineRef.current.playCue('petal_tap', audioVolume);
      }
    }
    
    onPetalClick?.(facetId);
  }, [audioEnabled, playPetalTones, audioVolume, onPetalClick]);

  // Play state transition audio cues
  useEffect(() => {
    if (!audioEnabled || !playStateTransitions || !audioEngineRef.current) return;

    const playTransitionCue = async (cue: AudioCue) => {
      await audioEngineRef.current!.playCue(cue, audioVolume);
    };

    // Detect state changes
    if (motionState !== previousMotionState.current) {
      switch (motionState) {
        case 'listening':
          if (!previousMotionState.current || previousMotionState.current === 'idle') {
            playTransitionCue('listening_start');
          }
          break;
        case 'processing':
          if (previousMotionState.current === 'listening') {
            playTransitionCue('processing');
          }
          break;
        case 'responding':
          // No audio cue for responding start (let the content speak)
          break;
        case 'breakthrough':
          playTransitionCue('breakthrough');
          break;
      }
      previousMotionState.current = motionState;
    }

    // Detect when response completes (returning to idle from responding)
    if (previousMotionState.current === 'responding' && motionState === 'idle') {
      playTransitionCue('response_complete');
    }
  }, [motionState, audioEnabled, playStateTransitions, audioVolume]);

  // Play coherence feedback audio
  useEffect(() => {
    if (!audioEnabled || !playCoherenceFeedback || !audioEngineRef.current) return;
    
    if (coherenceShift !== previousCoherenceShift.current && coherenceShift) {
      const playCoherenceCue = async () => {
        switch (coherenceShift) {
          case 'rising':
            await audioEngineRef.current!.playCue('coherence_rise', audioVolume);
            break;
          case 'falling':
            await audioEngineRef.current!.playCue('coherence_fall', audioVolume);
            break;
          // 'stable' gets no audio cue
        }
      };

      playCoherenceCue();
      previousCoherenceShift.current = coherenceShift;
    }
  }, [coherenceShift, audioEnabled, playCoherenceFeedback, audioVolume]);

  // Play ambient coherence tones based on level
  useEffect(() => {
    if (!audioEnabled || !audioEngineRef.current) return;

    const currentLevel = coherenceLevel || 0.5;
    const previousLevel = previousCoherenceLevel.current || 0.5;
    
    // Play subtle ambient tone when coherence crosses thresholds
    if (Math.abs(currentLevel - previousLevel) > 0.2) {
      const playAmbientTone = async () => {
        let tone: ElementalTone;
        
        if (currentLevel >= 0.8) {
          tone = 'aether'; // Transcendent
        } else if (currentLevel >= 0.6) {
          tone = 'air'; // Clear expression
        } else if (currentLevel >= 0.4) {
          tone = 'fire'; // Transformation
        } else {
          tone = 'earth'; // Grounding
        }

        await audioEngineRef.current!.playElementalTone(tone, 800, audioVolume * 0.3);
      };

      playAmbientTone();
    }

    previousCoherenceLevel.current = currentLevel;
  }, [coherenceLevel, audioEnabled, audioVolume]);

  return (
    <>
      <SacredAudioSystem
        enabled={audioEnabled}
        volume={audioVolume}
      />
      
      <SacredHoloflower
        {...holoflowerProps}
        motionState={motionState}
        coherenceLevel={coherenceLevel}
        coherenceShift={coherenceShift}
        isListening={isListening}
        isProcessing={isProcessing}
        isResponding={isResponding}
        showBreakthrough={showBreakthrough}
        onPetalClick={handlePetalClick}
      />
    </>
  );
};

export default SacredHoloflowerWithAudio;