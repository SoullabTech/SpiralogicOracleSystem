import { useState, useEffect, useCallback } from 'react';

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isInStandaloneMode: boolean;
  canPrompt: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [pwaState, setPWAState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isIOS: false,
    isAndroid: false,
    isInStandaloneMode: false,
    canPrompt: false,
    platform: 'unknown'
  });

  // Detect platform and PWA state
  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    // Check if already installed
    const isInstalled = isInStandaloneMode || localStorage.getItem('pwa-installed') === 'true';

    // Determine platform
    let platform: PWAState['platform'] = 'desktop';
    if (isIOS) platform = 'ios';
    else if (isAndroid) platform = 'android';

    setPWAState(prev => ({
      ...prev,
      isIOS,
      isAndroid,
      isInStandaloneMode,
      isInstalled,
      platform,
      isInstallable: !isInstalled && (isIOS || !!deferredPrompt)
    }));
  }, [deferredPrompt]);

  // Listen for install prompt event (Android/Desktop)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPWAState(prev => ({
        ...prev,
        isInstallable: true,
        canPrompt: true
      }));
    };

    const handleAppInstalled = () => {
      localStorage.setItem('pwa-installed', 'true');
      setPWAState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        canPrompt: false
      }));
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Install PWA
  const installPWA = useCallback(async () => {
    if (!deferredPrompt) {
      console.log('No install prompt available');
      return false;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user's choice
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('PWA installed successfully');
        localStorage.setItem('pwa-installed', 'true');
        setPWAState(prev => ({
          ...prev,
          isInstalled: true,
          isInstallable: false,
          canPrompt: false
        }));
        setDeferredPrompt(null);
        return true;
      } else {
        console.log('PWA installation dismissed');
        return false;
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  }, [deferredPrompt]);

  // Dismiss install prompt
  const dismissInstallPrompt = useCallback(() => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setPWAState(prev => ({
      ...prev,
      isInstallable: false
    }));
  }, []);

  // Check if we should show the prompt
  const shouldShowPrompt = useCallback(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (!dismissed) return true;

    // Show again after 7 days
    const dismissedTime = parseInt(dismissed);
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
    return daysSinceDismissed > 7;
  }, []);

  // Get install instructions for iOS
  const getIOSInstallInstructions = () => ({
    steps: [
      'Tap the Share button (square with arrow)',
      'Scroll down and tap "Add to Home Screen"',
      'Tap "Add" in the top right corner'
    ],
    icon: '📱'
  });

  // Register/update service worker
  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw-enhanced.js');
        console.log('Service Worker registered:', registration);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
                // New service worker activated, refresh for updates
                if (confirm('New version available! Refresh to update?')) {
                  window.location.reload();
                }
              }
            });
          }
        });

        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  }, []);

  return {
    ...pwaState,
    installPWA,
    dismissInstallPrompt,
    shouldShowPrompt,
    getIOSInstallInstructions,
    registerServiceWorker,
    isReady: true
  };
};