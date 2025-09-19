'use client';

import { useEffect } from 'react';

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw-enhanced.js')
          .then((registration) => {
            console.log('✅ PWA Service Worker registered:', registration.scope);

            // Check for updates periodically
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000); // Check every hour

            // Handle updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
                    // Show update notification
                    console.log('🆕 New version available! Refresh to update.');
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error('❌ PWA Service Worker registration failed:', error);
          });
      });
    }

    // iOS specific: Check if running in standalone mode
    if ((window.navigator as any).standalone) {
      document.documentElement.classList.add('ios-standalone');
    }

    // Add install state to body for CSS hooks
    if (window.matchMedia('(display-mode: standalone)').matches) {
      document.documentElement.classList.add('pwa-installed');
    }
  }, []);

  return <>{children}</>;
}