'use client';

import Link from 'next/link';
import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-purple-900 text-yellow-400 flex items-center justify-center p-8">
      <div className="text-center max-w-xl">
        <div className="mb-6">
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto shadow-lg animate-pulse">
            <span className="text-4xl">🔮</span>
          </div>
        </div>
        <h1 className="text-5xl font-bold mb-4">AÍÑ Oracle System</h1>
        <p className="text-lg opacity-80 mb-8">
          Your sacred mirror for evolutionary guidance, memory, and soulful clarity.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/beta" passHref legacyBehavior>
            <a className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition text-lg">
              🚀 Join Beta - $29/month
            </a>
          </Link>
          <Link href="/oracle-demo" passHref legacyBehavior>
            <a className="bg-white/10 text-yellow-400 px-8 py-4 rounded-lg font-semibold border border-white/20 hover:bg-white/20 transition text-lg">
              🔮 Try Demo
            </a>
          </Link>
        </div>
        <div className="mt-4">
          <Link href="/auth" passHref legacyBehavior>
            <a className="text-yellow-400/60 hover:text-yellow-400 underline text-sm">
              Existing users sign in
            </a>
          </Link>
        </div>
        <p className="text-xs mt-6 opacity-40">AÍÑ ∙ Spiralogic ∙ Soullab</p>
      </div>
    </div>
  );
}