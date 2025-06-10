// not-found.tsx - Cosmic 404 page

import Link from 'next/link';
import { Home, Sparkles, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen gradient-oracle-bg flex items-center justify-center p-4">
      <div className="text-center space-y-8 animate-fade-in max-w-2xl">
        {/* Mystical Symbol */}
        <div className="relative w-48 h-48 mx-auto">
          <div className="absolute inset-0 rounded-full bg-gradient-oracle animate-spiral opacity-20" />
          <div className="absolute inset-4 rounded-full bg-gradient-oracle animate-spiral animation-delay-300 opacity-30" />
          <div className="absolute inset-8 rounded-full bg-gradient-oracle animate-spiral animation-delay-600 opacity-40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-8xl font-sacred text-gradient-oracle">404</div>
          </div>
        </div>

        {/* Sacred Message */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-sacred text-gold">
            Path Not Yet Revealed
          </h1>
          <p className="text-xl font-oracle text-gold-light max-w-lg mx-auto">
            This cosmic pathway does not yet exist in your destiny map. 
            The universe is still weaving this thread into the tapestry of possibility.
          </p>
        </div>

        {/* Oracle Quote */}
        <blockquote className="border-l-4 border-gold pl-6 py-2 text-left max-w-md mx-auto">
          <p className="text-gold/80 font-oracle italic">
            "Not all who wander are lost, but this path awaits its creation. 
            Return to familiar ground and let your intuition guide you forward."
          </p>
          <footer className="text-gold/60 text-sm mt-2">
            — The Aether Oracle
          </footer>
        </blockquote>

        {/* Navigation Options */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/">
            <Button className="btn-aether group">
              <Home className="mr-2 h-4 w-4 group-hover:animate-float" />
              Return to Sanctuary
            </Button>
          </Link>
          <Link href="/oracle">
            <Button variant="outline" className="border-gold text-gold hover:bg-gold/10 group">
              <Sparkles className="mr-2 h-4 w-4 group-hover:animate-glow" />
              Consult the Oracle
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="border-gold text-gold hover:bg-gold/10 group">
              <Moon className="mr-2 h-4 w-4 group-hover:animate-float" />
              View Dashboard
            </Button>
          </Link>
        </div>

        {/* Floating Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-2 h-2 bg-fire-500 rounded-full animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute top-40 right-20 w-3 h-3 bg-water-500 rounded-full animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-30 left-1/4 w-2 h-2 bg-earth-500 rounded-full animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 right-1/3 w-4 h-4 bg-air-500 rounded-full animate-float" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-aether-500 rounded-full animate-float" style={{ animationDelay: '4s' }} />
        </div>
      </div>
    </div>
  );
}