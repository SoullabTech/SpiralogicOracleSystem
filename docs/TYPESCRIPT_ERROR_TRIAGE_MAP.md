# TypeScript Error Triage Map
*Post-Crash Recovery - 2025-09-26*

## Executive Summary

**Total Errors:** 75
**Root Cause:** System crash during active development session
**Impact:** Backend mostly affected, frontend limited to 2 components

---

## Error Distribution by Type

| Error Code | Count | Description | Priority |
|------------|-------|-------------|----------|
| **TS1005** | 42 | Expected ',' or ';' or other punctuation | HIGH |
| **TS1109** | 14 | Expression expected | HIGH |
| **TS1434** | 5 | Unexpected keyword or identifier | MEDIUM |
| **TS1128** | 4 | Declaration or statement expected | MEDIUM |
| **TS1011** | 2 | Element access expression needs argument | LOW |
| **TS1003** | 2 | Identifier expected | LOW |
| **TS17014** | 1 | JSX fragment has no closing tag | HIGH |
| **TS1382** | 1 | Unexpected token (JSX) | MEDIUM |
| **TS1381** | 1 | Unexpected token (JSX) | MEDIUM |
| Others | 3 | Misc syntax errors | LOW |

**Key Insight:** 56/75 errors (75%) are **punctuation/syntax** issues, likely from file corruption during crash.

---

## Error Distribution by Location

### Backend (68 errors - 91%)

#### 🔴 Critical Files (20+ errors each)

**1. `lib/research/control-group-manager.ts`** - 23 errors
- **Pattern:** Multiple TS1005, TS1109, TS1011 errors
- **Lines affected:** 237, 269-273, 277, 283, 299-302, 313, 339-340, 346, 355
- **Likely cause:** Template literal corruption or object destructuring syntax
- **Fix strategy:** Check for malformed object spreads, incomplete template strings

**2. `scripts/export-nightly.ts`** - 12 errors
- **Pattern:** Clustered around line 393
- **All TS1005:** Expected comma errors in rapid succession
- **Likely cause:** Array or object literal with missing commas
- **Fix strategy:** Single line fix, likely a corrupted array/object

---

#### 🟡 Medium Priority Files (5-10 errors each)

**3. `lib/contemplative-space/voiceContemplativeIntegration.ts`** - 6 errors
- **Lines:** 164-165
- **Pattern:** Expected comma/colon errors
- **Likely cause:** Object literal syntax issue

**4. `lib/contemplative-space/contemplativeSpaceDesign.ts`** - 4 errors
- **Line:** 305
- **Pattern:** Unexpected keyword cascade
- **Likely cause:** Single syntax error cascading

**5. `lib/prompts/maya-casual-protocol.ts`** - 4 errors
- **Lines:** 259-263
- **Pattern:** Expected colon errors
- **Likely cause:** Template literal or type annotation syntax

**6. `lib/prompts/maya-master-formula.ts`** - 4 errors
- **Line:** 24
- **Pattern:** Expected comma errors
- **Likely cause:** Array/tuple syntax

**7. `lib/hooks/useObsidianSync.ts`** - 3 errors
- **Line:** 319
- **Pattern:** JSX/template syntax issues

**8. `lib/oracle/dashboard/mobile/MobileFirstDesign.tsx`** - 3 errors
- **Line:** 291-292
- **Pattern:** Unterminated string literal + JSX errors

---

#### 🟢 Low Priority Files (1-2 errors)

- `apps/api/backend/src/experiments/MayaExperimentCompanion.ts` - 1 error (line 74)
- `apps/api/backend/src/oracle/core/MayaLivingSystem.ts` - 1 error (line 267)
- `components/ui/MayaVoiceInterface.tsx` - 1 error (line 85)
- `scripts/setup-maya-voice.ts` - 1 error (line 40)

---

### Frontend (7 errors - 9%)

#### 🔴 Critical

**`apps/web/components/MobileChatView.tsx`** - 4 errors
```
Line 176: TS17014 - JSX fragment has no corresponding closing tag
Line 365: TS1003 - Identifier expected
Line 367: TS1381 - Unexpected token ('}')
Line 367: TS1005 - '</' expected
```
**Status:** Pre-existing crash damage, JSX structure broken
**Fix complexity:** HIGH - requires incremental debug (see playbook below)

#### 🟡 Medium

**`apps/web/components/voice/VoiceControls.tsx`** - 1 error
```
Line 280: TS1128 - Declaration or statement expected
```
**Status:** Regression from my partial fix attempt
**Fix complexity:** LOW - Clean up AnimatePresence tags I added

---

## Batch Fix Strategy

### Phase 1: Quick Wins (30 min)
Target the **single-line catastrophes** - files where all errors cluster on 1-2 lines:

1. ✅ **`scripts/export-nightly.ts:393`** - 12 errors, 1 line
2. ✅ **`lib/contemplative-space/contemplativeSpaceDesign.ts:305`** - 4 errors, 1 line
3. ✅ **`lib/prompts/maya-casual-protocol.ts:259-263`** - 4 errors, 5 lines
4. ✅ **`lib/prompts/maya-master-formula.ts:24`** - 4 errors, 1 line

