// frontend/src/components/auth/LoginForm.tsx

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToSignup,
  onSuccess,
}) => {
  const { signIn, signInWithMagicLink, resetPassword } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showMagicLink, setShowMagicLink] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await signIn(
      formData.email,
      formData.password,
    );

    if (authError) {
      setError(authError.message || "Failed to sign in");
    } else if (data.user) {
      setMessage("Successfully signed in!");
      onSuccess?.();
    }

    setLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");

    const { data, error: authError } = await signInWithMagicLink(
      formData.email,
    );

    if (authError) {
      setError(authError.message || "Failed to send magic link");
    } else {
      setMessage("Magic link sent! Check your email.");
    }

    setLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!formData.email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");

    const { data, error: authError } = await resetPassword(formData.email);

    if (authError) {
      setError(authError.message || "Failed to send reset email");
    } else {
      setMessage("Password reset email sent! Check your inbox.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0E0F1B] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-[#F6E27F] mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-300">
            Sign in to continue your Oracle journey
          </p>
        </div>

        <div className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-8">
          {/* Toggle between password and magic link */}
          <div className="flex mb-6 bg-[#0E0F1B] rounded-lg p-1">
            <button
              onClick={() => setShowMagicLink(false)}
              className={`flex-1 py-2 px-4 text-sm rounded-md transition-colors ${
                !showMagicLink
                  ? "bg-[#F6E27F] text-[#0E0F1B]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Password
            </button>
            <button
              onClick={() => setShowMagicLink(true)}
              className={`flex-1 py-2 px-4 text-sm rounded-md transition-colors ${
                showMagicLink
                  ? "bg-[#F6E27F] text-[#0E0F1B]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Magic Link
            </button>
          </div>

          <form
            onSubmit={showMagicLink ? handleMagicLink : handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-[#0E0F1B] border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-[#F6E27F] focus:outline-none transition-colors"
                required
              />
            </div>

            {!showMagicLink && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Your password"
                  className="w-full px-4 py-3 bg-[#0E0F1B] border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-[#F6E27F] focus:outline-none transition-colors"
                  required
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {message && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-sm">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F6E27F] text-[#0E0F1B] py-3 rounded-lg font-medium hover:bg-[#F6E27F]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Please wait..."
                : showMagicLink
                  ? "Send Magic Link"
                  : "Sign In"}
            </button>
          </form>

          {!showMagicLink && (
            <div className="mt-4 text-center">
              <button
                onClick={handlePasswordReset}
                disabled={loading}
                className="text-sm text-gray-400 hover:text-[#F6E27F] transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-700 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <button
                onClick={onSwitchToSignup}
                className="text-[#F6E27F] hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          Powered by Spiralogic™ • Ensouled by Soullab®
        </div>
      </motion.div>
    </div>
  );
};

export { LoginForm };
