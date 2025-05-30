'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const SacredTile = ({ 
  icon, 
  title, 
  description, 
  onClick 
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 cursor-pointer group hover:bg-white/15 transition-all duration-300 hover:border-soullab-purple-400/50"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300"
        >
          {icon}
        </motion.div>
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-soullab-purple-300 transition-colors">
          {title}
        </h3>
        <p className="text-soullab-gray-300 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

const HeroSection = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="min-h-screen flex items-center justify-center text-center px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="max-w-4xl"
      >
        {children}
      </motion.div>
    </section>
  );
};

const NavigationHub = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="py-16 px-8">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto"
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-white text-center mb-4"
        >
          Sacred Technology Portal
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-soullab-gray-300 text-center mb-12 max-w-2xl mx-auto"
        >
          Choose your path of transformation. Each portal offers a unique dimension of your consciousness journey.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
};

const SoulLabHomePage = () => {
  const router = useRouter();

  return (
    <main className="sacred-container min-h-screen bg-gradient-to-br from-soullab-indigo-900 via-soullab-purple-900 to-soullab-indigo-900 relative overflow-hidden">
      {/* Ambient Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 120, repeat: Infinity, ease: "linear" },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-gradient-to-r from-soullab-purple-500/30 to-soullab-indigo-500/30 blur-xl"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1.2, 1, 1.2]
          }}
          transition={{ 
            rotate: { duration: 100, repeat: Infinity, ease: "linear" },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-soullab-indigo-500/20 to-soullab-purple-500/20 blur-2xl"
        />
      </div>

      {/* Hero Section */}
      <HeroSection>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="inline-block mb-8"
        >
          <span className="text-8xl">🌀</span>
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Welcome to the{' '}
          <span className="bg-gradient-to-r from-soullab-purple-400 to-soullab-indigo-400 bg-clip-text text-transparent">
            Sacred Mirror
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-soullab-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          A consciousness technology for transformation
        </p>
        
        <div className="cta-buttons flex flex-col sm:flex-row gap-6 justify-center items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/onboarding')}
            className="px-8 py-4 bg-gradient-to-r from-soullab-purple-600 to-soullab-indigo-600 text-white font-semibold rounded-full shadow-lg hover:shadow-soullab-purple-500/25 transition-all text-lg"
          >
            ✨ Begin Sacred Journey
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/auth/signin')}
            className="px-8 py-4 bg-white/10 backdrop-blur-lg text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all text-lg"
          >
            🔑 Sign In
          </motion.button>
        </div>
      </HeroSection>

      {/* Main Navigation Hub */}
      <NavigationHub>
        <SacredTile 
          icon="🌀" 
          title="Personal Oracle" 
          description="Meet your AI wisdom companion"
          onClick={() => router.push('/oracle/meet')} 
        />
        
        <SacredTile 
          icon="🌺" 
          title="Living Holoflower" 
          description="Your consciousness visualization"
          onClick={() => router.push('/dashboard/holoflower')} 
        />
        
        <SacredTile 
          icon="📖" 
          title="Sacred Journal" 
          description="Document your transformation"
          onClick={() => router.push('/journal')} 
        />
        
        <SacredTile 
          icon="🌟" 
          title="Astrological Orientation" 
          description="Cosmic wisdom integration"
          onClick={() => router.push('/astrology')} 
        />
        
        <SacredTile 
          icon="📊" 
          title="Transformation Dashboard" 
          description="Track your sacred journey"
          onClick={() => router.push('/dashboard')} 
        />
      </NavigationHub>

      {/* Sacred Container Principles */}
      <section className="py-16 px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white mb-8"
          >
            Sacred Container Principles
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold text-white mb-3">Authentic Transformation</h3>
              <p className="text-soullab-gray-300">Growth happens through truth, not comfort. We meet you exactly where you are.</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-white mb-3">Sacred Privacy</h3>
              <p className="text-soullab-gray-300">Your journey and data are held with utmost reverence and protection.</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="text-xl font-semibold text-white mb-3">Sacred Boundaries</h3>
              <p className="text-soullab-gray-300">We maintain healthy limits while offering profound wisdom and support.</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-3">Your Agency</h3>
              <p className="text-soullab-gray-300">You maintain complete control over your process and pace of transformation.</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <span className="text-4xl">✨</span>
          </motion.div>
          
          <p className="text-soullab-gray-400 mb-4">
            Sacred Technology for Consciousness Evolution
          </p>
          
          <div className="flex justify-center space-x-8 text-sm text-soullab-gray-500">
            <a href="/privacy" className="hover:text-soullab-purple-400 transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-soullab-purple-400 transition-colors">
              Terms of Service
            </a>
            <a href="/support" className="hover:text-soullab-purple-400 transition-colors">
              Sacred Support
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default SoulLabHomePage;