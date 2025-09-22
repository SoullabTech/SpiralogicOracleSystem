'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BetaSignin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    explorerName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/beta/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();

        // Store credentials in session
        sessionStorage.setItem('betaUserId', data.userId);
        sessionStorage.setItem('explorerId', data.explorerId);
        sessionStorage.setItem('explorerName', data.explorerName);
        sessionStorage.setItem('mayaInstance', data.mayaInstance);
        sessionStorage.setItem('sessionId', data.sessionId);
        sessionStorage.setItem('signupDate', data.signupDate);

        // Redirect to Maya
        router.push('/maya');
      } else {
        const error = await response.json();
        alert(error.error || 'Sign in failed');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950/5 via-transparent to-amber-950/5 pointer-events-none" />

      <div className="flex-1 flex items-center justify-center p-4 pt-safe pb-safe relative">
        <div className="w-full max-w-md">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-600/10 to-amber-400/10 rounded-2xl blur-xl" />

            <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-amber-500/10">
              <div className="text-center mb-8">
                {/* Holoflower SVG */}
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-full blur-2xl" />
                  <img
                    src="/holoflower.svg"
                    alt="Holoflower"
                    className="relative w-full h-full opacity-60"
                    style={{
                      filter: 'brightness(0) saturate(100%) invert(73%) sepia(76%) saturate(465%) hue-rotate(8deg) brightness(98%) contrast(95%)'
                    }}
                  />
                </div>

                <h1 className="text-2xl sm:text-3xl font-extralight text-amber-50 tracking-wide">
                  Welcome Back
                </h1>
                <p className="text-sm text-amber-200/60 mt-2 font-light">
                  Continue Your Journey
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-amber-200/40 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-black/40 border border-amber-500/20 rounded-lg text-amber-50 placeholder-amber-200/20 focus:outline-none focus:border-amber-500/40 focus:bg-black/60 transition-all text-[16px]"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-amber-200/40 mb-2">
                    Explorer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.explorerName}
                    onChange={(e) => setFormData({...formData, explorerName: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-3 bg-black/40 border border-amber-500/20 rounded-lg text-amber-50 placeholder-amber-200/20 focus:outline-none focus:border-amber-500/40 focus:bg-black/60 transition-all text-[16px] font-mono"
                    placeholder="MAIA-ARCHITECT"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-600/80 to-amber-500/80 hover:from-amber-600 hover:to-amber-500 disabled:from-amber-600/20 disabled:to-amber-500/20 rounded-lg text-black font-light tracking-wide transition-all duration-300 text-sm uppercase"
                >
                  {loading ? 'Entering...' : 'Enter Maya'}
                </button>
              </form>

              <div className="text-center mt-6 space-y-2">
                <button
                  onClick={() => router.push('/beta-signup')}
                  className="text-xs text-amber-200/60 hover:text-amber-200/80 transition-colors block w-full"
                >
                  New explorer? Sign up →
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-center text-amber-200/20 mt-6 font-light">
            Beta v1.0 · September 2025
          </p>
        </div>
      </div>
    </div>
  );
}