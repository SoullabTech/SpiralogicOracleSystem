"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { IntegrationAuthService } from "../lib/auth/integrationAuth";

export default function HomePage() {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Authenticated user view
  if (currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Welcome back to Spiralogic Oracle
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
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

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                Access the AÍÑ Oracle for guidance and reflection
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
              onClick={async () => {
                await authService.signOut();
                setCurrentUser(null);
              }}
              className="text-gray-400 hover:text-white underline text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Public landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="mb-6">
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <span className="text-4xl">🔮</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4">Spiralogic Oracle System</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Integration-centered personal development platform supporting
            authentic growth through elemental wisdom and community grounding
          </p>
        </header>

        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/5 backdrop-blur rounded-lg p-6">
              <div className="text-3xl mb-3">🌀</div>
              <h3 className="text-xl font-semibold mb-2">Elemental Wisdom</h3>
              <p className="text-gray-300 text-sm">
                Fire, Water, Earth, and Air archetypes guide adaptive content
                delivery
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur rounded-lg p-6">
              <div className="text-3xl mb-3">🚫</div>
              <h3 className="text-xl font-semibold mb-2">
                Bypassing Prevention
              </h3>
              <p className="text-gray-300 text-sm">
                Systematic integration requirements prevent spiritual
                materialism
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur rounded-lg p-6">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="text-xl font-semibold mb-2">
                Community Grounding
              </h3>
              <p className="text-gray-300 text-sm">
                Reality-checking and peer validation support authentic
                development
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Link
              href="/auth/onboarding"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition text-lg"
            >
              🚀 Begin Integration Journey
            </Link>
            <Link
              href="/oracle-demo"
              className="bg-white/10 text-white px-8 py-4 rounded-lg font-semibold border border-white/20 hover:bg-white/20 transition text-lg"
            >
              🔮 Try Demo
            </Link>
          </div>

          <div className="mb-8">
            <Link
              href="/auth"
              className="text-gray-400 hover:text-white underline text-sm"
            >
              Existing users sign in
            </Link>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>AÍÑ ∙ Spiralogic ∙ Soullab®</p>
            <p>Integration-centered development prevents spiritual bypassing</p>
          </div>
        </div>
      </div>
    </div>
  );
}
