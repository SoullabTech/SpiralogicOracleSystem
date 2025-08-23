# Feature Flags Guide

## Overview
The Spiralogic Oracle System uses a comprehensive feature flag system for controlled rollouts, A/B testing, and capability-based feature enablement.

## Core Components

### 1. Feature Configuration (`lib/config/features.ts`)
- **Environment-based flags**: Read from `NEXT_PUBLIC_*` env vars
- **Grouped features**: Organized by category (library, oracle, theme, beta, dev)
- **Device detection**: Desktop, tablet, mobile, touch support
- **Capability detection**: Browser API availability checks
- **Performance detection**: Network speed, reduced motion preferences

### 2. React Hooks (`hooks/useFeature.ts`)
- **`useFeature`**: Check single feature with capability requirements
- **`useFeatures`**: Check multiple features at once
- **`useDevice`**: Responsive device detection with SSR support
- **`useResponsiveFeature`**: Device-specific feature enablement

### 3. Dev Tools (`app/dev/features`)
- Live feature flag status dashboard
- Browser capability matrix
- Environment information display
- Usage examples

## Usage Examples

### Basic Feature Check
```tsx
import { features } from '@/lib/config/features'

// Direct check
if (features.oracle.weaveEnabled) {
  return <WeaveButton />
}
```

### Hook with Capabilities
```tsx
import { useFeature } from '@/hooks/useFeature'

function VoiceInput() {
  const voice = useFeature('oracle.voiceAutoSend', {
    requireCapabilities: ['hasSpeechRecognition', 'hasSpeechSynthesis']
  })

  if (!voice.isEnabled) {
    return <TextOnlyInput reason={voice.reason} />
  }

  return <VoiceEnabledInput />
}
```

### Responsive Features
```tsx
import { useResponsiveFeature } from '@/hooks/useFeature'

function Timeline() {
  const showTimeline = useResponsiveFeature('library.timeline', {
    desktop: true,
    tablet: true,
    mobile: false // Hide on mobile for performance
  })

  if (!showTimeline) return <CompactView />
  
  return <FullTimeline />
}
```

### Multiple Feature Checks
```tsx
import { useFeatures } from '@/hooks/useFeature'

function OracleChat() {
  const features = useFeatures({
    weave: 'oracle.weaveEnabled',
    voice: {
      path: 'oracle.voiceAutoSend',
      options: { requireCapabilities: ['hasSpeechRecognition'] }
    },
    multiModal: 'oracle.multiModal'
  })

  return (
    <>
      {features.weave.isEnabled && <WeaveButton />}
      {features.voice.isEnabled && <VoiceControls />}
      {features.multiModal.isEnabled && <FileUpload />}
    </>
  )
}
```

### Oracle Weave Integration
```tsx
// In app/oracle/page.tsx
import { features } from '@/lib/config/features'

// Show weave option only if feature is enabled
{showWeaveOption && features.oracle.weaveEnabled && (
  <WeaveButton
    conversationId={conversationId}
    userId={session?.user?.id}
    onWeaveComplete={handleWeaveComplete}
  />
)}
```

## Environment Variables

### Required Format
All client-side feature flags must be prefixed with `NEXT_PUBLIC_`:

```bash
# .env.local
NEXT_PUBLIC_LIBRARY_ENABLED=true
NEXT_PUBLIC_ORACLE_WEAVE_ENABLED=true
NEXT_PUBLIC_ORACLE_VOICE_AUTO_SEND=false
NEXT_PUBLIC_BETA_CONSTELLATION=true
```

### Default Values
Some features default to `true` for better DX:
- `ORACLE_WEAVE_ENABLED` - Thread weaving (default: true)
- `THEME_SWITCHING_ENABLED` - Theme toggle (default: true)
- `THEME_PERSIST_ENABLED` - Remember theme choice (default: true)

## Capability Detection

### Available Capabilities
```typescript
capabilities = {
  hasWebGL          // 3D graphics support
  hasWebRTC         // Video/audio streaming
  hasNotifications  // Push notifications
  hasShare          // Native share dialog
  hasClipboard      // Clipboard API
  hasSpeechRecognition  // Voice input
  hasSpeechSynthesis    // Voice output
  hasVibration      // Haptic feedback
  hasGeolocation    // Location access
  hasLocalStorage   // Persistent storage
  hasServiceWorker  // Offline support
  hasWebWorker      // Background processing
}
```

