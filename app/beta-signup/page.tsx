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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-950 to-black">
      <div className="max-w-md w-full mx-4">
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
          <h1 className="text-3xl font-light text-white mb-2">
            Meet Maya
          </h1>
          <p className="text-gray-400 mb-8">
            A sanctuary for self-discovery through conversation
          </p>

          <form id="beta-signup-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
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

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Invitation Code <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.invitationCode}
                onChange={(e) => setFormData({...formData, invitationCode: e.target.value})}
                className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                placeholder="Your beta access code"
              />
              <p className="text-xs text-gray-500 mt-1">Required for beta access</p>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Referral Code (Optional)
              </label>
              <input
                type="text"
                value={formData.referralCode}
                onChange={(e) => setFormData({...formData, referralCode: e.target.value})}
                className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                placeholder="If someone invited you"
              />
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="consent"
                required
                checked={formData.consent}
                onChange={(e) => setFormData({...formData, consent: e.target.checked})}
                className="mt-1 mr-3"
              />
              <label htmlFor="consent" className="text-sm text-gray-400">
                I understand this is a beta experience. My conversations are private and protected by the AIN Sanctuary protocol. I can delete my data anytime.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.consent}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800/50 rounded-lg text-white font-medium transition-colors"
            >
              {loading ? 'Creating Your Sanctuary...' : 'Begin Journey'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-purple-500/20">
            <p className="text-xs text-gray-500 text-center">
              Beta access is limited. Your feedback shapes Maya's evolution.
            </p>
          </div>
        </div>
      </div>

      {/* Beta Agreement Modal */}
      {showAgreement && (
        <BetaAgreementModal
          onAccept={handleAgreementAccept}
          onDecline={handleAgreementDecline}
        />
      )}
    </div>
  );
}