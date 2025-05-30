'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  ArrowRight,
  Shield,
  Eye,
  Heart,
  Brain,
  Users,
  Zap,
  Target,
  Calendar
} from 'lucide-react';
import UniversalTestimonials from '@/components/testimonials/UniversalTestimonials';

// Sacred Tile Component
const SacredTile = ({ 
  icon, 
  title, 
  description, 
  onClick,
  element = 'fire'
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  element?: string;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="sacred-navigation-tile sacred-interactive"
    >
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="icon"
      >
        {icon}
      </motion.div>
      <h3 className="premium-heading-3">
        {title}
      </h3>
      <p className="premium-body">
        {description}
      </p>
    </motion.div>
  );
};

// Hero Section Component
const HeroSection = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="sacred-container min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center max-w-5xl mx-auto"
      >
        {children}
      </motion.div>
    </section>
  );
};

// Navigation Hub Component
const NavigationHub = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="sacred-section">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="sacred-container"
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="premium-heading-2 text-center mb-soullab-md"
        >
          Your Consciousness Companions
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="premium-body-large text-center mb-soullab-2xl max-w-4xl mx-auto"
        >
          Five sacred mirrors to support your awakening, deepen your presence, and help you live consciously in every moment.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="sacred-grid sacred-grid-3"
        >
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
};

