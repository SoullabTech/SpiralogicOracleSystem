# Oracle Weave Integration Guide

## Overview
The Oracle Weave feature creates meaningful summaries from conversation threads, allowing users to capture and save the essence of their oracle consultations.

## Current Implementation Status

### ✅ Backend Ready
- `/api/oracle/weave` endpoint fully implemented
- Privacy protection with content redaction
- Timeout management and error handling
- Soul Memory integration for bookmark storage

### ✅ Frontend Partially Implemented
- Basic weave button exists in `app/oracle/page.tsx`
- Simple thread display component
- Loading states and basic error handling

### 🎯 Enhanced Components Created
- `WeaveButton.tsx` - Improved button with better UX
- `WovenThread.tsx` - Rich display with copy/share features

## Integration Steps

### 1. Update Oracle Page Imports
```tsx
// app/oracle/page.tsx
import { WeaveButton } from './components/WeaveButton'
import { WovenThread } from './components/WovenThread'
```

### 2. Replace Existing Weave Button
Replace the current weave button section with:

```tsx
{/* Thread Weaving Option */}
{showWeaveOption && !weavedThread && (
  <WeaveButton
    conversationId={conversationId}
    userId={session?.user?.id || 'anonymous'}
    turnCount={Math.min(exchangeCount, 5)}
    onWeaveComplete={(text) => {
      setWeavedThread(text)
      setShowWeaveOption(false)
    }}
    className="flex justify-center"
  />
)}
```

### 3. Replace Thread Display
Replace the current woven thread display with:

```tsx
{/* Woven Thread Display */}
{weavedThread && (
  <WovenThread
    text={weavedThread}
    userQuote={questionHistory.at(-1)?.question}
    savedId="thread_saved" // You can get actual ID from weave response
    className="animate-in fade-in slide-in-from-bottom-2"
  />
)}
```

### 4. Show Weave Option Logic
Update the logic to show the weave button after meaningful exchanges:

```tsx
// In handleSubmitQuestion success block:
setExchangeCount(prev => prev + 1)

// Show weave option after 2+ exchanges
if (exchangeCount >= 2) {
  setShowWeaveOption(true)
}
```

## User Experience Flow

### 1. Conversation Start
- User asks oracle questions
- Oracle provides wisdom and guidance
- Conversation builds context

### 2. Weave Opportunity
- After 2+ exchanges, weave button appears
- Button has elegant hover animation
- Clear call-to-action text

### 3. Weaving Process
- Click triggers weave with loading animation
- "Weaving your wisdom..." message
- Graceful error handling if fails

### 4. Thread Display
- Beautiful card with gold accents
- Shows timestamp and user quote (if available)
- Copy to clipboard functionality
- Native share support (mobile)
- Soul Memory save confirmation

## Additional Features to Consider

### 1. Auto-Suggest Weaving
```tsx
// After particularly profound exchanges
if (response.insight?.depth === 'profound') {
  setShowWeaveOption(true)
  // Optional: Show gentle pulse animation on button
}
```

### 2. Weave History
```tsx
// Track multiple weaves in session
const [weaveHistory, setWeaveHistory] = useState<Array<{
  id: string
  text: string
  timestamp: string
}>>([])
```

### 3. Weave Quality Indicators
```tsx
// Show thread richness
const threadQuality = exchangeCount >= 5 ? 'rich' : 
                     exchangeCount >= 3 ? 'meaningful' : 'emerging'
```

### 4. Keyboard Shortcut
```tsx
// Cmd/Ctrl + W to weave
useEffect(() => {
  const handleKeyboard = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'w' && showWeaveOption) {
      e.preventDefault()
      handleWeaveThread()
    }
  }
  window.addEventListener('keydown', handleKeyboard)
  return () => window.removeEventListener('keydown', handleKeyboard)
}, [showWeaveOption])
```

## API Response Enhancement

The weave endpoint returns:
```typescript
{
  text: string          // The woven thread text
  saved: boolean        // Confirmation of storage
  soulMemoryId: string  // ID for future reference
  weavedFromCount: number // Number of memories used
  userQuote: string     // Extracted meaningful quote
}
```

Use all these fields to enhance the display:

```tsx
const handleWeaveComplete = (data: WeaveResponse) => {
  setWeavedThread({
    text: data.text,
    id: data.soulMemoryId,
    quote: data.userQuote,
    memoryCount: data.weavedFromCount
  })
}
```

## Accessibility Considerations

1. **Keyboard Navigation**: Ensure weave button is focusable
2. **Screen Reader**: Announce when thread is woven
3. **Color Contrast**: Gold accents meet WCAG AA standards
4. **Loading States**: Clear indication of processing

## Performance Tips

1. **Debounce**: Prevent double-clicks during weaving
2. **Cache**: Store woven threads locally for instant display
3. **Prefetch**: Warm up weave endpoint after 2nd exchange
4. **Progressive**: Show partial results as they stream

## Testing Checklist

- [ ] Weave button appears after 2+ exchanges
- [ ] Loading animation during weave process
- [ ] Error message on failure
- [ ] Successful weave displays beautifully
- [ ] Copy to clipboard works
- [ ] Share functionality (on supported devices)
- [ ] Soul Memory save indicator shows
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen reader announces states
- [ ] Performance: no UI blocking during weave