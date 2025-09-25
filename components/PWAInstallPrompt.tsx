'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check for iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 30 seconds or 3 page interactions
      setTimeout(() => setShowInstallPrompt(true), 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => console.log('Service Worker registered:', registration.scope),
        (err) => console.log('Service Worker registration failed:', err)
      );
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Oracle app installed!');
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleIOSInstall = () => {
    // Can't auto-install on iOS, show instructions
    setShowInstallPrompt(true);
  };

  // Don't show if already installed
  if (isInstalled) return null;

  return (
    <>
      {/* Floating install button for mobile */}
      {(deferredPrompt || isIOS) && !showInstallPrompt && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2 }}
          onClick={isIOS ? handleIOSInstall : handleInstallClick}
          className="fixed top-4 right-4 z-40 bg-amber-600 text-white p-3 rounded-full shadow-lg"
        >
          <Download className="w-5 h-5" />
        </motion.button>
      )}

      {/* Install prompt modal */}
      <AnimatePresence>
        {showInstallPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowInstallPrompt(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-gradient-to-br from-black to-indigo-950 rounded-t-3xl sm:rounded-3xl p-6 max-w-md w-full border border-amber-500/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="absolute top-4 right-4 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-amber-600/20 rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-10 h-10 text-amber-400" />
                </div>
              </div>

              {/* Content */}
              <h2 className="text-2xl font-light text-white text-center mb-2">
                Install Spiralogic Oracle
              </h2>
              
              <p className="text-white/70 text-center mb-6">
                Access your sacred practice anytime, even offline. Get ritual reminders and quick check-ins.
              </p>

              {/* Features */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-2 h-2 bg-amber-400 rounded-full" />
                  <span className="text-sm">Works offline</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-2 h-2 bg-amber-400 rounded-full" />
                  <span className="text-sm">Ritual notifications</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-2 h-2 bg-amber-400 rounded-full" />
                  <span className="text-sm">Quick petal draws</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-2 h-2 bg-amber-400 rounded-full" />
                  <span className="text-sm">Home screen access</span>
                </div>
              </div>

              {/* Install button or iOS instructions */}
              {isIOS ? (
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-white/80 text-sm mb-3">To install on iOS:</p>
                    <ol className="space-y-2 text-white/70 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400">1.</span>
                        <span>Tap the <Share className="inline w-4 h-4" /> Share button</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400">2.</span>
                        <span>Scroll down and tap "Add to Home Screen"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400">3.</span>
                        <span>Tap "Add" to install</span>
                      </li>
                    </ol>
                  </div>
                  <button
                    onClick={() => setShowInstallPrompt(false)}
                    className="w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors"
                  >
                    Got it!
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Install App
                  </button>
                  <button
                    onClick={() => setShowInstallPrompt(false)}
                    className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                  >
                    Later
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}