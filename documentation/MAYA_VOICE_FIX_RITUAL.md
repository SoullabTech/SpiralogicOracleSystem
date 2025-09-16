# 🌀 Maya Voice Fix Ritual - Complete Debug Series

A systematic ritual to fix all voice interaction issues including silence detection, TTS playback, memory references, input clearing, and error overlay visibility.

---

## 🎯 Issues Being Fixed

1. **🎤 Silence Detection** - Recording doesn't auto-stop after silence
2. **🔊 Voice Reply Missing** - Text appears but no TTS audio
3. **📚 Memory References** - Always showing "Referenced from your library"
4. **⌨️ Input Not Clearing** - Text remains after sending
5. **🚫 Error Messages Hidden** - Errors buried under input box

---

## 🔧 Claude Code Prompt Series

### Prompt 1: Context & Mission Brief

```
You are fixing the Spiralogic Oracle System voice features.

Issues to fix:
1. Silence detection not triggering auto-stop after 2.5-6s
2. TTS not playing (autoplay blocked or service issues)
3. Memory references always showing (need toggle)
4. Input box not clearing after send
5. Error messages hidden behind input UI

Confirm understanding before proceeding.
```

### Prompt 2: Fix Silence Detection

```
Target: components/VoiceRecorder.tsx

The silence timer isn't firing because stopRecording is called before it's defined.

Fix by:
1. Add stopRecordingRef = useRef<(() => void) | null>(null)
2. Add useEffect to set: stopRecordingRef.current = stopRecording
3. In checkSilence timeout, call: stopRecordingRef.current?.()
4. Also update safety timer to use: stopRecordingRef.current?.()

Show the complete patches needed.
```

### Prompt 3: Fix TTS Playback

```
Target: backend/src/services/ConversationalPipeline.ts

TTS is failing silently. Add comprehensive logging:

In converseViaSesame Step 5 (Maya TTS section):
- Log before attempting TTS generation
- Wrap in try/catch to handle errors gracefully
- Log the result including service used and audio URL
- Don't fail entire response if TTS fails

Add these logs:
- [TTS] Attempting to generate speech
- [TTS] Speech generation result (with service, hasAudioUrl, error)
- [TTS] Skipped speech generation (if conditions not met)

Generate the complete patch.
```

### Prompt 4: Add Memory References Toggle

```
Target: components/chat/ChatMessage.tsx

Make memory references optional via environment variable.

1. Wrap citations section with:
   {hasCitations && process.env.NEXT_PUBLIC_MEMORY_REFERENCES_ENABLED === 'true' && (

2. Also wrap citation summary the same way

3. Add to .env.example:
   NEXT_PUBLIC_MEMORY_REFERENCES_ENABLED=false

Generate patches for all locations.
```

### Prompt 5: Verify Input Clearing

```
Target: components/chat/ChatInput.tsx

Verify line 67 has: setMessage('')

If missing, add it after onSendMessage() call.
Check textarea ref is also reset.

Show current implementation or fix if needed.
```

### Prompt 6: Create Error Overlay Component

```
Create: components/system/ErrorOverlay.tsx

```tsx
'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ErrorMessage {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: number;
}

