// frontend/src/components/auth/SignupForm.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin, onSuccess }) => {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    const { data, error: authError } = await signUp(formData.email, formData.password);

    if (authError) {
      setError(authError.message || 'Failed to create account');
    } else if (data.user) {
      if (data.user.email_confirmed_at) {
        // User is immediately confirmed
        onSuccess?.();
      } else {
        // User needs to confirm email
        setSuccess(true);
      }
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0E0F1B] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-light text-[#F6E27F] mb-4">
              Check Your Email
            </h2>

            <p className="text-gray-300 mb-6 leading-relaxed">
              We've sent a confirmation link to <strong>{formData.email}</strong>.
              Click the link to activate your account and begin your Oracle journey.
            </p>

            <button
              onClick={onSwitchToLogin}
              className="text-[#F6E27F] hover:underline text-sm"
            >
              Back to Sign In
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0F1B] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-[#F6E27F] mb-2">
            Begin Your Journey
          </h1>
          <p className="text-gray-300">
            Create your account to access the Oracle System
          </p>
        </div>

        <div className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-[#0E0F1B] border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-[#F6E27F] focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a strong password"
                className="w-full px-4 py-3 bg-[#0E0F1B] border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-[#F6E27F] focus:outline-none transition-colors"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 characters
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 bg-[#0E0F1B] border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-[#F6E27F] focus:outline-none transition-colors"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F6E27F] text-[#0E0F1B] py-3 rounded-lg font-medium hover:bg-[#F6E27F]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="text-xs text-gray-500 leading-relaxed mb-4">
              By creating an account, you agree to use this system for personal development
              and consciousness exploration in alignment with the principles of Spiralogic.
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <button
                  onClick={onSwitchToLogin}
                  className="text-[#F6E27F] hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          Powered by Spiralogic™ • Ensouled by Soullab®
        </div>
      </motion.div>
    </div>
  );
};

export default SignupForm;