import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageTransition } from '@/components/PageTransition';
import { SacredFooter } from '@/components/SacredFooter';
import { supabase } from '@/lib/supabaseClient';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Determine where to redirect after login
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Send the magic link OTP to the user's email
      const { error } = await supabase.auth.signInWithOtp({ email });

      // If there is an error, throw it
      if (error) throw error;

      // Show alert and navigate to the next page after sending the magic link
      alert('✉️ Check your email for the magic link!');
      navigate('/magic-link-sent', { replace: true }); // Redirect to a "magic link sent" page
      navigate(from, { replace: true }); // Navigate to the original page user wanted to access (e.g., /dashboard)
    } catch (err: any) {
      console.error('Login error:', err.message);
      alert(`Login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen justify-between bg-gradient-to-br from-indigo-100 via-pink-100 to-yellow-100">
        <main className="flex-grow flex items-center justify-center p-4">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-lg"
          >
            <h2 className="text-3xl font-bold mb-6 text-center text-pink-700">Login</h2>
            <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-gray-200 rounded p-2 mb-4 focus:border-pink-500 transition"
              placeholder="you@example.com"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-500 text-white py-2 rounded-full hover:bg-pink-600 transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        </main>
        <footer className="mt-auto">
          <SacredFooter />
        </footer>
      </div>
    </PageTransition>
  );
};

export default LoginPage;