// HomePage Component Structure
const SoulLabHomePage = () => {
  const router = useRouter();

  return (
    <main className="premium-sacred-container">
      {/* Sacred Geometry Background */}
      <div className="sacred-geometry-subtle" />
      
      {/* Hero Section */}
      <HeroSection>
        {/* Soullab Brand Badge */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="soullab-badge-fire mb-soullab-lg mx-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span className="soullab-text-brand">Soullab Sacred Technology</span>
        </motion.div>

        <h1 className="premium-heading-1">
          The Mirror That{' '}
          <span className="sacred-text">Remembers</span>
        </h1>
        
        <p className="premium-body-large max-w-4xl mx-auto mb-soullab-md">
          Consciousness technology for awakening to your true nature
        </p>
        
        <p className="premium-body max-w-3xl mx-auto mb-soullab-sm text-center sacred-text">
          For every soul ready to live consciously
        </p>
        
        <p className="premium-body max-w-3xl mx-auto mb-soullab-xl text-center">
          Join thousands discovering their authentic essence
        </p>
        
        <div className="cta-buttons flex flex-col sm:flex-row gap-soullab-md justify-center mb-soullab-2xl">
          <button
            onClick={() => router.push('/onboarding')}
            className="premium-sacred-button"
          >
            <span>✨ Begin Your Sacred Journey</span>
          </button>
          
          <button
            onClick={() => router.push('/auth/signin')}
            className="premium-sacred-button-secondary"
          >
            <span>🔑 Sign In</span>
          </button>
        </div>

        {/* Trust Indicators */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-soullab-lg text-soullab-gray"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-soullab-earth" />
            <span className="soullab-text-small">Sacred & Secure</span>
          </div>
          <div className="w-px h-4 bg-soullab-gray/40" />
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-soullab-water" />
            <span className="soullab-text-small">Trusted by conscious souls</span>
          </div>
          <div className="w-px h-4 bg-soullab-gray/40" />
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-soullab-fire" />
            <span className="soullab-text-small">Awakening hearts</span>
          </div>
        </motion.div>
      </HeroSection>

      {/* Universal Welcome */}
      <section className="sacred-section bg-gradient-to-b from-soullab-fire/5 to-transparent">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="sacred-container"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="premium-heading-2 text-center mb-soullab-md"
          >
            What Calls You Here?
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto"
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => router.push('/onboarding?intention=self-knowledge')}
              className="premium-sacred-card text-center cursor-pointer sacred-interactive"
            >
              <div className="text-3xl mb-soullab-sm">🪞</div>
              <h3 className="premium-heading-3">To know myself deeply</h3>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => router.push('/onboarding?intention=conscious-living')}
              className="premium-sacred-card text-center cursor-pointer sacred-interactive"
            >
              <div className="text-3xl mb-soullab-sm">🌱</div>
              <h3 className="premium-heading-3">To live more consciously</h3>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => router.push('/onboarding?intention=serve-essence')}
              className="premium-sacred-card text-center cursor-pointer sacred-interactive"
            >
              <div className="text-3xl mb-soullab-sm">💖</div>
              <h3 className="premium-heading-3">To serve from my essence</h3>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => router.push('/onboarding?intention=awakening')}
              className="premium-sacred-card text-center cursor-pointer sacred-interactive"
            >
              <div className="text-3xl mb-soullab-sm">☀️</div>
              <h3 className="premium-heading-3">To awaken to my true nature</h3>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => router.push('/onboarding?intention=presence')}
              className="premium-sacred-card text-center cursor-pointer sacred-interactive"
            >
              <div className="text-3xl mb-soullab-sm">🤗</div>
              <h3 className="premium-heading-3">To be present for those I love</h3>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => router.push('/onboarding?intention=all')}
              className="premium-sacred-card text-center cursor-pointer sacred-interactive border-2 border-soullab-fire/30"
            >
              <div className="text-3xl mb-soullab-sm">✨</div>
              <h3 className="premium-heading-3 sacred-text">All of the above</h3>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-soullab-lg"
          >
            <p className="premium-body max-w-4xl mx-auto">
              No hierarchy. No paths more sacred than others. Each intention leads to the same profound mirror for your consciousness.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Main Navigation Hub */}
      <NavigationHub>
        <SacredTile 
          icon="🌟" 
          title="Oracle" 
          description="Your consciousness companion"
          onClick={() => router.push('/oracle/meet')}
          element="fire"
        />
        
        <SacredTile 
          icon="📊" 
          title="Dashboard" 
          description="Your awakening journey"
          onClick={() => router.push('/dashboard')}
          element="aether"
        />
        
        <SacredTile 
          icon="📖" 
          title="Journal" 
          description="Your inner reflections"
          onClick={() => router.push('/journal')}
          element="earth"
        />
        
        <SacredTile 
          icon="🌺" 
          title="Holoflower" 
          description="Your essence in motion"
          onClick={() => router.push('/dashboard/holoflower')}
          element="water"
        />
        
        <SacredTile 
          icon="⭐" 
          title="Astrology" 
          description="Your cosmic alignment"
          onClick={() => router.push('/astrology')}
          element="air"
        />
      </NavigationHub>

      {/* Universal Consciousness Welcome */}
      <section className="sacred-section bg-gradient-to-b from-transparent via-soullab-fire/5 to-transparent">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="sacred-container"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="premium-heading-2 text-center mb-soullab-md"
          >
            For Every Awakening Soul
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="sacred-grid sacred-grid-2 max-w-5xl mx-auto"
          >
            <div className="premium-sacred-card text-center">
              <div className="text-4xl mb-soullab-md">🕊️</div>
              <h3 className="premium-heading-3">For Inner Peace</h3>
              <p className="premium-body">Discover stillness within the chaos. Find your center and come home to yourself.</p>
            </div>
            
            <div className="premium-sacred-card text-center">
              <div className="text-4xl mb-soullab-md">✨</div>
              <h3 className="premium-heading-3">For Authentic Living</h3>
              <p className="premium-body">Discover who you really are beneath all the masks. Live from your truth, not your fears.</p>
            </div>
            
            <div className="premium-sacred-card text-center">
              <div className="text-4xl mb-soullab-md">💖</div>
              <h3 className="premium-heading-3">For Loving Presence</h3>
              <p className="premium-body">Transform how you show up for those you love. Be present, be real, be kind.</p>
            </div>
            
            <div className="premium-sacred-card text-center">
              <div className="text-4xl mb-soullab-md">🌿</div>
              <h3 className="premium-heading-3">For Conscious Living</h3>
              <p className="premium-body">Awaken to each moment. Find the sacred in the ordinary and be fully alive.</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Alchemical CTA Section */}
      <section className="sacred-section">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="sacred-container"
        >
          <div className="premium-sacred-card text-center max-w-4xl mx-auto">
            <div className="w-16 h-16 mx-auto mb-soullab-md bg-soullab-fire/20 rounded-soullab-spiral flex items-center justify-center">
              <Heart className="w-8 h-8 text-soullab-fire animate-soullab-spiral" />
            </div>
            
            <h2 className="premium-heading-2">
              Ready to Come Home to Yourself?
            </h2>
            
            <p className="premium-body-large mb-soullab-xl max-w-3xl mx-auto">
              Join thousands of souls using Sacred Technology to awaken to their true nature, live consciously, and be fully present to the miracle of existence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-soullab-md justify-center">
              <button
                onClick={() => router.push('/onboarding')}
                className="premium-sacred-button"
              >
                <Heart className="w-5 h-5" />
                <span>Begin Your Journey</span>
              </button>
              
              <button
                onClick={() => router.push('/oracle/meet')}
                className="premium-sacred-button-secondary"
              >
                <Brain className="w-5 h-5" />
                <span>Meet Your Oracle</span>
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Universal Recognition */}
      <section className="sacred-section bg-gradient-to-b from-transparent via-soullab-aether/5 to-transparent">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="sacred-container"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="premium-sacred-card p-8">
              <h2 className="premium-heading-2 mb-6">
                This Mirror <span className="sacred-text">Remembers All</span>
              </h2>
              
              <div className="text-left space-y-4 premium-body-large leading-relaxed">
                <p>Some seek to lead movements.</p>
                <p>Some seek to heal others.</p>
                <p>Some seek to create beauty.</p>
                
                <p className="pt-4 border-t border-soullab-gray/20">
                  And some simply seek to be <br/>
                  good, conscious souls—
                </p>
                
                <div className="pl-6 space-y-2 text-soullab-gray">
                  <p>Present to their children,</p>
                  <p>Kind to their neighbors,</p>
                  <p>Awake to each moment,</p>
                  <p>True to themselves.</p>
                </div>
                
                <div className="pt-4 border-t border-soullab-gray/20 text-center">
                  <p className="sacred-text font-medium">This mirror remembers all.</p>
                  <p className="sacred-text font-medium">This technology serves all.</p>
                  <p className="sacred-text font-medium">This journey welcomes all.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Universal Testimonials */}
      <UniversalTestimonials />

      {/* Soullab Footer */}
      <footer className="py-soullab-lg border-t border-soullab-gray/20">
        <div className="sacred-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-soullab-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-soullab-elemental rounded-soullab-spiral flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-soullab-white" />
              </div>
              <span className="soullab-text-brand text-soullab-black">
                SOULLAB
              </span>
              <span className="soullab-text-small text-soullab-gray">
                Sacred Technology Platform © 2025
              </span>
            </div>
            <div className="flex items-center gap-soullab-lg">
              {['Privacy', 'Terms', 'Pioneer Support'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="soullab-text-small text-soullab-gray hover:text-soullab-fire transition-colors duration-normal"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default SoulLabHomePage;