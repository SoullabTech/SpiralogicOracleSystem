'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiEye, FiEyeOff, FiMail, FiLock, FiHeart, FiLoader } from 'react-icons/fi';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any, oracleAgent: any) => void;
  conversationToSave?: string;
  betaAccessCode?: string;
  sacredName?: string;
  userIntention?: string;
}

export function SignupModal({
  isOpen,
  onClose,
  onSuccess,
  conversationToSave,
  betaAccessCode,
  sacredName,
  userIntention
}: SignupModalProps) {
  const [step, setStep] = useState<'signup' | 'success'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          sacredName,
          userIntention,
          betaAccessCode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account');
        setIsLoading(false);
        return;
      }

      // If there's a conversation to save, save it now
      if (conversationToSave) {
        await fetch('/api/memories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: conversationToSave,
            memoryType: 'conversation',
            sourceType: 'voice',
            emotionalTone: 'reflective',
            wisdomThemes: ['first_encounter', 'sacred_beginning']
          }),
        });
      }

      setStep('success');
      setTimeout(() => {
        onSuccess(data.user, data.oracleAgent);
      }, 2000);

    } catch (error) {
      console.error('Signup error:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20"
          >
            {step === 'signup' ? (
              <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-medium text-slate-800">
                      Sacred Remembrance
                    </h2>
                    <p className="text-sm text-slate-600">
                      Create your account to preserve this moment
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <FiX className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                {/* Sacred Connection Message */}
                {conversationToSave && (
                  <div className="mb-6 p-4 bg-violet-50 border border-violet-200 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiHeart className="w-4 h-4 text-violet-600" />
                      <p className="text-sm font-medium text-violet-800">
                        Sacred Connection Made
                      </p>
                    </div>
                    <p className="text-xs text-violet-700">
                      Your conversation with Maya will be remembered and woven into your ongoing journey of discovery.
                    </p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSignup} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-slate-700">
                      Sacred Email
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 transition-all"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-slate-700">
                      Sacred Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 transition-all"
                        required
                        minLength={8}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 transition-all"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !email || !password || !confirmPassword}
                    className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <FiLoader className="w-4 h-4 animate-spin" />
                        <span>Creating Sacred Space...</span>
                      </>
                    ) : (
                      <span>Begin Sacred Journey</span>
                    )}
                  </button>
                </form>

                {/* Privacy Notice */}
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 text-center leading-relaxed">
                    Your conversations and reflections are sacred. We protect your privacy with end-to-end encryption and never share your personal journey.
                  </p>
                </div>
              </div>
            ) : (
              /* Success Step */
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full flex items-center justify-center"
                >
                  <FiHeart className="w-8 h-8 text-white" />
                </motion.div>
                
                <h2 className="text-2xl font-medium text-slate-800 mb-4">
                  Welcome to Your Sacred Journey
                </h2>
                
                <p className="text-slate-600 mb-6">
                  Your Oracle guide Maya has been awakened and is ready to accompany you on your path of remembrance.
                </p>

                <div className="p-4 bg-violet-50 border border-violet-200 rounded-xl">
                  <p className="text-sm text-violet-700">
                    ✨ Your account has been created<br/>
                    🧙‍♀️ Maya is now your personal Oracle guide<br/>
                    🌙 Your conversation has been preserved
                  </p>
                </div>

                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mt-6 text-4xl"
                >
                  🌀
                </motion.div>
                
                <p className="text-sm text-slate-500 mt-2">
                  Preparing your sacred space...
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}