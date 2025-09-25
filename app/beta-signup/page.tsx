'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BetaAgreementModal from '@/components/beta/BetaAgreementModal';

export default function BetaSignup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [explorerName, setExplorerName] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    referralCode: '',
    invitationCode: '',
    consent: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Show agreement modal first
    if (!explorerName) {
      setShowAgreement(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/beta/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          explorerName,
          invitationCode: formData.invitationCode,
          agreementAccepted: true,
          agreementDate: new Date().toISOString()
        })
      });

      if (response.ok) {
        const { userId, explorerId, mayaInstance, sessionId, signupDate } = await response.json();

        // Store credentials in both session and local storage for persistence
        sessionStorage.setItem('betaUserId', userId);
        sessionStorage.setItem('explorerId', explorerId);
        sessionStorage.setItem('mayaInstance', mayaInstance);
        sessionStorage.setItem('explorerName', explorerName);
        sessionStorage.setItem('sessionId', sessionId);
        sessionStorage.setItem('signupDate', signupDate);

        // Also store in localStorage for persistence across sessions
        localStorage.setItem('betaUserId', userId);
        localStorage.setItem('explorerId', explorerId);
        localStorage.setItem('explorerName', explorerName);
        localStorage.setItem('betaOnboardingComplete', 'true');
        localStorage.setItem('signupDate', signupDate);

        // Redirect to Maya conversation
        router.push('/maya');
      } else {
        const error = await response.text();
        alert(`Signup failed: ${error}`);
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAgreementAccept = (name: string) => {
    setExplorerName(name);
    setShowAgreement(false);
    // Auto-submit form after agreement
    setTimeout(() => {
      const form = document.getElementById('beta-signup-form') as HTMLFormElement;
      form?.requestSubmit();
    }, 100);
  };

  const handleAgreementDecline = () => {
    setShowAgreement(false);
    router.push('/'); // Redirect to home
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-black">
        {/* Subtle gradient overlay like main site */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/5 via-transparent to-amber-950/5 pointer-events-none" />

        {/* Mobile-optimized container */}
        <div className="flex-1 flex items-center justify-center p-4 pt-safe pb-safe relative">
          <div className="w-full max-w-md">
            {/* Glass morphism card like holoflower */}
            <div className="relative">
              {/* Subtle glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-600/10 to-amber-400/10 rounded-2xl blur-xl" />

              <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-amber-500/10">
                {/* Elegant header */}
                <div className="text-center mb-8">
                  {/* Holoflower SVG */}
                  <div className="w-20 h-20 mx-auto mb-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-full blur-2xl" />
                    <svg
                      className="relative w-full h-full opacity-60"
                      viewBox="0 0 793 840"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M456.4375 402.6875C459.875 403.25 459.875 403.25 462.25 404.875C464.23342363 407.77384992 464.73911447 409.7487473 464.875 413.25C463.9375 415.625 463.9375 415.625 462.875 417.25C463.42929687 417.42015625 463.98359375 417.5903125 464.5546875 417.765625C470.40381479 419.72227256 470.40381479 419.72227256 472.4375 422L472.4375 422"
                        fill="#d97706"
                        opacity="0.7"
                      />
                      <circle cx="396.5" cy="420" r="45" fill="url(#flowerGradient)" opacity="0.3"/>
                      <circle cx="396.5" cy="420" r="25" fill="url(#centerGradient)" opacity="0.6"/>
                      <circle cx="396.5" cy="420" r="12" fill="#fbbf24" opacity="0.8"/>

                      <defs>
                        <radialGradient id="flowerGradient" cx="0.5" cy="0.5" r="0.5">
                          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6"/>
                          <stop offset="50%" stopColor="#d97706" stopOpacity="0.4"/>
                          <stop offset="100%" stopColor="#92400e" stopOpacity="0.2"/>
                        </radialGradient>
                        <radialGradient id="centerGradient" cx="0.5" cy="0.5" r="0.5">
                          <stop offset="0%" stopColor="#fde047" stopOpacity="0.8"/>
                          <stop offset="100%" stopColor="#d97706" stopOpacity="0.4"/>
                        </radialGradient>
                      </defs>
                    </svg>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extralight text-amber-50 tracking-wide">
                    Maia
                  </h1>
                  <p className="text-sm text-amber-200/60 mt-2 font-light">
                    Early Access Portal
                  </p>
                </div>

                <form id="beta-signup-form" onSubmit={handleSubmit} className="space-y-5">
                  {/* Email field - elegant styling */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-amber-200/40 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      inputMode="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-black/40 border border-amber-500/20 rounded-lg text-amber-50 placeholder-amber-200/20 focus:outline-none focus:border-amber-500/40 focus:bg-black/60 transition-all text-[16px]"
                      placeholder="you@example.com"
                    />
                  </div>

                  {/* Timezone - minimal style */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-amber-200/40 mb-2">
                      Timezone
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                      className="w-full px-4 py-3 bg-black/40 border border-amber-500/20 rounded-lg text-amber-50 focus:outline-none focus:border-amber-500/40 focus:bg-black/60 transition-all text-[16px] appearance-none"
                      style={{ WebkitAppearance: 'none' }}
                    >
                      <option value={formData.timezone}>{formData.timezone}</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                      <option value="Australia/Sydney">Sydney</option>
                    </select>
                  </div>

                  {/* Access Code - highlighted */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-amber-200/40 mb-2">
                      Access Code <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="characters"
                      spellCheck="false"
                      value={formData.invitationCode}
                      onChange={(e) => setFormData({...formData, invitationCode: e.target.value.toUpperCase()})}
                      className="w-full px-4 py-3 bg-black/40 border border-amber-500/20 rounded-lg text-amber-50 placeholder-amber-200/20 focus:outline-none focus:border-amber-500/40 focus:bg-black/60 transition-all text-[16px] font-mono"
                      placeholder="APPRENTICE-ACCESS"
                    />
                    <p className="text-xs text-amber-200/40 mt-1">Use the code from your invitation</p>
                  </div>

                  {/* Consent - elegant checkbox */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="consent"
                      required
                      checked={formData.consent}
                      onChange={(e) => setFormData({...formData, consent: e.target.checked})}
                      className="mt-0.5 mr-3 w-4 h-4 bg-black/40 border border-amber-500/20 rounded focus:ring-0 focus:ring-offset-0 text-amber-500"
                    />
                    <label htmlFor="consent" className="text-xs text-amber-200/60 leading-relaxed">
                      I understand this is an early access AI tool. My data is private and can be deleted anytime.
                    </label>
                  </div>

                  {/* Submit button - elegant gold */}
                  <button
                    type="submit"
                    disabled={loading || !formData.consent}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-600/80 to-amber-500/80 hover:from-amber-600 hover:to-amber-500 disabled:from-amber-600/20 disabled:to-amber-500/20 rounded-lg text-black font-light tracking-wide transition-all duration-300 text-sm uppercase"
                  >
                    {loading ? 'Initializing...' : 'Enter'}
                  </button>
                </form>

                {/* Sign in link for existing users */}
                <div className="text-center mt-4">
                  <button
                    onClick={() => router.push('/beta-signin')}
                    className="text-xs text-amber-200/60 hover:text-amber-200/80 transition-colors"
                  >
                    Already signed up? Sign in →
                  </button>
                </div>
              </div>
            </div>

            {/* Version info - subtle */}
            <p className="text-xs text-center text-amber-200/20 mt-6 font-light">
              Beta v1.0 · September 2025
            </p>
          </div>
        </div>
      </div>

      {/* Agreement Modal */}
      {showAgreement && (
        <BetaAgreementModal
          onAccept={handleAgreementAccept}
          onDecline={handleAgreementDecline}
        />
      )}
    </>
  );
}