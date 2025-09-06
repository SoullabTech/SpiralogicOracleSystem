// frontend/src/components/auth/AuthCallback.tsx

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";

interface AuthCallbackProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const AuthCallback: React.FC<AuthCallbackProps> = ({ onSuccess, onError }) => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Processing authentication...");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get("access_token");
        const refreshToken = urlParams.get("refresh_token");
        const error = urlParams.get("error");
        const errorDescription = urlParams.get("error_description");

        if (error) {
          throw new Error(errorDescription || error);
        }

        if (accessToken && refreshToken) {
          // Set the session with the tokens
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) throw sessionError;

          if (data.user) {
            setStatus("success");
            setMessage("Authentication successful! Redirecting...");

            // Small delay before calling onSuccess
            setTimeout(() => {
              onSuccess?.();
            }, 1500);
          } else {
            throw new Error("No user data received");
          }
        } else {
          // Check if there&apos;s a session in the URL hash (for some OAuth flows)
          const { data, error: sessionError } =
            await supabase.auth.getSessionFromUrl();

          if (sessionError) throw sessionError;

          if (data.session) {
            setStatus("success");
            setMessage("Authentication successful! Redirecting...");

            setTimeout(() => {
              onSuccess?.();
            }, 1500);
          } else {
            throw new Error("No authentication data found");
          }
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        setStatus("error");
        setMessage(
          error instanceof Error ? error.message : "Authentication failed",
        );
        onError?.(
          error instanceof Error ? error.message : "Authentication failed",
        );
      }
    };

    handleAuthCallback();
  }, [onSuccess, onError]);

  return (
    <div className="min-h-screen bg-[#0E0F1B] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <div className="mb-8">
          {status === "loading" && (
            <div className="w-16 h-16 border-2 border-[#F6E27F] border-t-transparent rounded-full animate-spin mx-auto"></div>
          )}

          {status === "success" && (
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}

          {status === "error" && (
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          )}
        </div>

        <h2 className="text-2xl font-light text-[#F6E27F] mb-4">
          {status === "loading" && "Authenticating..."}
          {status === "success" && "Welcome Back!"}
          {status === "error" && "Authentication Failed"}
        </h2>

        <p className="text-gray-300 mb-6">{message}</p>

        {status === "error" && (
          <button
            onClick={() => (window.location.href = "/auth")}
            className="bg-[#F6E27F] text-[#0E0F1B] px-6 py-2 rounded-lg font-medium hover:bg-[#F6E27F]/90 transition-colors"
          >
            Try Again
          </button>
        )}

        <div className="mt-8 text-sm text-gray-500">
          Powered by Spiralogic™ • Ensouled by Soullab®
        </div>
      </motion.div>
    </div>
  );
};

export { AuthCallback };
