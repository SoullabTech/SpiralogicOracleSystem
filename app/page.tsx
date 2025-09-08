"use client";

import React from "react";
import SoulprintMilestoneFlow from "../components/MaiaCore/SoulprintMilestoneFlow";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-rose-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            Maia Soulprint System
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your sacred journey through elemental wisdom and milestone progression
          </p>
        </header>

        <SoulprintMilestoneFlow />

        <footer className="mt-16 text-center text-gray-400 text-sm">
          <p>© 2025 Maia Soulprint System. All rights reserved.</p>
          <p className="mt-2">
            Built with sacred geometry and elemental coherence
          </p>
        </footer>
      </div>
    </div>
  );
}