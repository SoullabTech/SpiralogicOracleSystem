# Mobile QA Checklist

## Responsiveness Testing

### Device Rotation
- [ ] Open chat view in portrait mode
- [ ] Rotate to landscape → layout adjusts correctly, no cut-offs
- [ ] Rotate back to portrait → returns to proper layout
- [ ] Input field remains visible and accessible in both orientations
- [ ] Voice controls stay positioned correctly

### Small Screen Testing
- [ ] Test on iPhone SE / small Android (≤ 5.5")
- [ ] Chat messages don't overflow horizontally
- [ ] Bottom input bar doesn't cover messages
- [ ] Scroll works smoothly without janky behavior
- [ ] Safe areas respected (notches, home indicators)

### Input Speed & Performance
- [ ] Type quickly in chat input → no lag or dropped characters
- [ ] Voice recording starts/stops instantly
- [ ] Scroll through 50+ messages → no stuttering
- [ ] Switch between chat and other tabs → smooth transitions

### CSS Safe Area Fixes
If layouts break, apply:
```css
html, body {
  height: 100%;
  margin: 0;
}
#root {
  height: 100%;
  display: flex;
  flex-direction: column;
}
```

Or use Tailwind: `h-screen overflow-hidden`

---

## PWA Navigation Testing

### Initial Launch
- [ ] Open PWA from home screen → lands on chat view (not onboarding/auth)
- [ ] No redirect loops or "bouncing" between pages
- [ ] Splash screen appears correctly
- [ ] Install via "Add to Home Screen" → confirm installed PWA launches to correct screen (chat view) and behaves same as browser version

### Session Persistence
- [ ] Background app (home button) → reopen → returns to last screen
- [ ] Lock phone → unlock → still on same screen
- [ ] Kill app → relaunch → lands on expected page (chat or auth if logged out)

### Navigation Integrity
- [ ] Navigate to profile → back button → returns to chat
- [ ] Deep link from notification → opens correct page
- [ ] No random redirects to index/onboarding after login

### Offline Mode
- [ ] Open the app with Wi-Fi/data turned off → app shell loads without crashing
- [ ] Returns to last cached screen (chat view preferred)
- [ ] No redirect to blank page or error page

### Known Issues to Watch
- Service worker caching old routes (clear via `chrome://serviceworker-internals`)
- `start_url` in manifest.json incorrect (should be `"."` or `"/"`)
- Auth middleware causing redirect loops
- 404s sending users to wrong fallback page

---

## Bug Reporting Template

**Device:** [iPhone 14 / Pixel 7 / etc.]
**OS Version:** [iOS 17.2 / Android 13 / etc.]
**Browser:** [Safari / Chrome / etc.]
**Screen Size:** [Portrait / Landscape / Both]
**PWA Mode:** [Yes / No]

**Issue:**
[Describe what broke]

**Steps to Reproduce:**
1.
2.
3.

**Expected:** [What should happen]
**Actual:** [What actually happened]
**Screenshot:** [Attach if possible]