### Using Capability Checks
```tsx
// Check if all required capabilities are available
const canUseVoice = checkFeatureSupport([
  'hasSpeechRecognition',
  'hasSpeechSynthesis',
  'hasWebRTC'
])
```

## Performance Considerations

### Connection-Based Features
```tsx
import { getConnectionType } from '@/lib/config/features'

function MediaUploader() {
  const connection = getConnectionType()
  
  const limits = {
    slow: { maxSize: 5 * 1024 * 1024 },    // 5MB
    medium: { maxSize: 25 * 1024 * 1024 }, // 25MB
    fast: { maxSize: 100 * 1024 * 1024 },  // 100MB
    unknown: { maxSize: 10 * 1024 * 1024 }  // 10MB default
  }
  
  return <Uploader limit={limits[connection]} />
}
```

### Reduced Motion Support
```tsx
import { isReducedMotion } from '@/lib/config/features'

function AnimatedComponent() {
  const reduceMotion = isReducedMotion()
  
  return (
    <motion.div
      animate={reduceMotion ? {} : { scale: [1, 1.1, 1] }}
      transition={reduceMotion ? {} : { duration: 0.3 }}
    />
  )
}
```

## Best Practices

### 1. Progressive Enhancement
Always provide fallbacks for disabled features:
```tsx
const share = useFeature('library.share', {
  requireCapabilities: ['hasShare']
})

return share.isEnabled ? (
  <NativeShareButton />
) : (
  <CopyLinkButton /> // Fallback
)
```

### 2. Loading States
Handle SSR/hydration properly:
```tsx
const feature = useFeature('beta.constellation')

if (feature.isLoading) {
  return <Skeleton /> // Prevents hydration mismatch
}

return feature.isEnabled ? <Constellation /> : null
```

### 3. Feature Documentation
Document why features exist and their rollout plan:
```typescript
// Feature: Oracle Thread Weaving
// Purpose: Create conversation summaries for reflection
// Rollout: 100% (default enabled)
// Disable: Set NEXT_PUBLIC_ORACLE_WEAVE_ENABLED=false
```

### 4. A/B Testing
Use feature flags for experiments:
```tsx
const variant = features.beta.newOnboarding ? 'B' : 'A'
trackEvent('onboarding_viewed', { variant })
```

## Debugging

### Dev Tools Page
Visit `/dev/features` to see:
- All feature flag states
- Browser capabilities
- Environment information
- Device detection results

### Console Helpers
```typescript
// In development, expose helpers
if (process.env.NODE_ENV === 'development') {
  window.__features = features
  window.__capabilities = capabilities
}
```

### Feature Override (Development)
```typescript
// Override features via localStorage (dev only)
if (process.env.NODE_ENV === 'development') {
  const overrides = JSON.parse(
    localStorage.getItem('featureOverrides') || '{}'
  )
  Object.assign(flags, overrides)
}
```

## Testing

### Unit Tests
```typescript
// Mock feature flags in tests
jest.mock('@/lib/config/features', () => ({
  features: {
    oracle: { weaveEnabled: true },
    theme: { switchingEnabled: true }
  }
}))
```

### E2E Tests
```typescript
// Set features via environment
test('weave button appears', async ({ page }) => {
  process.env.NEXT_PUBLIC_ORACLE_WEAVE_ENABLED = 'true'
  await page.goto('/oracle')
  await expect(page.getByText('Weave thread')).toBeVisible()
})
```

## Migration Guide

### From Hard-Coded to Feature Flags
```tsx
// Before
const SHOW_WEAVE = true

// After
import { features } from '@/lib/config/features'
const showWeave = features.oracle.weaveEnabled
```

### Adding New Features
1. Add environment variable to `.env.example`
2. Add flag to `lib/config/features.ts`
3. Document in this guide
4. Add to `/dev/features` dashboard
5. Create rollout plan

## Security Notes

- Feature flags are client-visible (NEXT_PUBLIC_*)
- Don't use for security-critical features
- Server-side features use different pattern
- Validate features on backend for sensitive operations