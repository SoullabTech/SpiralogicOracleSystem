// hooks/useVoice.ts
'use client';
import { useMemo } from 'react';
import { features } from '@/lib/config/features';
import { availableVoices, resolveDefaultVoice } from '@/lib/voice/config';

export function useVoice() {
  const selectionEnabled = features.voice.selectionEnabled;
  const voiceEnabled = features.oracle.voiceEnabled;
  const mayaEnabled = features.oracle.mayaVoice;
  
  const voice = useMemo(resolveDefaultVoice, []);
  const choices = useMemo(availableVoices, []);
  
  return { 
    selectionEnabled, 
    voiceEnabled, 
    mayaEnabled, 
    voice, 
    choices 
  };
}