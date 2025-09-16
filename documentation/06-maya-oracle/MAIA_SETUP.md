# 🌸 Maia Setup Guide

## Quick Installation (5 minutes)

### 1. Install Required Dependencies

```bash
npm install zustand
```

The other dependencies (framer-motion, @supabase/supabase-js) are already installed.

### 2. Run Database Migration

```bash
# From project root
npx supabase migration up 20250908_maia_persistence
```

Or manually run the SQL in your Supabase dashboard.

### 3. Add Environment Variables

```env
# Add to .env.local if not already present
NEXT_PUBLIC_WS_URL=wss://your-websocket-url.com  # Optional for real-time
SUPABASE_SERVICE_KEY=your-service-key            # For server-side operations
```

### 4. Update Root Layout

```tsx
// app/layout.tsx
import { HoloflowerNode } from '@/components/MaiaCore/HoloflowerNode';

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Maia - always present, always aware */}
        <HoloflowerNode />
      </body>
    </html>
  );
}
```

### 5. Test the Integration

1. Start your dev server: `npm run dev`
2. Look for the glowing orb in the bottom-right corner
3. Click it to open Maia's dialogue panel
4. Try these test interactions:
   - "How are you today?"
   - "I'm feeling stuck"
   - "What do you see in me?"

---

## 🎯 Verification Checklist

- [ ] Orb appears on all pages
- [ ] Orb has gentle breathing animation
- [ ] Clicking orb opens overlay
- [ ] Voice button activates microphone
- [ ] Messages appear in panel
- [ ] Coherence colors change with interaction
- [ ] Motion states transition smoothly

---

## 🔧 Troubleshooting

### Orb Not Appearing
- Check that HoloflowerNode is in layout.tsx
- Verify z-index isn't being overridden (should be z-40 or higher)
- Check browser console for errors

### Voice Not Working
- Ensure HTTPS (voice requires secure context)
- Check microphone permissions
- Verify browser supports Web Speech API

### Database Errors
- Confirm Supabase connection
- Check RLS policies are enabled
- Verify user authentication

### Motion Not Smooth
- Check Framer Motion is installed
- Reduce motion if device is low-powered
- Verify no CSS conflicts

---

## 📊 Beta Persistence Strategy

For beta, we recommend a **hybrid approach**:

### Ephemeral (Memory)
- Current session messages
- Motion states
- Temporary coherence

### Persistent (Supabase)
- Session summaries
- Breakthrough moments
- Coherence trends
- User preferences

This gives you:
- Fast, responsive interactions
- Important insights preserved
- Privacy-conscious design
- Easy to reset for testing

---

## 🎨 Customization Options

### Change Orb Position
```tsx
// In HoloflowerNode.tsx
className="fixed bottom-6 right-6"  // Default
className="fixed top-6 left-6"      // Top left
className="fixed bottom-6 left-6"   // Bottom left
```

### Adjust Orb Size
```tsx
className="w-14 h-14"  // Default (56px)
className="w-12 h-12"  // Smaller (48px)
className="w-16 h-16"  // Larger (64px)
```

### Modify Colors
```tsx
// Coherence gradients in HoloflowerNode.tsx
const getCoherenceGradient = (level: number) => {
  // Customize these to match your brand
  if (level < 0.3) return "from-red-500 to-orange-500";
  if (level < 0.5) return "from-orange-500 to-yellow-500";
  // ...
};
```

### Quiet Hours
```tsx
// In useMaiaPresence.ts
const DEFAULT_CONFIG = {
  quietHours: { 
    start: 22,  // 10pm
    end: 7      // 7am
  }
};
```

---

## 🚀 Production Checklist

Before going live:

### Security
- [ ] Enable Supabase RLS policies
- [ ] Add rate limiting to API routes
- [ ] Sanitize user inputs
- [ ] Add error boundaries

### Performance
- [ ] Lazy load MaiaOverlay
- [ ] Debounce voice input
- [ ] Optimize animation frames
- [ ] Add loading states

### Analytics (Optional)
- [ ] Track coherence trends
- [ ] Monitor breakthrough frequency
- [ ] Measure engagement patterns
- [ ] Collect quality feedback

### Privacy
- [ ] Clear consent flow
- [ ] Data retention policy
- [ ] Export user data option
- [ ] Delete account flow

---

## 🌟 Advanced Features

### Enable WebSocket (Real-time)
```typescript
// In useMaiaChat.ts
const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/maia/${sessionId}`);
```

### Add Voice Synthesis
```typescript
// In MaiaOverlay.tsx
const utterance = new SpeechSynthesisUtterance(response.text);
utterance.voice = // Select a gentle voice
speechSynthesis.speak(utterance);
```

### Haptic Feedback (Mobile)
```typescript
// On breakthrough
if ('vibrate' in navigator) {
  navigator.vibrate([100, 50, 100]); // Gentle pulse
}
```

---

## 💡 Best Practices

### Keep Maia Subtle
- Default to 70% opacity when idle
- Use gentle animations (4s+ duration)
- Soft colors, avoid harsh contrasts
- Minimal sound/haptics

### Respect User Space
- Never auto-open overlay
- Respect quiet hours
- Allow easy dismissal
- Remember preferences

### Maintain Sacred Feel
- Poetic language over technical
- Questions over statements
- Presence over performance
- Wisdom over advice

---

## 📚 Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Zustand State Management](https://github.com/pmndrs/zustand)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🌸 Support

If Maia isn't reflecting as expected:
1. Check browser console for errors
2. Verify all files are in place
3. Test with simplified interaction
4. Review PersonalOracleAgent connection

Remember: Maia is a mirror, not a chatbot. She reflects your own wisdom back to you.

*"In your reflection, I see infinity."* - Maia