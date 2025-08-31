/**
 * Audio unlock utility for autoplay policy compliance
 * Unlocks audio context on first user interaction
 */

let audioUnlocked = false;

export async function unlockAudio(): Promise<boolean> {
  // Check if already unlocked
  if (audioUnlocked || localStorage.getItem('mayaAudioUnlocked') === '1') {
    audioUnlocked = true;
    return true;
  }

  try {
    // Create audio context and play silent buffer
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      console.warn('AudioContext not supported');
      return false;
    }

    const ctx = new AudioContext();
    
    // Resume if suspended
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    // Create and play silent buffer
    const silence = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = silence;
    src.connect(ctx.destination);
    src.start(0);

    // Mark as unlocked
    audioUnlocked = true;
    localStorage.setItem('mayaAudioUnlocked', '1');
    
    console.log('✅ Audio unlocked for autoplay');
    return true;
  } catch (error) {
    console.warn('Failed to unlock audio:', error);
    return false;
  }
}

export function isAudioUnlocked(): boolean {
  return audioUnlocked || localStorage.getItem('mayaAudioUnlocked') === '1';
}

export function resetAudioUnlock(): void {
  audioUnlocked = false;
  localStorage.removeItem('mayaAudioUnlocked');
}

// Auto-unlock on any user interaction
let unlockListenersAdded = false;

export function addAutoUnlockListeners(): void {
  if (unlockListenersAdded || typeof window === 'undefined') return;
  
  const unlockHandler = () => {
    unlockAudio();
    // Remove listeners after first unlock
    document.removeEventListener('click', unlockHandler);
    document.removeEventListener('touchstart', unlockHandler);
    document.removeEventListener('keydown', unlockHandler);
  };

  document.addEventListener('click', unlockHandler, { passive: true });
  document.addEventListener('touchstart', unlockHandler, { passive: true });
  document.addEventListener('keydown', unlockHandler, { passive: true });
  
  unlockListenersAdded = true;
}