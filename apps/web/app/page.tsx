import Link from "next/link";
import { ArrowRight, Sparkles, Brain, Heart, Shield } from "lucide-react";

export default function HomePage() {

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white overflow-hidden">

      {/* Hero Section - Clean minimalism */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="max-w-6xl mx-auto text-center space-y-8">

          {/* Diamond Model Visual */}
          <div className="mb-12">
            <div className="w-48 h-48 mx-auto relative">
              {/* TODO: Add diamond-model.png when available */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl" />
              <div className="relative w-full h-full flex items-center justify-center">
                <Sparkles className="w-24 h-24 text-gray-400 opacity-60" />
              </div>
            </div>
          </div>

          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-light tracking-wide">
              Welcome to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-extralight">MAIA</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
              Your consciousness companion for voice journaling and symbolic intelligence
            </p>
            <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
              All facets of your life held as One — with many faces, processing and evolving into and out of life
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/auth"
              className="group relative px-8 py-4 bg-white text-[#0A0E27] rounded-lg font-medium hover:bg-gray-200 transition-all duration-300"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Begin Reflection
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            
            <Link
              href="/auth"
              className="px-8 py-4 border border-gray-600 text-gray-300 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-800/50 transition-all duration-300"
            >
              Sign In
            </Link>
          </div>

          {/* Subtle tagline */}
          <p className="text-sm text-gray-500 pt-8">
            Your growth pattern. Woven through time.
          </p>
        </div>
      </section>

      {/* Diamond Model Philosophy */}
      <section className="relative py-24 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-light text-gray-200">The Diamond Model</h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            Like a diamond, your self has many facets that refract the same light of consciousness.
          </p>
          <div className="grid grid-cols-5 gap-4 mt-12 max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
              <p className="text-xs text-gray-500">Fire</p>
              <p className="text-xs text-gray-600">Will</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center">
                <span className="text-2xl">💧</span>
              </div>
              <p className="text-xs text-gray-500">Water</p>
              <p className="text-xs text-gray-600">Emotion</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                <span className="text-2xl">🌍</span>
              </div>
              <p className="text-xs text-gray-500">Earth</p>
              <p className="text-xs text-gray-600">Body</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-cyan-500/10 rounded-full flex items-center justify-center">
                <span className="text-2xl">💨</span>
              </div>
              <p className="text-xs text-gray-500">Air</p>
              <p className="text-xs text-gray-600">Mind</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-purple-500/10 rounded-full flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <p className="text-xs text-gray-500">Aether</p>
              <p className="text-xs text-gray-600">Spirit</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 pt-8 max-w-2xl mx-auto">
            MAIA doesn't fragment you into problems to solve. She holds all facets as One—
            witnessing your complexity as wholeness, not chaos.
          </p>
        </div>
      </section>

      {/* Features Section - Minimalist grid */}
      <section className="relative py-32 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group space-y-4 p-8 border border-gray-800 rounded-lg hover:border-gray-600 hover:bg-gray-900/30 transition-all duration-300">
              <Brain className="w-12 h-12 text-gray-400 opacity-80 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-xl font-light text-gray-200">Symbolic Intelligence</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Claude 3.5 Sonnet extracts symbols, archetypes, and transformation patterns
              </p>
            </div>

            <div className="group space-y-4 p-8 border border-gray-800 rounded-lg hover:border-gray-600 hover:bg-gray-900/30 transition-all duration-300">
              <Heart className="w-12 h-12 text-gray-400 opacity-80 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-xl font-light text-gray-200">Voice Journaling</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Real-time voice-to-text with elemental presence and semantic memory
              </p>
            </div>

            <div className="group space-y-4 p-8 border border-gray-800 rounded-lg hover:border-gray-600 hover:bg-gray-900/30 transition-all duration-300">
              <Shield className="w-12 h-12 text-gray-400 opacity-80 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-xl font-light text-gray-200">Data Sovereignty</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Export to Obsidian, PDF, or replay—your consciousness data belongs to you
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="relative py-8 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <p className="text-xs text-gray-600">
            © 2025 Sacred Mirror
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}