export function ErrorOverlay() {
  const [errors, setErrors] = useState<ErrorMessage[]>([]);

  // Listen for errors from window events
  useEffect(() => {
    const handleError = (event: CustomEvent) => {
      const newError: ErrorMessage = {
        id: Math.random().toString(36).substr(2, 9),
        message: event.detail.message,
        type: event.detail.type || 'error',
        timestamp: Date.now()
      };
      setErrors(prev => [...prev, newError]);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        setErrors(prev => prev.filter(e => e.id !== newError.id));
      }, 5000);
    };

    window.addEventListener('app-error', handleError as any);
    return () => window.removeEventListener('app-error', handleError as any);
  }, []);

  const removeError = (id: string) => {
    setErrors(prev => prev.filter(e => e.id !== id));
  };

  if (errors.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
      {errors.map((error) => (
        <div
          key={error.id}
          className={`
            px-4 py-3 rounded-lg shadow-xl backdrop-blur-sm
            animate-in slide-in-from-right duration-300
            flex items-start gap-3
            ${error.type === 'error' ? 'bg-red-500/90 text-white' : ''}
            ${error.type === 'warning' ? 'bg-yellow-500/90 text-black' : ''}
            ${error.type === 'info' ? 'bg-blue-500/90 text-white' : ''}
          `}
        >
          <div className="flex-1 text-sm font-medium">
            {error.message}
          </div>
          <button
            onClick={() => removeError(error.id)}
            className="hover:opacity-70 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
```

Now integrate into layout or main app component.
```

### Prompt 7: Integrate Error System

```
Target: app/layout.tsx or components/OracleInterface.tsx

1. Import ErrorOverlay component
2. Add at root level (outside main content):
   <ErrorOverlay />

3. Create helper to dispatch errors:
   ```typescript
   export function showError(message: string, type: 'error' | 'warning' | 'info' = 'error') {
     window.dispatchEvent(new CustomEvent('app-error', { 
       detail: { message, type } 
     }));
   }
   ```

4. Update VoiceRecorder to use showError() for autoplay failures
5. Update TTS failures to trigger showError()

Generate integration code.
```

### Prompt 8: Enhanced Debug Overlay

```
Target: components/VoiceRecorder.tsx

Update debug overlay to show system status:

Add to debug panel:
- Title: "🔍 VOICE DEBUG PANEL"
- TTS Service: Sesame or Fallback
- Memory Refs: Enabled/Disabled
- Input Clear: Active
- Error Count: X errors

Make it z-50 to stay above other elements.

Generate the enhanced debug overlay code.
```

### Prompt 9: Audio Autoplay Unlock Banner

```
Safari and Chrome block autoplay. Create a universal unlock banner.

Create: components/system/AudioUnlockBanner.tsx

Features needed:
- Show "🔊 Enable Maya's Voice" at top of screen
- One click unlocks audio for entire session
- Auto-hide after unlocking
- Check if already unlocked on load
- Dispatch 'audio-unlocked' event for other components

Integrate into app/layout.tsx before ErrorOverlay.

The banner should:
1. Use gradient background (blue to purple)
2. Fixed position top center
3. Animate in from top
4. Show VolumeX icon when locked, Volume2 when unlocked
5. Play subtle confirmation sound on unlock

Generate complete implementation.
```

### Prompt 10: Create QA Checklist

```
Create: docs/VOICE_FIX_QA.md

## QA Checklist

### 1. Silence Detection
- [ ] Short phrase stops after 2.5s
- [ ] Medium phrase stops after 4s  
- [ ] Long speech stops after 6s
- [ ] Debug shows countdown

### 2. TTS Playback
- [ ] Maya's voice plays
- [ ] Logs show [TTS] Using Sesame
- [ ] Fallback works if Sesame down

### 3. Memory Toggle
- [ ] NEXT_PUBLIC_MEMORY_REFERENCES_ENABLED=false hides citations
- [ ] Setting to true shows them

### 4. Input Clearing
- [ ] Text clears after Enter
- [ ] Voice input resets after send

### 5. Error Overlay
- [ ] Errors appear bottom-right
- [ ] Above input box (z-9999)
- [ ] Auto-dismiss after 5s
- [ ] Manual close button works

Generate complete QA document.
```

---

## 🚀 Implementation Order

1. **First**: Fix silence detection (most critical)
2. **Second**: Fix TTS logging (debug visibility)
3. **Third**: Add error overlay (see all issues)
4. **Fourth**: Add memory toggle (clean demo)
5. **Last**: Verify input clearing

---

## 🧪 Testing Commands

```bash
# Start everything
npm run dev          # Frontend
cd backend && npm run dev  # Backend
cd sesame-csm && ./start-sesame.sh  # Sesame

# Test TTS failure
# Stop Sesame and send message - should show error overlay

# Test silence detection
# Record and stop speaking - should auto-stop

# Test memory toggle
NEXT_PUBLIC_MEMORY_REFERENCES_ENABLED=false npm run dev
```

---

## ✅ Success Criteria

- **No errors hidden** behind UI elements
- **Recording auto-stops** within 100ms of timeout
- **TTS attempts Sesame** first, falls back gracefully
- **Memory refs controllable** via env variable
- **Errors float visibly** in corner with auto-dismiss
- **Debug panel shows** all system status in dev mode

---

## 🐛 Common Issues

### "stopRecording is not defined"
- Ensure stopRecordingRef is set in useEffect

### "Autoplay was blocked"  
- Normal browser behavior - error overlay should show this clearly

### "Errors still hidden"
- Check z-index is [9999] not just 50

### "Memory refs still showing"
- Restart Next.js after changing env variable

---

**Ritual Version:** 1.0.0  
**Last Updated:** 2025-09-05  
**Time to Complete:** ~15 minutes