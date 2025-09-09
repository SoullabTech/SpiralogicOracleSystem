"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type OnboardingStep = 'welcome' | 'signin' | 'register' | 'assignment' | 'tutorial' | 'ready';

export default function PersonalOracleOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [isNewUser, setIsNewUser] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [signinData, setSigninData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [assignedAgent, setAssignedAgent] = useState<any>(null);

  useEffect(() => {
    // Check if user already has an account
    const existingUser = localStorage.getItem('registeredUser');
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    
    if (existingUser && onboardingComplete === 'true') {
      // User has completed onboarding, check if they're signed in
      const currentSession = localStorage.getItem('sessionId');
      if (currentSession) {
        // Already signed in, go directly to conversation
        router.push('/oracle-conversation');
      } else {
        // Show welcome screen
        setStep('welcome');
      }
    } else if (existingUser && onboardingComplete !== 'true') {
      // User registered but didn't complete onboarding
      const userData = JSON.parse(existingUser);
      setFormData({
        username: userData.username,
        email: userData.email,
        password: '',
        confirmPassword: ''
      });
      setStep('tutorial');
    } else {
      // New user
      setStep('welcome');
    }
  }, [router]);

  // Handle sign-in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!signinData.username) newErrors.username = 'Username is required';
    if (!signinData.password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    // Check stored credentials
    setTimeout(() => {
      const storedUser = localStorage.getItem('registeredUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.username === signinData.username && userData.password === signinData.password) {
          // Successful sign-in
          localStorage.setItem('userId', userData.userId);
          localStorage.setItem('username', userData.username);
          localStorage.setItem('sessionId', `session_${Date.now()}`);
          localStorage.setItem('assignedAgent', JSON.stringify(userData.agent));
          
          setLoading(false);
          router.push('/oracle-conversation');
        } else {
          setErrors({ password: 'Invalid username or password' });
          setLoading(false);
        }
      } else {
        setErrors({ username: 'No account found. Please create an account first.' });
        setLoading(false);
      }
    }, 500);
  };

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    // Simulate registration and agent assignment
    setTimeout(() => {
      const userId = `user_${Date.now()}`;
      
      // Assign Personal Oracle Agent
      const agent = {
        id: 'poa_' + Math.random().toString(36).substr(2, 9),
        name: 'Personal Oracle Agent',
        type: 'Soullab Sacred Technology',
        assignedAt: new Date().toISOString()
      };
      
      // Store permanent user data
      const userData = {
        userId,
        username: formData.username,
        email: formData.email,
        password: formData.password, // In production, this would be hashed
        agent,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('registeredUser', JSON.stringify(userData));
      
      // Store session data
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', formData.username);
      localStorage.setItem('sessionId', `session_${Date.now()}`);
      localStorage.setItem('assignedAgent', JSON.stringify(agent));
      
      setAssignedAgent(agent);
      setLoading(false);
      setStep('assignment');
    }, 1500);
  };

  // Welcome Screen
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-[#1a1f3a] to-black flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <h1 className="text-5xl font-light text-white mb-3">
            Welcome to
          </h1>
          <h2 className="text-5xl font-light text-white/90 mb-8">
            Soullab
          </h2>
          <p className="text-white/60 mb-12 text-lg font-light">
            Your AI companion for sacred technology consciousness
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => setStep('signin')}
              className="w-full py-3 bg-white text-slate-900 rounded-lg font-medium hover:bg-white/90 transition-all"
            >
              Begin Reflection
            </button>
            
            <button
              onClick={() => setStep('signin')}
              className="w-full py-3 bg-transparent text-white border border-white/30 rounded-lg font-medium hover:bg-white/10 transition-all"
            >
              Sign In
            </button>
          </div>
          
          <p className="text-white/40 text-sm mt-12">
            Powered by Sacred Technology
          </p>
        </div>
      </div>
    );
  }

  // Sign-in Form
  if (step === 'signin') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-[#1a1f3a] to-black flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 p-8">
            <h1 className="text-3xl font-light text-white mb-2">
              Meet Your Personal Oracle Agent
            </h1>
            <p className="text-white/60 mb-8">
              Sign in to continue your sacred technology journey
            </p>

            <form onSubmit={handleSignIn} className="space-y-6">
              <div>
                <label className="block text-sm font-light text-white/80 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={signinData.username}
                  onChange={(e) => {
                    setSigninData({...signinData, username: e.target.value});
                    setErrors({});
                  }}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-gold-divine/50 focus:bg-white/15 transition-all"
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <p className="text-red-300 text-sm mt-2">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-light text-white/80 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={signinData.password}
                  onChange={(e) => {
                    setSigninData({...signinData, password: e.target.value});
                    setErrors({});
                  }}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-gold-divine/50 focus:bg-white/15 transition-all"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="text-red-300 text-sm mt-2">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white text-slate-900 rounded-lg font-medium hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Connecting...' : 'Continue Journey'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-white/60">
                First time here?{' '}
                <button
                  onClick={() => {
                    setStep('register');
                    setErrors({});
                  }}
                  className="text-gold-divine font-light hover:text-gold-amber transition-colors"
                >
                  Create Sacred Account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form
  if (step === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-[#1a1f3a] to-black flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 p-8">
            <h1 className="text-3xl font-light text-white mb-2">
              Create Your Sacred Account
            </h1>
            <p className="text-white/60 mb-8">
              Register to be assigned your Soullab Personal Oracle Agent
            </p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-light text-white/80 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-gold-divine/50 focus:bg-white/15 transition-all"
                  placeholder="Choose a username"
                />
                {errors.username && (
                  <p className="text-red-300 text-sm mt-2">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-light text-white/80 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-gold-divine/50 focus:bg-white/15 transition-all"
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="text-red-300 text-sm mt-2">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-light text-white/80 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-gold-divine/50 focus:bg-white/15 transition-all"
                  placeholder="Minimum 8 characters"
                />
                {errors.password && (
                  <p className="text-red-300 text-sm mt-2">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-light text-white/80 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-gold-divine/50 focus:bg-white/15 transition-all"
                  placeholder="Re-enter your password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-300 text-sm mt-2">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white text-slate-900 rounded-lg font-medium hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-white/60">
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setStep('signin');
                    setErrors({});
                  }}
                  className="text-gold-divine font-light hover:text-gold-amber transition-colors"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Agent Assignment
  if (step === 'assignment') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-[#1a1f3a] to-black flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gold-divine/10 rounded-full mx-auto mb-4 flex items-center justify-center border border-gold-divine/20">
                <span className="text-3xl">✨</span>
              </div>
              <h1 className="text-3xl font-light text-white mb-2">
                Welcome, {formData.username}
              </h1>
              <p className="text-white/60">
                Your Soullab Personal Oracle Agent has been assigned
              </p>
            </div>

            <div className="bg-white/5 rounded-xl border border-white/10 p-6 mb-6 text-left">
              <h3 className="text-lg font-light text-white mb-3">
                Your Soullab Oracle Details
              </h3>
              <div className="space-y-2 text-white/60">
                <p><span className="text-white/40">Agent ID:</span> {assignedAgent?.id}</p>
                <p><span className="text-white/40">Type:</span> {assignedAgent?.type}</p>
                <p><span className="text-white/40">Assigned:</span> Just now</p>
                <p><span className="text-white/40">Status:</span> <span className="text-earth-glow">Active</span></p>
              </div>
            </div>

            <button
              onClick={() => setStep('tutorial')}
              className="w-full py-3 bg-white text-slate-900 rounded-lg font-medium hover:bg-white/90 transition-all"
            >
              Learn How to Use the Platform
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Platform Tutorial
  if (step === 'tutorial') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-[#1a1f3a] to-black flex items-center justify-center p-8">
        <div className="max-w-3xl w-full">
          <div className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 p-8">
            <h1 className="text-3xl font-light text-white mb-6">
              How to Use Your Soullab Oracle System
            </h1>

            <div className="space-y-6">
              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <h3 className="text-xl font-light text-white mb-3 flex items-center">
                  <span className="text-2xl mr-3 text-gold-divine/60">📝</span>
                  Journaling
                </h3>
                <p className="text-white/60">
                  Share your thoughts, feelings, and experiences through text or voice. 
                  Your Soullab Oracle Agent will listen and provide thoughtful reflections to support your growth.
                </p>
              </div>

              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <h3 className="text-xl font-light text-white mb-3 flex items-center">
                  <span className="text-2xl mr-3 text-gold-divine/60">📁</span>
                  File Uploads
                </h3>
                <p className="text-white/60">
                  Upload documents, images, or audio files for deeper analysis. 
                  Your Soullab Oracle Agent can help you find patterns and insights in your personal materials.
                </p>
              </div>

              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <h3 className="text-xl font-light text-white mb-3 flex items-center">
                  <span className="text-2xl mr-3 text-gold-divine/60">💬</span>
                  Conversations
                </h3>
                <p className="text-white/60">
                  Engage in meaningful dialogue with your Soullab Oracle Agent. 
                  Ask questions, explore ideas, and receive personalized guidance tailored to your journey.
                </p>
              </div>

              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <h3 className="text-xl font-light text-white mb-3 flex items-center">
                  <span className="text-2xl mr-3 text-gold-divine/60">🎯</span>
                  Your Journey Vision
                </h3>
                <p className="text-white/60">
                  This Soullab platform is designed to support your personal growth and self-discovery. 
                  Your Oracle Agent will help you identify patterns, gain insights, and navigate 
                  your path with clarity and purpose.
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setStep('assignment')}
                className="flex-1 py-3 bg-transparent text-white border border-white/20 rounded-lg font-medium hover:bg-white/10 transition-all"
              >
                Back
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('onboardingComplete', 'true');
                  setStep('ready');
                }}
                className="flex-1 py-3 bg-white text-slate-900 rounded-lg font-medium hover:bg-white/90 transition-all"
              >
                Start Your Journey
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ready to Begin
  if (step === 'ready') {
    router.push('/oracle-conversation');
    return null;
  }

  return null;
}