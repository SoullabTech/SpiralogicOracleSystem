"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { IntegrationAuthService } from "../lib/auth/integrationAuth";

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const authService = new IntegrationAuthService();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  // Authenticated user view
  if (currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              Welcome back to Spiralogic Oracle
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Continue your integration-centered development journey
            </p>
          </header>

          {/* Prominent Maya Oracle Test Button */}
          <div className="text-center mb-8">
            <Link
              href="/oracle"
              className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition text-lg shadow-lg transform hover:scale-105"
            >
              🔮 Test Maya Oracle
            </Link>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/integration/dashboard"
              className="bg-white/10 backdrop-blur rounded-lg p-6 hover:bg-white/20 transition group"
            >
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-xl font-semibold mb-2">
                Integration Dashboard
              </h3>
              <p className="text-gray-300 text-sm">
                Track your holistic development progress and integration
                milestones
              </p>
            </Link>

            <Link
              href="/elemental/content"
              className="bg-white/10 backdrop-blur rounded-lg p-6 hover:bg-white/20 transition group"
            >
              <div className="text-3xl mb-3">🌀</div>
              <h3 className="text-xl font-semibold mb-2">Elemental Content</h3>
              <p className="text-gray-300 text-sm">
                Access adaptive content through Fire, Water, Earth, and Air
                wisdom
              </p>
            </Link>

            <Link
              href="/community/reality-check"
              className="bg-white/10 backdrop-blur rounded-lg p-6 hover:bg-white/20 transition group"
            >
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="text-xl font-semibold mb-2">Community Support</h3>
              <p className="text-gray-300 text-sm">
                Connect with others for reality-checking and mutual support
              </p>
            </Link>

            <Link
              href="/analytics/dashboard"
              className="bg-white/10 backdrop-blur rounded-lg p-6 hover:bg-white/20 transition group"
            >
              <div className="text-3xl mb-3">📈</div>
              <h3 className="text-xl font-semibold mb-2">
                Development Analytics
              </h3>
              <p className="text-gray-300 text-sm">
                Privacy-focused insights into your growth patterns
              </p>
            </Link>

            <Link
              href="/dashboard"
              className="bg-white/10 backdrop-blur rounded-lg p-6 hover:bg-white/20 transition group"
            >
              <div className="text-3xl mb-3">🔮</div>
              <h3 className="text-xl font-semibold mb-2">Oracle Interface</h3>
              <p className="text-gray-300 text-sm">
                Access the Oracle for guidance and reflection
              </p>
            </Link>

            <Link
              href="/professional/dashboard"
              className="bg-white/10 backdrop-blur rounded-lg p-6 hover:bg-white/20 transition group"
            >
              <div className="text-3xl mb-3">🎓</div>
              <h3 className="text-xl font-semibold mb-2">
                Professional Support
              </h3>
              <p className="text-gray-300 text-sm">
                Connect with verified practitioners and therapists
              </p>
            </Link>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => {
                setCurrentUser(null);
                router.push("/auth/signin");
              }}
              className="text-gray-300 hover:text-white transition"
            >
              Sign Out
            </button>
          </div>

          <footer className="mt-16 text-center text-gray-400 text-sm">
            <p>© 2025 Spiralogic Oracle System. All rights reserved.</p>
            <p className="mt-2">
              Built with sacred technology and holistic wisdom
            </p>
          </footer>
        </div>
      </div>
    );
  }

  // Unauthenticated user view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Spiralogic Oracle System
          </h1>
          <p className="text-xl text-gray-300">
            Your gateway to holistic development and sacred wisdom
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <button
            onClick={() => handleNavigation("/auth/signin")}
            className="bg-white/10 backdrop-blur rounded-lg p-6 hover:bg-white/20 transition group text-left"
          >
            <div className="text-3xl mb-3">🔐</div>
            <h3 className="text-xl font-semibold mb-2 text-white">
              Sign In
            </h3>
            <p className="text-gray-300 text-sm">
              Access your personal development journey
            </p>
          </button>

          <button
            onClick={() => handleNavigation("/oracle")}
            className="bg-white/10 backdrop-blur rounded-lg p-6 hover:bg-white/20 transition group text-left"
          >
            <div className="text-3xl mb-3">🔮</div>
            <h3 className="text-xl font-semibold mb-2 text-white">Try Oracle</h3>
            <p className="text-gray-300 text-sm">
              Experience the Oracle system without signing in
            </p>
          </button>

          <button
            onClick={() => handleNavigation("/about")}
            className="bg-white/10 backdrop-blur rounded-lg p-6 hover:bg-white/20 transition group text-left"
          >
            <div className="text-3xl mb-3">ℹ️</div>
            <h3 className="text-xl font-semibold mb-2 text-white">Learn More</h3>
            <p className="text-gray-300 text-sm">
              Discover how the Oracle system can guide your journey
            </p>
          </button>
        </div>

        <footer className="mt-16 text-center text-gray-400 text-sm">
          <p>© 2025 Spiralogic Oracle System. All rights reserved.</p>
          <p className="mt-2">
            Built with sacred technology and holistic wisdom
          </p>
        </footer>
      </div>
    </div>
  );
}