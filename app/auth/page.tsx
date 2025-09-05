"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, ArrowRight } from 'lucide-react';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!username || password.length < 6) {
        throw new Error(isSignUp 
          ? 'Username required and password must be at least 6 characters' 
          : 'Invalid credentials'
        );
      }

      // Beta authentication (localStorage for now)
      const users = JSON.parse(localStorage.getItem('beta_users') || '{}');
      
      if (isSignUp) {
        if (users[username]) {
          throw new Error('Username already taken');
        }
        
        // Everyone gets Maya as their Oracle in beta
        const agent = { 
          id: 'maya-oracle', 
          name: 'Maya' 
        };
        
        const newUser = {
          id: `user_${Date.now()}`,
          username,
          agentId: agent.id,
          agentName: agent.name,
          createdAt: new Date().toISOString()
        };
        
        users[username] = { ...newUser, password };
        localStorage.setItem('beta_users', JSON.stringify(users));
        localStorage.setItem('beta_user', JSON.stringify(newUser));
        
        router.push('/onboarding');
      } else {
        if (!users[username] || users[username].password !== password) {
          throw new Error('Invalid username or password');
        }
        
        const { password: _, ...userData } = users[username];
        localStorage.setItem('beta_user', JSON.stringify(userData));
        // Check if user has completed onboarding
        if (userData.onboarded) {
          router.push('/oracle');
        } else {
          router.push('/onboarding');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D16] text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light mb-2">
            Soullab
          </h1>
          <p className="text-sm text-gray-400">
            {isSignUp ? 'Create your beta account' : 'Welcome back'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full pl-10 pr-3 py-3 bg-[#1A1F2E] border border-[#FFD700]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700]/50"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 characters)"
                className="w-full pl-10 pr-3 py-3 bg-[#1A1F2E] border border-[#FFD700]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700]/50"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#FFD700] text-[#0A0D16] rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Loading...</span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {isSignUp ? 'Create Account' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
          }}
          className="w-full mt-4 text-sm text-[#FFD700] hover:text-[#F6AD55] transition-colors"
        >
          {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
        </button>

        <p className="text-center text-xs text-gray-600 mt-8">
          Beta Testing • Encrypted • Private
        </p>
      </div>
    </div>
  );
}