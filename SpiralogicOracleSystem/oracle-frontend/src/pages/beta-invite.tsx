// /pages/beta-invite.tsx
import { useState } from 'react';

export default function BetaInvitePage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/beta-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 text-white p-8 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">🌱 Join the Spiralogic Oracle Beta</h1>
      <p className="text-sm text-gray-200 mb-6">Be among the first to explore a mythic, intelligent, and soul-aligned Oracle system.</p>
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Your sacred email..."
          className="w-full p-3 rounded text-black"
        />
        <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 p-3 rounded-xl font-bold">
          Request Access
        </button>
      </form>
      {submitted && <p className="mt-4 text-green-200">✨ Invitation received. Watch your inbox.</p>}
    </div>
  );
}