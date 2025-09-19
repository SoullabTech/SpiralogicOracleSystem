'use client';

import React, { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { motion } from 'framer-motion';
import { Smartphone, Check, X, Download, Share } from 'lucide-react';

export default function PWATestPage() {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isAndroid,
    isInStandaloneMode,
    platform,
    canPrompt,
    installPWA,
    registerServiceWorker
  } = usePWA();

  const [swStatus, setSWStatus] = useState<'checking' | 'registered' | 'failed'>('checking');
  const [installStatus, setInstallStatus] = useState<string>('');

  useEffect(() => {
    // Check service worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setSWStatus('registered');
      }).catch(() => {
        setSWStatus('failed');
      });
    } else {
      setSWStatus('failed');
    }
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setInstallStatus('Please use the Share button in Safari to install');
    } else {
      const success = await installPWA();
      setInstallStatus(success ? 'Successfully installed!' : 'Installation cancelled or failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 p-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-white"
        >
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Smartphone className="w-8 h-8" />
            PWA Status Check
          </h1>

          {/* Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Service Worker */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Service Worker</span>
                {swStatus === 'registered' ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : swStatus === 'failed' ? (
                  <X className="w-5 h-5 text-red-400" />
                ) : (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
              </div>
              <p className="text-sm text-white/70">
                {swStatus === 'registered' ? 'Active & Ready' :
                 swStatus === 'failed' ? 'Not Available' : 'Checking...'}
              </p>
            </div>

            {/* Platform */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Platform</span>
                <span className="text-sm px-2 py-1 bg-purple-500/30 rounded">
                  {platform.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-white/70">
                {isIOS ? 'iOS Safari' : isAndroid ? 'Android Chrome' : 'Desktop Browser'}
              </p>
            </div>

            {/* Installation Status */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Installation</span>
                {isInstalled || isInStandaloneMode ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <X className="w-5 h-5 text-yellow-400" />
                )}
              </div>
              <p className="text-sm text-white/70">
                {isInstalled ? 'Installed' :
                 isInStandaloneMode ? 'Running as App' :
                 'Not Installed'}
              </p>
            </div>

            {/* Installable */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Can Install</span>
                {isInstallable || isIOS ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <X className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <p className="text-sm text-white/70">
                {isIOS ? 'Manual Install Available' :
                 canPrompt ? 'Ready to Install' :
                 isInstalled ? 'Already Installed' : 'Not Available'}
              </p>
            </div>
          </div>

          {/* Install Button */}
          {!isInstalled && !isInStandaloneMode && (isInstallable || isIOS) && (
            <motion.button
              onClick={handleInstall}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 mb-4"
            >
              {isIOS ? <Share className="w-5 h-5" /> : <Download className="w-5 h-5" />}
              {isIOS ? 'Show Install Instructions' : 'Install Maya App'}
            </motion.button>
          )}

          {/* Status Message */}
          {installStatus && (
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p>{installStatus}</p>
            </div>
          )}

          {/* Debug Info */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="font-semibold mb-4">Debug Information</h3>
            <div className="space-y-2 text-sm text-white/70 font-mono">
              <div>standalone: {String(isInStandaloneMode)}</div>
              <div>display-mode: {window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'}</div>
              <div>navigator.standalone: {String((window.navigator as any).standalone || false)}</div>
              <div>user-agent: {platform}</div>
              <div>sw.controller: {navigator.serviceWorker?.controller ? 'active' : 'none'}</div>
            </div>
          </div>

          {/* iOS Instructions */}
          {isIOS && (
            <div className="mt-8 p-6 bg-blue-500/20 rounded-xl">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Share className="w-5 h-5" />
                iOS Installation Steps
              </h3>
              <ol className="space-y-2 text-sm">
                <li>1. Open this page in Safari (required)</li>
                <li>2. Tap the Share button (square with arrow)</li>
                <li>3. Scroll down and tap "Add to Home Screen"</li>
                <li>4. Name it "Maya" and tap "Add"</li>
              </ol>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <div className="mt-8 text-center text-white/70">
          <p className="mb-4">Quick Links for Testing:</p>
          <div className="flex gap-4 justify-center">
            <a href="/maya" className="underline hover:text-white">Maya Chat</a>
            <a href="/holoflower" className="underline hover:text-white">Holoflower</a>
            <a href="/" className="underline hover:text-white">Home</a>
          </div>
        </div>
      </div>
    </div>
  );
}