**Expected reduction:** 24 errors → 51 remaining

---

### Phase 2: Control Group Manager Deep Dive (1 hour)
**`lib/research/control-group-manager.ts`** - 23 errors

**Investigation steps:**
1. Read lines 230-360 in full
2. Look for:
   - Incomplete object destructuring: `{ prop1, prop2 }` missing closing brace
   - Template literals without closing backtick
   - Array spreads with syntax errors: `[...arr, missing]`
3. Check git diff to see what changed during crash
4. Consider: Restore from last known good commit if heavily corrupted

**Expected reduction:** 23 errors → 28 remaining

---

### Phase 3: Template Literal Sweep (30 min)
Files with string/template issues:

- `lib/hooks/useObsidianSync.ts:319`
- `lib/oracle/dashboard/mobile/MobileFirstDesign.tsx:291`
- `lib/contemplative-space/voiceContemplativeIntegration.ts:164`

**Pattern to look for:**
```typescript
// BAD (crash corruption)
const x = `Hello ${name

// GOOD
const x = `Hello ${name}`;
```

**Expected reduction:** 12 errors → 16 remaining

---

### Phase 4: Frontend Surgical Strikes (Separate track)

#### 4A. VoiceControls Quick Fix (15 min)
- Remove my broken AnimatePresence wrapper
- Restore clean JSX structure
- **1 error → 0 errors**

#### 4B. MobileChatView Playbook (2-3 hours)
See detailed playbook below.

---

## Legacy vs. Regression Classification

### ✅ Legacy (Pre-crash)
All backend errors appear to be **crash corruption**. None were present before the incident.

### 🔧 Regression (My changes)
- **VoiceControls.tsx:280** - My partial fix attempt left orphaned JSX

### 🔴 Pre-existing Crash Damage
- **MobileChatView.tsx** - Complex JSX structure damaged during crash

---

## MobileChatView.tsx Debugging Playbook

### Step 1: Establish Clean Baseline
```bash
cd /Volumes/T7\ Shield/Projects/SpiralogicOracleSystem
npx tsc --noEmit --pretty false 2>&1 | grep "MobileChatView.tsx" > mobilechat-errors.log
cat mobilechat-errors.log
```

**Current errors:**
```
Line 176: JSX fragment has no corresponding closing tag
Line 365: Identifier expected
Line 367: Unexpected token
Line 367: '</' expected
```

---

### Step 2: Strip to Skeleton
```typescript
// Temporary - MobileChatView.tsx
export default function MobileChatView(props: any) {
  return <div>Mobile Chat Placeholder</div>;
}
```

**Test:** `npx tsc --noEmit apps/web/components/MobileChatView.tsx`
- ✅ Should compile clean
- ❌ If still errors → problem is in imports or function signature

---

### Step 3: Incremental Add-Back

**Order of operations:**
1. **Imports first** - Add one import at a time
2. **State hooks** - useState, useEffect, etc.
3. **Handlers** - Event handlers and functions
4. **Inner components** - `MobileVoiceMode` component
5. **Main JSX** - Piece by piece

**Template:**
```typescript
// Round 1: Just structure
return (
  <div className="mobile-chat">
    {/* TODO: Add content */}
  </div>
);

// Round 2: Add AnimatePresence wrapper
return (
  <>
    <AnimatePresence>
      {/* TODO */}
    </AnimatePresence>
  </>
);

// Round 3: Add child components one at a time
```

**After each round:** Compile and check for new errors.

---

### Step 4: Check Props Contracts

**Suspect components in MobileChatView:**
- `VoiceRecorder` (line ~153)
- `OracleVoicePlayer` (line ~214)
- `AnimatePresence` from framer-motion

**Verification checklist:**
```typescript
// For each imported component:
// 1. Open the component file
// 2. Check its prop interface
// 3. Compare with how it's called

// Example check for VoiceRecorder:
import VoiceRecorder from './VoiceRecorder';

// In VoiceRecorder.tsx, look for:
interface VoiceRecorderProps {
  onTranscription: (text: string) => void;  // Required
  onRecordingChange?: (recording: boolean) => void; // Optional
  className?: string;
}

// In MobileChatView, verify call matches:
<VoiceRecorder
  onTranscription={handleVoiceTranscription}  // ✅ Provided
  onRecordingChange={setIsRecording}          // ✅ Provided
  className="hidden"                          // ✅ Provided
/>
```

---

### Step 5: Isolate State & Context

**State variables in MobileChatView:**
```typescript
const [inputText, setInputText] = useState('');
const [isRecording, setIsRecording] = useState(false);
const [showQuickActions, setShowQuickActions] = useState(false);
const [audioEnabled, setAudioEnabled] = useState(true);
const [showMobileVoiceMode, setShowMobileVoiceMode] = useState(false);
```

**Temporary stub for testing:**
```typescript
// Replace all state with constants temporarily
const inputText = '';
const isRecording = false;
const showQuickActions = false;
const audioEnabled = true;
const showMobileVoiceMode = false;
```

**Test:** Does JSX compile now? If yes → problem is in state initialization.

---

### Step 6: Layout/Styling Pass

Once compiled, check runtime:

```bash
npm run dev
# Navigate to page with MobileChatView
```

**Checklist:**
- ✅ Component renders without crash
- ✅ Messages display correctly
- ✅ Input field is functional
- ✅ Voice button responds

**Debug tools:**
- React DevTools → Inspect component tree
- Console → Check for runtime errors
- Network tab → Verify API calls

---

### Step 7: Refactor Safety Nets

```typescript
// Create explicit prop interface
interface MobileChatViewProps {
  userId: string;
  onSendMessage: (text: string) => void;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    audioUrl?: string;
  }>;
  isLoading?: boolean;
}

