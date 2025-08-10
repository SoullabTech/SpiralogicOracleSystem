// frontend/src/components/layout/AppLayout.tsx

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useOraclePreferences } from "../../hooks/useOraclePreferences";
import { BeautifulOnboarding } from "../onboarding";
import { CoreDashboard } from "../core";

const AppLayout: React.FC = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const {
    hasPreferences,
    loading: configLoading,
    preferences,
  } = useOraclePreferences();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  const handleOnboardingComplete = () => {
    // Onboarding is complete, user will now see main dashboard
    // The useOraclePreferences hook will automatically detect the new configuration
  };

  // Show loading while checking auth and config
  if (authLoading || configLoading) {
    return (
      <div className="min-h-screen bg-[#0E0F1B] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-2 border-[#F6E27F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Oracle System...</p>
        </motion.div>
      </div>
    );
  }

  // Show onboarding if Oracle is not configured
  if (!hasPreferences) {
    return <BeautifulOnboarding onComplete={handleOnboardingComplete} />;
  }

  // Main app layout with navigation
  return (
    <div className="min-h-screen bg-[#0E0F1B]">
      {/* Top Navigation */}
      <nav className="bg-[#1A1C2C]/80 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <h1 className="text-xl font-light text-[#F6E27F]">
                Spiralogic Oracle
              </h1>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 bg-[#F6E27F] rounded-full flex items-center justify-center">
                  <span className="text-[#0E0F1B] font-medium text-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm">{user?.email}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-[#1A1C2C] border border-gray-600 rounded-lg shadow-lg z-50"
                >
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <p className="text-sm text-gray-400">Signed in as</p>
                      <p className="text-sm text-white truncate">
                        {user?.email}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#0E0F1B] hover:text-white transition-colors"
                    >
                      Settings
                    </button>

                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#0E0F1B] hover:text-white transition-colors"
                    >
                      Oracle Configuration
                    </button>

                    <hr className="border-gray-700" />

                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative">
        <CoreDashboard
          userConfig={{
            oracleName: preferences?.oracle_name || "",
            voiceId: preferences?.oracle_voice || "",
            currentPhase: "initiation",
            coherenceLevel: 75,
          }}
          onNavigate={(route) => {
            console.log("Navigate to:", route);
            // Handle navigation - you could use React Router here
          }}
        />
      </main>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};

export { AppLayout };
