'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { sessionManager } from '@/lib/auth/sessionManager';
import { deviceTrust } from '@/lib/auth/deviceTrust';

export default function VerifyMagicLinkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your magic link...');
  const [showTrustPrompt, setShowTrustPrompt] = useState(false);

  useEffect(() => {
    verifyToken();
  }, []);

  const verifyToken = async () => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing token');
      return;
    }

    try {
      const response = await fetch('/api/auth/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      const { userId, sessionToken } = await response.json();

      const deviceId = deviceTrust.getCurrentDeviceId() || crypto.randomUUID();
      const created = await sessionManager.createSession(userId, sessionToken, deviceId);

      if (created) {
        setStatus('success');
        setMessage('Successfully signed in!');

        const isTrusted = await deviceTrust.isTrustedDevice(userId);
        if (!isTrusted) {
          setShowTrustPrompt(true);
        } else {
          setTimeout(() => {
            router.push('/maya');
          }, 1500);
        }
      } else {
        throw new Error('Failed to create session');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('Failed to verify magic link. It may have expired.');
    }
  };

  const handleTrustDevice = async () => {
    const session = sessionManager.getSession();
    if (session) {
      await deviceTrust.trustDevice(session.userId);
    }
    router.push('/maya');
  };

  const handleSkip = () => {
    router.push('/maya');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center"
      >
        {status === 'verifying' && (
          <>
            <div className="text-6xl mb-4 animate-pulse">🔐</div>
            <h1 className="text-2xl font-light text-white mb-2">Verifying...</h1>
            <p className="text-white/60">{message}</p>
          </>
        )}

        {status === 'success' && !showTrustPrompt && (
          <>
            <div className="text-6xl mb-4">✨</div>
            <h1 className="text-2xl font-light text-white mb-2">Welcome back!</h1>
            <p className="text-white/60">Redirecting you to Maya...</p>
          </>
        )}

        {status === 'success' && showTrustPrompt && (
          <>
            <div className="text-6xl mb-4">📱</div>
            <h1 className="text-2xl font-light text-white mb-4">Trust this device?</h1>
            <p className="text-white/60 mb-6">
              You&apos;ll stay signed in for 30 days and can use biometric authentication next time.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleTrustDevice}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl py-3 px-6 font-medium hover:shadow-lg transition-all"
              >
                Yes, trust this device
              </button>
              <button
                onClick={handleSkip}
                className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl py-3 px-6 font-medium border border-white/20 transition-all"
              >
                Not now
              </button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-light text-white mb-2">Verification Failed</h1>
            <p className="text-white/60 mb-6">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl py-3 px-6 font-medium hover:shadow-lg transition-all"
            >
              Back to login
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}