"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IntegrationAuthService } from "@/lib/auth/integrationAuth";

// Safe error message helper - CACHE BUST 2025-08-25
const toErrorMessage = (e: unknown): string => {
  if (typeof e === 'string') return e;
  if (e && typeof e === 'object' && 'message' in e) {
    return String((e as { message?: unknown }).message ?? 'Unknown error');
  }
  try { return JSON.stringify(e); } catch { return 'Unknown error'; }
};

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const authService = new IntegrationAuthService();

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      // Handle the auth callback
      const { data, error } = await authService.handleAuthCallback();
      
      if (error) {
        setStatus("error");
        setMessage(`Authentication failed: ${toErrorMessage(error)}`);
        return;
      }

      if (data.user) {
        setStatus("success");
        setMessage("Authentication successful!");

        // Check if user has completed onboarding
        const userMetadata = data.user.user_metadata || {};
        const hasCompletedOnboarding = userMetadata.onboarding_completed;

        // Redirect after a short delay
        setTimeout(() => {
          // Check if onboarding is skipped via env var (client-side check)
          const skipOnboarding = process.env.NEXT_PUBLIC_SKIP_ONBOARDING === 'true';
          
          if (skipOnboarding || hasCompletedOnboarding) {
            router.push("/oracle"); // Go straight to Oracle for testing
          } else {
            router.push("/auth/onboarding");
          }
        }, 2000);
      } else {
        setStatus("error");
        setMessage("No user data received");
      }
    } catch (err: unknown) {
      setStatus("error");
      setMessage(`Authentication failed: ${toErrorMessage(err)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-purple-900 text-yellow-400 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white/10 rounded-xl border border-white/20 p-8 backdrop-blur-sm text-center">
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            {status === "loading" && <span className="text-2xl animate-spin">🔮</span>}
            {status === "success" && <span className="text-2xl">✨</span>}
            {status === "error" && <span className="text-2xl">❌</span>}
          </div>
          
          <h1 className="text-2xl font-bold mb-2">
            {status === "loading" && "Authenticating..."}
            {status === "success" && "Welcome!"}
            {status === "error" && "Authentication Failed"}
          </h1>
        </div>

        <div className={`p-4 rounded-lg mb-6 ${
          status === "loading" 
            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
            : status === "success"
            ? "bg-green-500/20 text-green-300 border border-green-500/30"
            : "bg-red-500/20 text-red-300 border border-red-500/30"
        }`}>
          {message || "Processing your authentication..."}
        </div>

        {status === "success" && (
          <p className="text-sm text-white/60">
            Redirecting you to your platform...
          </p>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <button
              onClick={() => router.push("/auth/signin")}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold py-2 px-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/")}
              className="text-white/60 hover:text-white/80 text-sm"
            >
              ← Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}