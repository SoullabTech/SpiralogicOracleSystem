// lib/voice/maya-cues.ts
import { speak } from '@/lib/voice/speak';
import { MAYA_SCRIPT } from '@/lib/voice/scripts/maya';
import { features } from '@/lib/config/features';

export interface MayaVoiceCue {
  shouldSpeak: boolean;
  text: string;
  context: 'post_upload' | 'post_recap' | string;
}

/**
 * Handle Maya's voice cues from API responses
 */
export async function handleMayaVoiceCue(cue: MayaVoiceCue | undefined): Promise<void> {
  if (!cue?.shouldSpeak || !features.oracle.voiceEnabled || !features.oracle.mayaVoice) {
    return;
  }

  try {
    // Use script text if available, fallback to API text
    let text = cue.text;
    
    if (cue.context === 'post_upload' && MAYA_SCRIPT.post_upload) {
      text = MAYA_SCRIPT.post_upload;
    } else if (cue.context === 'post_recap' && MAYA_SCRIPT.post_recap) {
      text = MAYA_SCRIPT.post_recap;
    }

    await speak(text);
    
  } catch (error) {
    console.warn('Maya voice cue failed:', error);
  }
}

/**
 * Speak Maya's post-upload cue directly (for client-side events)
 */
export async function speakMayaPostUpload(): Promise<void> {
  if (!features.oracle.voiceEnabled || !features.oracle.mayaVoice) return;
  
  try {
    await speak(MAYA_SCRIPT.post_upload);
  } catch (error) {
    console.warn('Maya post-upload cue failed:', error);
  }
}

/**
 * Speak Maya's post-recap cue directly (for client-side events)  
 */
export async function speakMayaPostRecap(): Promise<void> {
  if (!features.oracle.voiceEnabled || !features.oracle.mayaVoice) return;
  
  try {
    await speak(MAYA_SCRIPT.post_recap);
  } catch (error) {
    console.warn('Maya post-recap cue failed:', error);
  }
}

/**
 * Generate ADHD-friendly Maya cues
 */
export function mayaAdhdCue(kind: "saved"|"recall_set"|"digest") { 
  const lines = {
    saved:  "I've tucked that away. Want me to bring it back when your energy is steadier?",
    recall_set: "Perfect. I'll resurface this a bit later—one gentle nudge.",
    digest: "Here's your daily pulse. One tiny step is enough."
  };
  return { context: "adhd_mode", text: lines[kind], speak: true };
}