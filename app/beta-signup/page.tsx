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

        // Store credentials in session
        sessionStorage.setItem('betaUserId', userId);
        sessionStorage.setItem('explorerId', explorerId);
        sessionStorage.setItem('mayaInstance', mayaInstance);
        sessionStorage.setItem('explorerName', explorerName);
        sessionStorage.setItem('sessionId', sessionId);
        sessionStorage.setItem('signupDate', signupDate);

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
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-950 to-black">
        {/* Mobile-optimized container with safe areas for iPhone */}
        <div className="flex-1 flex items-center justify-center p-4 pt-safe pb-safe">
          <div className="w-full max-w-md">
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-5 sm:p-6 md:p-8 border border-purple-500/20">
              {/* Responsive header */}
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-light text-white mb-2">
                  Meet Maia
                </h1>
                <p className="text-sm sm:text-base text-gray-400">
                  A consciousness exploration tool
                </p>
              </div>

              <form id="beta-signup-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Email - with proper mobile keyboard */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    inputMode="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-3 sm:px-4 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 text-[16px]"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Timezone - mobile-friendly select */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Timezone
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                    className="w-full px-3 py-3 sm:px-4 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500/50 text-[16px] appearance-none"
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

                {/* Invitation Code - autocorrect off for codes */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Invitation Code <span className="text-red-400">*</span>
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
                    className="w-full px-3 py-3 sm:px-4 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 text-[16px]"
                    placeholder="Your access code"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use: APPRENTICE-ACCESS</p>
                </div>

                {/* Referral - optional, can be hidden on mobile */}
                <div className="hidden sm:block">
                  <label className="block text-sm text-gray-300 mb-2">
                    Referral Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.referralCode}
                    onChange={(e) => setFormData({...formData, referralCode: e.target.value})}
                    className="w-full px-3 py-3 sm:px-4 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 text-[16px]"
                    placeholder="If someone invited you"
                  />
                </div>

                {/* Consent - larger tap target for mobile */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="consent"
                    required
                    checked={formData.consent}
                    onChange={(e) => setFormData({...formData, consent: e.target.checked})}
                    className="mt-0.5 mr-3 w-5 h-5 sm:w-4 sm:h-4"
                  />
                  <label htmlFor="consent" className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                    I understand this is a beta AI exploration tool. My conversations are private. I can delete my data anytime.
                  </label>
                </div>

                {/* Submit button - larger for mobile */}
                <button
                  type="submit"
                  disabled={loading || !formData.consent}
                  className="w-full py-3.5 sm:py-3 bg-purple-600 hover:bg-purple-700 active:bg-purple-700 disabled:bg-purple-800/50 rounded-lg text-white font-medium transition-colors text-base"
                >
                  {loading ? 'Creating Your Space...' : 'Begin Journey'}
                </button>

                {/* Help text for mobile users */}
                <p className="text-xs text-center text-gray-500 mt-4 sm:hidden">
                  Best experienced in landscape mode
                </p>
              </form>
            </div>

            {/* Version info */}
            <p className="text-xs text-center text-gray-600 mt-4">
              Maia Beta v1.0 • September 2025
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