import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleMagicLinkLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      console.error(error.message);
      setError('Failed to send magic link. Please try again.');
    } else {
      setSent(true);
      setError('');
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/dashboard');
      }
    };
    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-soullab-mist via-soullab-aether to-soullab-twilight p-6">
      <div className="bg-white/90 rounded-2xl shadow-2xl p-10 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-soullab-gold mb-6">🔐 Login to Spiral Oracle</h1>

        {sent ? (
          <p className="text-indigo-600 font-medium">
            ✅ Magic link sent! Please check your email to continue.
          </p>
        ) : (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 mb-4 rounded-lg border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-soullab-fire"
            />
            <Button className="w-full" onClick={handleMagicLinkLogin}>
              Send Magic Link
            </Button>
            {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