export default function MobileChatView({
  userId,
  onSendMessage,
  messages = [],  // Default empty array
  isLoading = false  // Default false
}: MobileChatViewProps) {
  // Component implementation
}
```

**Add guards:**
```typescript
// Guard against undefined messages
{messages?.map((message, index) => (
  // ...
))}

// Guard against missing handlers
const handleSend = () => {
  if (!onSendMessage) {
    console.warn('onSendMessage not provided');
    return;
  }
  onSendMessage(inputText);
};
```

---

### Step 8: Regression Guard

**Quick test file:** `apps/web/components/__tests__/MobileChatView.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import MobileChatView from '../MobileChatView';

describe('MobileChatView', () => {
  const mockProps = {
    userId: 'test-user',
    onSendMessage: jest.fn(),
    messages: []
  };

  it('renders without crashing', () => {
    render(<MobileChatView {...mockProps} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('displays messages', () => {
    const messages = [
      { id: '1', role: 'user' as const, content: 'Hello' }
    ];
    render(<MobileChatView {...mockProps} messages={messages} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('calls onSendMessage when submitting', () => {
    render(<MobileChatView {...mockProps} />);
    const input = screen.getByRole('textbox');
    // ... test submission
    expect(mockProps.onSendMessage).toHaveBeenCalled();
  });
});
```

---

## Likely Suspects in Chat Components

Based on typical chat view breakage patterns:

### 1. **AnimatePresence nesting**
```typescript
// PROBLEMATIC
<AnimatePresence>
  <AnimatePresence>  // ❌ Nested
    <Component />
  </AnimatePresence>
</AnimatePresence>

// CORRECT
<AnimatePresence mode="wait">
  <Component />
</AnimatePresence>
```

### 2. **Fragment mismatches**
```typescript
// PROBLEMATIC
return (
  <>
    <div>...</div>
  // Missing closing </>

// CORRECT
return (
  <>
    <div>...</div>
  </>
);
```

### 3. **Motion.div key issues**
```typescript
// PROBLEMATIC
{messages.map(msg => (
  <motion.div>  // ❌ No key
    {msg.content}
  </motion.div>
))}

// CORRECT
{messages.map(msg => (
  <motion.div key={msg.id}>
    {msg.content}
  </motion.div>
))}
```

### 4. **Conditional rendering without guards**
```typescript
// PROBLEMATIC
{message.audioUrl && (
  <OracleVoicePlayer
    audioUrl={message.audioUrl}  // Could be undefined
  />
)}

// CORRECT
{message.audioUrl && audioEnabled && (
  <OracleVoicePlayer
    audioUrl={message.audioUrl}
    autoPlay={index === messages.length - 1}
  />
)}
```

---

## Recommended Sequence

1. ✅ **VoiceControls** (15 min) - Quick win, functional immediately
2. ✅ **Phase 1 Quick Wins** (30 min) - Knock down 24 errors
3. ✅ **Phase 3 Template Sweep** (30 min) - Another 12 errors gone
4. 🔄 **MobileChatView Playbook** (2-3 hours) - Focused debug session
5. 🔄 **Phase 2 Control Group** (1 hour) - Deep dive or restore from git
6. ✅ **Test wisdom modules** - Verify no regressions

**Total estimated time:** 5-6 hours for full cleanup

---

## Priority Ranking

| Task | Errors Fixed | User Impact | Time | Priority |
|------|--------------|-------------|------|----------|
| VoiceControls | 1 | Low (functional) | 15min | P2 |
| Phase 1 Quick Wins | 24 | None (backend) | 30min | P1 |
| Phase 3 Templates | 12 | None (backend) | 30min | P1 |
| MobileChatView | 4 | HIGH (user-facing) | 2-3h | P0 |
| Control Group | 23 | Medium (research) | 1h | P1 |
| Remaining | 11 | Low | 1h | P2 |

**Recommendation:** Do P1 items first (54 errors in 2 hours), then dedicate focused time to MobileChatView (P0).

---

*Last Updated: 2025-09-26*
*Status: Mapped, ready for batch fixes*