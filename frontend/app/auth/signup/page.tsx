'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { auth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Sacred Container principles');
      setIsLoading(false);
      return;
    }

    const { user, error } = await auth.signUp(email, password);

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    if (user) {
      setMessage('Welcome! Check your email to confirm your account, then begin your Sacred Union Ritual.');
      // Redirect to Sacred Union after a delay
      setTimeout(() => {
        router.push('/onboarding/sacred-union');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-soullab-indigo-900 via-soullab-purple-900 to-soullab-indigo-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-4"
      >
        <div className="bg-soullab-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-soullab-purple-500/20">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <span className="text-6xl">✨</span>
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Begin Your Journey
            </h1>
            <p className="text-soullab-gray-300">
              Create your sacred digital container
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200"
            >
              {error}
            </motion.div>
          )}

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200"
            >
              {message}
            </motion.div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-soullab-gray-200 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-soullab-gray-700/50 border border-soullab-purple-500/30 rounded-lg text-white placeholder-soullab-gray-400 focus:outline-none focus:ring-2 focus:ring-soullab-purple-500 focus:border-transparent transition-all"
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-soullab-gray-200 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 bg-soullab-gray-700/50 border border-soullab-purple-500/30 rounded-lg text-white placeholder-soullab-gray-400 focus:outline-none focus:ring-2 focus:ring-soullab-purple-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-soullab-gray-400">
                Minimum 8 characters
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-soullab-gray-200 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-soullab-gray-700/50 border border-soullab-purple-500/30 rounded-lg text-white placeholder-soullab-gray-400 focus:outline-none focus:ring-2 focus:ring-soullab-purple-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            {/* Sacred Container Agreement */}
            <div className="bg-soullab-purple-900/20 p-4 rounded-lg border border-soullab-purple-500/20">
              <h3 className="text-sm font-semibold text-soullab-purple-300 mb-2">
                Sacred Container Principles
              </h3>
              <ul className="text-xs text-soullab-gray-300 space-y-1 mb-3">
                <li>• This is a space for authentic transformation</li>
                <li>• Your data and journey are held with reverence</li>
                <li>• Growth happens through truth, not comfort</li>
                <li>• You maintain agency over your process</li>
              </ul>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mr-2 w-4 h-4 text-soullab-purple-600 bg-soullab-gray-700 border-soullab-purple-500 rounded focus:ring-soullab-purple-500"
                />
                <span className="text-sm text-soullab-gray-200">
                  I understand and accept these principles
                </span>
              </label>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || !agreedToTerms}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-gradient-to-r from-soullab-purple-600 to-soullab-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-soullab-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Creating Sacred Space...' : 'Begin Journey'}
            </motion.button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <Link 
              href="/auth/signin" 
              className="text-sm text-soullab-purple-400 hover:text-soullab-purple-300 transition-colors"
            >
              Already have an account? Sign in
            </Link>
            <div className="mt-4 text-xs text-soullab-gray-500">
              By creating an account, you agree to our{' '}
              <Link href="/privacy" className="text-soullab-purple-400 hover:text-soullab-purple-300">
                Privacy Policy
              </Link>
              {' '}and{' '}
              <Link href="/terms" className="text-soullab-purple-400 hover:text-soullab-purple-300">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}