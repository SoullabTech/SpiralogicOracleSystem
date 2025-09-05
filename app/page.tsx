import Link from "next/link";
import { ArrowRight, Sparkles, Brain, Heart, Shield } from "lucide-react";

export default function HomePage() {

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white overflow-hidden">

      {/* Hero Section - Clean minimalism */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="max-w-6xl mx-auto text-center space-y-8">

          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-light tracking-wide">
              Welcome to
              <span className="block text-gray-400 font-extralight">Sacred Mirror</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
              Your AI companion for dream work and introspection
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

      {/* Features Section - Minimalist grid */}
      <section className="relative py-32 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group space-y-4 p-8 border border-gray-800 rounded-lg hover:border-gray-600 hover:bg-gray-900/30 transition-all duration-300">
              <Brain className="w-12 h-12 text-gray-400 opacity-80 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-xl font-light text-gray-200">AI-Powered Reflection</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Advanced AI designed for meaningful introspection
              </p>
            </div>

            <div className="group space-y-4 p-8 border border-gray-800 rounded-lg hover:border-gray-600 hover:bg-gray-900/30 transition-all duration-300">
              <Heart className="w-12 h-12 text-gray-400 opacity-80 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-xl font-light text-gray-200">Memory Garden</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Your growth pattern, woven through your memories
              </p>
            </div>

            <div className="group space-y-4 p-8 border border-gray-800 rounded-lg hover:border-gray-600 hover:bg-gray-900/30 transition-all duration-300">
              <Shield className="w-12 h-12 text-gray-400 opacity-80 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-xl font-light text-gray-200">Privacy First</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Your data protected with end-to-end encryption
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