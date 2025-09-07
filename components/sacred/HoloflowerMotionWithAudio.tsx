'use client';

import React, { useEffect, useState } from 'react';
import { HoloflowerMotion } from './HoloflowerMotion';
import { HoloflowerMobile } from './HoloflowerMobile';
import { 
  playSacredTone, 
  playChord, 
  playGrandBloom,
  playSequence,
  sacredTones,
  getFrequencyForElement,
  getPulseDuration
} from '@/lib/audio/sacred-tones';
import { mapChordVisual } from '@/lib/motion/motion-mapper';
import { 
  triggerHapticPulse, 
  triggerHapticPattern, 
  hapticElement,
  hapticCoherence,
  syncHapticWithFrequency 
} from '@/lib/haptics';
import type { AudioState } from '@/components/ui/AudioToggle';

interface HoloflowerMotionWithAudioProps {
  motionState: any;
  audioState?: AudioState;
  volume?: number;
  enableHaptics?: boolean;
  isMobile?: boolean;
}

export const HoloflowerMotionWithAudio: React.FC<HoloflowerMotionWithAudioProps> = ({
  motionState,
  audioState = 'off',
  volume = 0.05,
  enableHaptics = true,
  isMobile = false
}) => {
  const [chordVisual, setChordVisual] = useState<any>(null);
  
  useEffect(() => {
    if (!motionState) return;
    
    const elements = motionState?.highlight?.elements || [];
    const element = motionState?.highlight?.element;
    const frequency = motionState?.frequency;
    const coherence = motionState?.coherence || 0.5;
    
    // Update visual state
    if (elements.length > 1) {
      const visual = mapChordVisual(elements);
      setChordVisual(visual);
    } else {
      setChordVisual(null);
    }
    
    // Handle audio based on state
    if (audioState === 'on') {
      // Full audio mode
      if (elements.length >= 12) {
        // Grand bloom - all 12 petals
        playGrandBloom(6, volume * 0.8);
        if (enableHaptics) triggerHapticPattern('bloom');
      } else if (elements.length > 1) {
        // Multiple elements - play chord
        playChord(elements, 4, volume);
        if (enableHaptics) triggerHapticPattern('ripple');
      } else if (frequency) {
        // Specific frequency from oracle
        playSacredTone(frequency, 4, volume);
        if (enableHaptics) syncHapticWithFrequency(frequency, 3000);
      } else if (element) {
        // Single element
        const freq = sacredTones[element.toLowerCase()];
        if (freq) {
          playSacredTone(freq, 3, volume);
          if (enableHaptics) hapticElement(element);
        }
      }
      
      // Special effects for motion states
      if (motionState.state === 'breakthrough') {
        setTimeout(() => {
          playSequence(['earth', 'water', 'fire', 'air', 'aether'], 0.3, 0.8, volume * 1.2);
          if (enableHaptics) triggerHapticPulse('breakthrough');
        }, 500);
      }
    } else if (audioState === 'silent') {
      // Silent resonance mode - haptics only
      if (enableHaptics) {
        if (elements.length >= 12) {
          triggerHapticPattern('bloom');
        } else if (elements.length > 1) {
          // Sync haptics with slowest frequency in chord
          const frequencies = elements.map(el => getFrequencyForElement(el));
          const lowestFreq = Math.min(...frequencies);
          syncHapticWithFrequency(lowestFreq, 4000);
        } else if (element) {
          hapticElement(element);
        } else if (frequency) {
          syncHapticWithFrequency(frequency, 3000);
        }
        
        // Coherence haptics
        if (coherence !== motionState.lastCoherence) {
          hapticCoherence(coherence);
        }
      }
    }
    // audioState === 'off' - no audio, no haptics
    
  }, [motionState, audioState, volume, enableHaptics]);
  
  // Combine motion state with chord visual
  const combinedState = {
    ...motionState,
    ...(chordVisual || {})
  };
  
  // Use mobile-optimized component on mobile devices
  if (isMobile) {
    return (
      <HoloflowerMobile
        activeElements={combinedState.elements || []}
        aetherStage={combinedState.aetherStage || 0}
        coherenceLevel={combinedState.coherence}
        audioState={audioState}
        onPetalTap={(element) => {
          if (enableHaptics) hapticElement(element);
        }}
      />
    );
  }
  
  // Desktop/tablet version
  return (
    <HoloflowerMotion
      state={combinedState.state}
      coherenceLevel={combinedState.coherence}
      shadowPetals={combinedState.shadowPetals}
      aetherStage={combinedState.aetherStage}
      voiceActive={combinedState.voiceActive}
      fullscreen={combinedState.fullscreen}
      chord={combinedState.chord}
      elements={combinedState.elements}
    />
  );
};

export default HoloflowerMotionWithAudio;