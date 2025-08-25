"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IntegrationAuthService } from "@/lib/auth/integrationAuth";

// Safe error message helper
const toErrorMessage = (e: unknown): string => {
  if (typeof e === 'string') return e;
  if (e && typeof e === 'object' && 'message' in e) {
    return String((e as { message?: unknown }).message ?? 'Unknown error');
  }
  try { return JSON.stringify(e); } catch { return 'Unknown error'; }
};

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const authService = new IntegrationAuthService();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage("");

    try {
      // Send magic link
      const { error } = await authService.signInWithEmail(email);
      
      if (error) {
        setMessage(`Error: ${toErrorMessage(error)}`);
      } else {
        setMessage("Check your email for the magic link!");
      }
    } catch (err: unknown) {
      setMessage(`Error: ${toErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-purple-900 text-yellow-400 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white/10 rounded-xl border border-white/20 p-8 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔮</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Sign In</h1>
          <p className="text-white/80">
            Access your sacred development platform
          </p>
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold py-3 px-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </button>

          {message && (
            <div className={`text-center text-sm p-3 rounded-lg ${
              message.startsWith('Error') 
                ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                : 'bg-green-500/20 text-green-300 border border-green-500/30'
            }`}>
              {message}
            </div>
          )}
        </form>

        <div className="mt-8 pt-6 border-t border-white/20">
          <p className="text-center text-sm text-white/60">
            New to the platform?{" "}
            <button
              onClick={() => router.push("/auth/onboarding")}
              className="text-yellow-400 hover:text-yellow-300 font-medium"
            >
              Start your journey
            </button>
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-white/60 hover:text-white/80 text-sm transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}