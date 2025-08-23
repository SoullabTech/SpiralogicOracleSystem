# Maya Voice Cues Integration Guide

Maya provides contextual voice feedback for key system events like upload completion and recap generation. This guide shows how to integrate her voice cues throughout the application.

## API Integration (Server-Side)

### Upload Completion

When uploads finish processing, the API returns a voice cue that clients can handle:

```typescript
// app/api/uploads/process/route.ts
const mayaPostUploadCue = {
  shouldSpeak: true,
  text: "I've received your upload. I'll weave its insights into our conversation. What would you like to focus on first?",
  context: 'post_upload'
};

return NextResponse.json({
  status: 'ready',
  // ... other fields
  maya_voice_cue: mayaPostUploadCue
});
```

### Recap/Thread Weaving Completion

```typescript
// app/api/oracle/weave/route.ts
const mayaPostRecapCue = {
  shouldSpeak: true,
  text: "I've prepared a short synthesis of your recent journey. Would you like me to read the highlights or save them to your journal?",
  context: 'post_recap'
};

return NextResponse.json({
  text: weavedText,
  // ... other fields
  maya_voice_cue: mayaPostRecapCue
});
```

## Client-Side Integration

### Import Helper Functions

```typescript
import { handleMayaVoiceCue, speakMayaPostUpload, speakMayaPostRecap } from '@/lib/voice/maya-cues';
```

### Handle API Response Cues

When your API returns a `maya_voice_cue`, handle it automatically:

```typescript
// After successful API call
const response = await fetch('/api/oracle/weave', {
  method: 'POST',
  // ... request details
});

if (response.ok) {
  const data = await response.json();
  
  // Handle Maya's voice cue
  await handleMayaVoiceCue(data.maya_voice_cue);
  
  // Continue with your logic
  setWeavedThread(data.text);
}
```

### Direct Voice Cues (Client Events)

For client-side events where you don't have an API response:

```typescript
// After upload processing completes
const handleUploadComplete = async (uploadData: any) => {
  // Update UI
  setUploadStatus('ready');
  
  // Speak Maya's upload completion cue
  await speakMayaPostUpload();
};

// After manually generating a recap
const handleRecapGenerated = async () => {
  // Update UI with recap
  setRecapVisible(true);
  
  // Speak Maya's recap cue
  await speakMayaPostRecap();
};
```

## Integration Examples

### Upload Button Component

```typescript
const handleUploadSuccess = async (uploadResult: any) => {
  // Update upload state
  setUploads(prev => updateUploadInList(prev, uploadResult));
  
  // Handle voice cue from API response
  await handleMayaVoiceCue(uploadResult.maya_voice_cue);
  
  // Refresh upload context
  await fetchRecentUploads();
};
```

### Thread Weaving Button

```typescript
const handleWeaveThread = async () => {
  setIsWeaving(true);
  
  try {
    const response = await fetch('/api/oracle/weave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, userId }),
    });

    if (response.ok) {
      const weaveData = await response.json();
      setWeavedThread(weaveData.text);
      
      // Maya speaks about the completed recap
      await handleMayaVoiceCue(weaveData.maya_voice_cue);
    }
  } finally {
    setIsWeaving(false);
  }
};
```

### Upload Processing Status

```typescript
const processUpload = async (uploadId: string) => {
  const response = await fetch('/api/uploads/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uploadId }),
  });

  if (response.ok) {
    const result = await response.json();
    
    // Update upload status
    setUploadStatus(result.status);
    
    // Maya announces the upload is ready
    await handleMayaVoiceCue(result.maya_voice_cue);
  }
};
```

## Feature Flag Respect

All Maya voice cues automatically respect the feature flags:

- `NEXT_PUBLIC_ORACLE_VOICE_ENABLED=false` - Disables all voice
- `NEXT_PUBLIC_ORACLE_MAYA_VOICE=false` - Disables Maya specifically

The helper functions handle these checks internally, so you don't need conditional logic.

## Voice Cue Types

| Context | Timing | Default Script |
|---------|--------|---------------|
| `post_upload` | After file processing completes | ~8-10 seconds |
| `post_recap` | After thread weaving/recap generates | ~10-12 seconds |

## Best Practices

1. **Always use the helper functions** - They handle feature flags and error cases
2. **Don't duplicate cues** - If the API provides a cue, don't also call direct functions
3. **Handle async properly** - Voice cues are async, but don't block UI updates
4. **Graceful degradation** - Voice failures should not break the user experience

## Testing Voice Cues

Visit `/dev/voice` to test all Maya greeting contexts and verify voice cue behavior during development.

## Future Extensions

The voice cue system is designed to support additional contexts:

```typescript
// Potential future contexts
'post_journal_entry' | 'session_timeout' | 'insight_discovered' | 'milestone_reached'
```

New contexts can be added to the `MAYA_SCRIPT` object and handled by the existing infrastructure.