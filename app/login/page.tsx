'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { biometricAuth } from '@/lib/auth/biometricAuth';
import { deviceTrust } from '@/lib/auth/deviceTrust';
import { sessionManager } from '@/lib/auth/sessionManager';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);
  const [method, setMethod] = useState<'biometric' | 'email' | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    checkBiometricAvailability();
    checkExistingSession();
  }, []);

  const checkBiometricAvailability = async () => {
    const available = await biometricAuth.isAvailable();
    setBiometricAvailable(available);
  };

  const checkExistingSession = async () => {
    const status = await sessionManager.initSession();
    if (status.authenticated) {
      router.push('/maya');
    }
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const result = await biometricAuth.authenticate(email || undefined);

      if (result.success && result.userId) {
        const deviceId = deviceTrust.getCurrentDeviceId() || crypto.randomUUID();
        await sessionManager.createSession(result.userId, 'temp-token', deviceId);

        setMessage({ type: 'success', text: 'Welcome back! 👋' });

        setTimeout(() => {
          router.push('/maya');
        }, 1000);
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Authentication failed'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Authentication failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Check your email for a magic link! 📧'
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to send login link. Please try again.'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Something went wrong. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getBiometricIcon = () => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) {
      return { icon: '👤', text: 'Face ID' };
    } else if (/Macintosh/.test(ua)) {
      return { icon: '👆', text: 'Touch ID' };
    } else if (/Android/.test(ua)) {
      return { icon: '👆', text: 'Fingerprint' };
    } else if (/Windows/.test(ua)) {
      return { icon: '👤', text: 'Windows Hello' };
    }
    return { icon: '🔐', text: 'Biometric' };
  };

  const biometricInfo = getBiometricIcon();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-950 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
          <circle cx="500" cy="500" r="400" fill="none" stroke="#F6AD55" strokeWidth="0.5" />
          <circle cx="500" cy="500" r="300" fill="none" stroke="#F6AD55" strokeWidth="0.5" />
          <circle cx="500" cy="500" r="200" fill="none" stroke="#F6AD55" strokeWidth="0.5" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block"
          >
            <div className="text-6xl mb-4">🌸</div>
            <h1 className="text-3xl font-light text-white mb-2">Welcome back</h1>
            <p className="text-amber-200/60 text-sm">Sign in to continue your journey</p>
          </motion.div>
        </div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl"
        >
          <AnimatePresence mode="wait">
            {!method ? (
              <motion.div
                key="method-selection"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Biometric login */}
                {biometricAvailable && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBiometricLogin}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl py-4 px-6 font-medium flex items-center justify-center gap-3 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-2xl">{biometricInfo.icon}</span>
                    <span>Sign in with {biometricInfo.text}</span>
                  </motion.button>
                )}

                {/* Divider */}
                {biometricAvailable && (
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-white/20"></div>
                    <span className="text-white/40 text-sm">or</span>
                    <div className="flex-1 h-px bg-white/20"></div>
                  </div>
                )}

                {/* Email login */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMethod('email')}
                  className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl py-4 px-6 font-medium flex items-center justify-center gap-3 border border-white/20 transition-all"
                >
                  <span className="text-xl">📧</span>
                  <span>Sign in with Email</span>
                </motion.button>
              </motion.div>
            ) : method === 'email' ? (
              <motion.div
                key="email-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button
                  onClick={() => setMethod(null)}
                  className="text-white/60 hover:text-white mb-4 text-sm flex items-center gap-2"
                >
                  <span>←</span>
                  <span>Back</span>
                </button>

                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl py-3 px-6 font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send magic link'}
                  </button>
                </form>

                <p className="text-white/50 text-xs mt-4 text-center">
                  We&apos;ll email you a secure link to sign in instantly
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Message */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 p-3 rounded-lg text-sm ${
                  message.type === 'success'
                    ? 'bg-green-500/20 text-green-200 border border-green-500/30'
                    : message.type === 'error'
                    ? 'bg-red-500/20 text-red-200 border border-red-500/30'
                    : 'bg-blue-500/20 text-blue-200 border border-blue-500/30'
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8 text-white/40 text-sm"
        >
          <p>Don&apos;t have an account?</p>
          <button
            onClick={() => router.push('/beta-entry')}
            className="text-amber-400 hover:text-amber-300 mt-2 font-medium"
          >
            Join the beta →
          </button>
        </motion.div>

        {/* Security note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-white/30 text-xs">
            🔒 Secured with end-to-end encryption
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}