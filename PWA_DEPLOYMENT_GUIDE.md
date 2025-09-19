# 📱 Maya PWA Deployment & Testing Guide

## ✅ What We've Built

A **production-grade Progressive Web App** with:

- 🚀 **Advanced Service Worker** with intelligent caching strategies
- 📱 **iOS & Android Support** with platform-specific optimizations
- 💾 **Offline Mode** with beautiful fallback pages
- 🎯 **Smart Install Prompts** that respect user preferences
- 🔔 **Push Notification Ready** (for future features)
- ⚡ **Background Sync** capability
- 🎨 **Fullscreen Experience** with no browser chrome

## 🚀 Quick Start

### 1. Update Service Worker Registration

Edit `/app/layout.tsx` and add this script before closing `</body>`:

```tsx
<script dangerouslySetInnerHTML={{
  __html: `
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw-enhanced.js');
      });
    }
  `
}} />
```

### 2. Test Locally

```bash
# Build and serve locally
npm run build
npm start

# Or use a local HTTPS server (required for PWA)
npx serve out -l 3000 --ssl-cert localhost.pem --ssl-key localhost-key.pem
```

### 3. Deploy to Vercel

```bash
# Deploy with enhanced service worker
git add .
git commit -m "🚀 Add production PWA with mobile optimizations"
git push

# Vercel will auto-deploy
```

## 📱 Mobile Testing

### iPhone/iPad Installation

1. Open in **Safari** (required - Chrome won't work)
2. Navigate to `https://your-domain.vercel.app/maya`
3. Tap Share button (box with arrow)
4. Scroll down and tap "Add to Home Screen"
5. Name it "Maya" and tap Add

### Android Installation

1. Open in Chrome
2. Navigate to your app
3. You'll see an install prompt automatically
4. Or tap menu → "Add to Home Screen"

## 🔧 Customization Options

### Change Install Timing

Edit `/components/ui/PWAInstallPrompt.tsx`:

```tsx
// Show after 5 seconds (current)
const timer = setTimeout(() => {
  setShowPrompt(true);
}, 5000);

// Change to show immediately
const timer = setTimeout(() => {
  setShowPrompt(true);
}, 0);

// Or after first interaction
// Remove timer and trigger on user action
```

### Customize Cache Strategy

Edit `/public/sw-enhanced.js`:

```javascript
// Add new routes to strategies
strategies: {
  networkFirst: [
    /^\/api\/maya/,
    // Add your routes here
  ],
  cacheFirst: [
    // Static assets
  ]
}
```

### Adjust iOS Safe Areas

The CSS already handles iPhone notches. To adjust:

```css
/* In globals.css */
.safe-top {
  padding-top: max(2rem, env(safe-area-inset-top)); // Increase padding
}
```

## 🧪 Testing Checklist

### Desktop
- [ ] Install prompt appears after 5 seconds
- [ ] Can install as desktop app
- [ ] Offline page works when disconnected
- [ ] Service worker caches assets

### iOS (iPhone/iPad)
- [ ] Opens fullscreen from home screen
- [ ] No browser UI visible
- [ ] Safe areas respected (notch/home indicator)
- [ ] Voice features work
- [ ] Smooth scrolling

### Android
- [ ] Install prompt works
- [ ] Opens as standalone app
- [ ] Theme color applied to status bar
- [ ] Offline mode works

## 🎯 Performance Tips

1. **Preload Critical Assets**
   ```javascript
   // In sw-enhanced.js PRECACHE_URLS
   '/fonts/your-font.woff2',
   '/images/hero-image.webp'
   ```

2. **Optimize Images**
   - Use WebP format
   - Multiple sizes for responsive
   - Lazy load non-critical images

3. **Monitor Cache Size**
   ```javascript
   // Add to service worker
   const CACHE_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB
   ```

## 🐛 Troubleshooting

### "Install button not showing"

- Ensure HTTPS is enabled
- Check browser compatibility
- Clear site data and reload
- Verify manifest.json is loading

### "iOS not going fullscreen"

- Must be installed from Safari
- Check meta tags in layout
- Verify manifest.json settings

### "Service Worker not updating"

```javascript
// Force update in console
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
  }
});
```

## 📊 Analytics Integration

Track PWA metrics:

```typescript
// In usePWA.ts
const trackInstall = (outcome: 'accepted' | 'dismissed') => {
  // Send to your analytics
  gtag('event', 'pwa_install', {
    outcome,
    platform: pwaState.platform
  });
};
```

## 🚢 Production Checklist

Before going live:

- [ ] All icons generated (72px to 512px)
- [ ] Manifest validated: https://manifest-validator.appspot.com
- [ ] Service worker tested offline
- [ ] iOS meta tags verified
- [ ] Android install tested
- [ ] Lighthouse PWA audit passing (90+)
- [ ] HTTPS enabled on production
- [ ] Analytics tracking installed events

## 📈 Next Features to Add

1. **Push Notifications**
   ```javascript
   // Request permission
   Notification.requestPermission();
   ```

2. **Background Sync**
   ```javascript
   // Register sync event
   registration.sync.register('sync-messages');
   ```

3. **App Shortcuts** (already in manifest)

4. **Share Target** (receive shared content)

5. **Offline Audio** (cache Maya's voice)

## 🎉 Success Metrics

Your PWA is successful when:

- ✅ 50%+ mobile users install the app
- ✅ Offline usage increases engagement
- ✅ Page load < 2s on 3G
- ✅ Zero browser bar complaints
- ✅ iOS and Android users happy

## 🆘 Support

- PWA Documentation: https://web.dev/progressive-web-apps/
- Service Worker Cookbook: https://serviceworke.rs/
- iOS PWA Limitations: https://firt.dev/ios-pwa/

---

**🎊 Congratulations!** You now have a professional mobile app experience without app stores, instant updates, and full control over the user experience.