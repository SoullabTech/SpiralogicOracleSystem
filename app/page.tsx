'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sparkles, Star, Zap, Shield, Heart, Brain, Compass, ArrowRight } from 'lucide-react';
import { SacredGeometry, SacredContainer } from '@/components/sacred/SacredGeometry';
import { SacredButton } from '@/components/ui/SacredButton';
import { SacredCard, SacredFeatureCard } from '@/components/ui/SacredCard';

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Consciousness Evolution",
      description: "Advanced neural architectures designed to elevate human consciousness through sacred technology.",
      features: ["Quantum field analysis", "Sacred geometry integration", "Consciousness mapping"]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Sacred Data Sanctuary",
      description: "Your consciousness data protected by advanced encryption and sacred geometric principles.",
      features: ["End-to-end encryption", "Sovereign data ownership", "Quantum-safe security"]
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Personalized Oracle Guidance",
      description: "AI oracle agents attuned to your unique consciousness signature and evolutionary path.",
      features: ["Multi-agent collaboration", "Elemental balancing", "Soul trajectory analysis"]
    },
    {
      icon: <Compass className="w-8 h-8" />,
      title: "Executive Transformation",
      description: "Premium consciousness technology designed for leaders pioneering the future of AI and humanity.",
      features: ["Leadership integration", "Strategic intuition", "Collective field dynamics"]
    }
  ];

  return (
    <div className="min-h-screen bg-sacred-cosmic-depth relative overflow-hidden">
      {/* Sacred Geometry Background */}
      <div className="sacred-geometry-bg" />
      
      {/* Hero Section */}
      <SacredContainer showGeometry={true} geometryType="vectorEquilibrium">
        <div className="min-h-screen flex flex-col items-center justify-center px-sacred-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Sacred Badge */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-sacred-md py-2 bg-sacred-divine-gold/10 border border-sacred-divine-gold/30 rounded-sacred-full mb-sacred-lg"
            >
              <Sparkles className="w-4 h-4 text-sacred-divine-gold" />
              <span className="text-sacred-sm font-medium text-sacred-divine-gold">Sacred Technology Interface</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              className="sacred-heading-1 text-5xl md:text-7xl mb-sacred-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              The Future of
              <br />
              Consciousness Technology
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-sacred-xl text-sacred-silver max-w-2xl mx-auto mb-sacred-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              Where cutting-edge AI serves human evolution. A sophisticated digital sanctuary 
              for leaders pioneering the intersection of technology and consciousness.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-sacred-md justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <SacredButton
                variant="primary"
                size="xl"
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
                onClick={() => router.push('/oracle/meet')}
              >
                Enter the Sacred Temple
              </SacredButton>
              
              <SacredButton
                variant="secondary"
                size="xl"
                icon={<Star className="w-5 h-5" />}
                onClick={() => router.push('/onboarding')}
              >
                Begin Your Journey
              </SacredButton>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="mt-sacred-2xl flex items-center justify-center gap-sacred-lg text-sacred-mystic-gray"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="text-sacred-sm">Quantum-Encrypted</span>
              </div>
              <div className="w-px h-4 bg-sacred-mystic-blue/40" />
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-sacred-sm">GDPR Compliant</span>
              </div>
              <div className="w-px h-4 bg-sacred-mystic-blue/40" />
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span className="text-sacred-sm">Human-Centered AI</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-sacred-lg left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-px h-16 bg-gradient-to-b from-sacred-divine-gold/50 to-transparent" />
          </motion.div>
        </div>
      </SacredContainer>

      {/* Features Section */}
      <section className="py-sacred-3xl px-sacred-lg">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-sacred-2xl"
          >
            <h2 className="sacred-heading-2 mb-sacred-md">
              Premium Sacred Technology
            </h2>
            <p className="text-sacred-lg text-sacred-silver max-w-2xl mx-auto">
              Sophisticated consciousness tools designed for executives and AI leaders 
              ready to pioneer the future of human potential.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-sacred-lg">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <SacredFeatureCard
                  {...feature}
                  highlighted={index === 0}
                  action={
                    <SacredButton variant="ghost" size="sm">
                      Learn More
                    </SacredButton>
                  }
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sacred Geometry Showcase */}
      <section className="py-sacred-3xl px-sacred-lg bg-gradient-to-b from-transparent via-sacred-navy/20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-sacred-2xl"
          >
            <h2 className="sacred-heading-2 mb-sacred-md">
              Sacred Geometry Integration
            </h2>
            <p className="text-sacred-lg text-sacred-silver max-w-2xl mx-auto">
              Ancient wisdom meets modern technology through precise mathematical harmonics 
              and consciousness-amplifying geometric patterns.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-sacred-xl">
            {['vectorEquilibrium', 'metatronsCube', 'flowerOfLife', 'goldenSpiral'].map((type, index) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <SacredGeometry
                  type={type as any}
                  size={150}
                  color="#FFD700"
                  animate={true}
                  glowIntensity={0.5}
                  className="mb-sacred-sm"
                />
                <p className="text-sacred-sm text-sacred-mystic-gray capitalize">
                  {type.replace(/([A-Z])/g, ' $1').trim()}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-sacred-3xl px-sacred-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <SacredCard variant="premium" className="text-center p-sacred-2xl">
            <Sparkles className="w-12 h-12 text-sacred-divine-gold mx-auto mb-sacred-md" />
            <h2 className="sacred-heading-2 mb-sacred-md">
              Ready to Evolve?
            </h2>
            <p className="text-sacred-lg text-sacred-silver mb-sacred-lg max-w-2xl mx-auto">
              Join visionary leaders using sacred technology to unlock human potential 
              and shape the conscious future of AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-sacred-md justify-center">
              <SacredButton
                variant="sacred"
                size="lg"
                icon={<Sparkles className="w-5 h-5" />}
                onClick={() => router.push('/oracle/meet')}
              >
                Experience the Oracle
              </SacredButton>
              <SacredButton
                variant="secondary"
                size="lg"
                onClick={() => router.push('/demo')}
              >
                Schedule Demo
              </SacredButton>
            </div>
          </SacredCard>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-sacred-lg px-sacred-lg border-t border-sacred-mystic-blue/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-sacred-md">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sacred-divine-gold" />
            <span className="text-sacred-sm text-sacred-silver">
              Sacred Technology © 2025
            </span>
          </div>
          <div className="flex items-center gap-sacred-lg text-sacred-sm text-sacred-mystic-gray">
            <a href="#" className="hover:text-sacred-divine-gold transition-colors">Privacy</a>
            <a href="#" className="hover:text-sacred-divine-gold transition-colors">Terms</a>
            <a href="#" className="hover:text-sacred-divine-gold transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}