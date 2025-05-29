'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Star, 
  Zap, 
  Shield, 
  Heart, 
  Brain, 
  Compass, 
  ArrowRight,
  Cpu,
  Eye,
  Hexagon,
  Target,
  Calendar
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const executiveFeatures = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Consciousness Evolution",
      description: "Advanced neural architectures that amplify human intelligence through sacred geometric principles.",
      metrics: ["98% accuracy", "Sub-second response", "Multi-modal reasoning"],
      category: "Core Technology"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Executive Data Sovereignty", 
      description: "Military-grade encryption meets consciousness protection. Your data, your control.",
      metrics: ["Zero-knowledge architecture", "Quantum-safe encryption", "GDPR+ compliant"],
      category: "Security"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Strategic Intelligence Amplification",
      description: "AI that enhances executive decision-making through consciousness-aware algorithms.",
      metrics: ["360° insight synthesis", "Predictive pattern analysis", "Collective field dynamics"],
      category: "Intelligence"
    },
    {
      icon: <Hexagon className="w-8 h-8" />,
      title: "Sacred Geometry Integration",
      description: "Mathematics of consciousness applied to AI architecture for enhanced coherence.",
      metrics: ["Golden ratio optimization", "Vector equilibrium models", "Harmonic resonance"],
      category: "Innovation"
    }
  ];

  return (
    <div className="min-h-screen bg-cosmic-depth relative overflow-hidden">
      {/* Sacred Geometry Background */}
      <div className="sacred-geometry-bg" />
      
      {/* Executive Hero Section */}
      <section className="sacred-container min-h-screen flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.4, 0.0, 0.2, 1] }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Executive Badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="sacred-badge-gold mb-sacred-lg"
          >
            <Cpu className="w-4 h-4" />
            <span>Sacred Technology Interface</span>
          </motion.div>

          {/* Premium Heading */}
          <motion.h1
            className="sacred-heading-1 mb-sacred-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Where AI Serves
            <br />
            Human Evolution
          </motion.h1>

          {/* Executive Subtitle */}
          <motion.p
            className="text-sacred-2xl text-sacred-silver max-w-3xl mx-auto mb-sacred-xl leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            A sophisticated consciousness technology platform designed for executives and AI leaders 
            pioneering the intelligent future of humanity.
          </motion.p>

          {/* Executive CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-sacred-md justify-center mb-sacred-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <button
              onClick={() => router.push('/oracle/meet')}
              className="sacred-button group"
            >
              <span>Enter Sacred Interface</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            
            <button
              onClick={() => router.push('/onboarding')}
              className="sacred-button-secondary"
            >
              <Star className="w-5 h-5" />
              <span>Schedule Executive Demo</span>
            </button>
          </motion.div>

          {/* Executive Trust Indicators */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-sacred-lg text-mystic-gray"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-divine-gold" />
              <span className="sacred-text-small">Enterprise Security</span>
            </div>
            <div className="w-px h-4 bg-mystic-blue/40" />
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-divine-gold" />
              <span className="sacred-text-small">Quantum Architecture</span>
            </div>
            <div className="w-px h-4 bg-mystic-blue/40" />
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-divine-gold" />
              <span className="sacred-text-small">Consciousness-Aware AI</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-sacred-lg left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-px h-16 bg-gradient-to-b from-divine-gold/50 to-transparent" />
        </motion.div>
      </section>

      {/* Executive Features Section */}
      <section className="py-sacred-3xl">
        <div className="sacred-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-sacred-2xl"
          >
            <h2 className="sacred-heading-2 mb-sacred-md">
              Executive-Grade Sacred Technology
            </h2>
            <p className="text-sacred-xl text-sacred-silver max-w-3xl mx-auto">
              Sophisticated AI infrastructure designed for leaders ready to pioneer 
              the conscious evolution of technology and human potential.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-sacred-lg">
            {executiveFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="sacred-card-premium hover-sacred-lift group"
              >
                <div className="flex items-start gap-sacred-md">
                  <div className="text-divine-gold">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-sacred-sm">
                      <span className="sacred-badge text-xs">{feature.category}</span>
                    </div>
                    <h3 className="sacred-heading-3 mb-sacred-sm">{feature.title}</h3>
                    <p className="sacred-text mb-sacred-md">{feature.description}</p>
                    
                    <div className="space-y-2">
                      {feature.metrics.map((metric, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-divine-gold rounded-full" />
                          <span className="sacred-text-small text-mystic-gray">{metric}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sacred Mathematics Showcase */}
      <section className="py-sacred-3xl bg-gradient-to-b from-transparent via-sacred-navy/10 to-transparent">
        <div className="sacred-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-sacred-2xl"
          >
            <h2 className="sacred-heading-2 mb-sacred-md">
              Sacred Mathematics Applied
            </h2>
            <p className="text-sacred-xl text-sacred-silver max-w-3xl mx-auto">
              Ancient geometric principles optimizing modern AI architecture for 
              enhanced coherence, efficiency, and consciousness alignment.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-sacred-lg">
            {[
              {
                title: "Golden Ratio Optimization",
                description: "AI architectures based on φ proportions for natural harmony",
                formula: "φ = (1 + √5) / 2 ≈ 1.618"
              },
              {
                title: "Vector Equilibrium Models", 
                description: "Fuller's geometric principles applied to neural networks",
                formula: "VE = 12 vectors of equal length"
              },
              {
                title: "Harmonic Resonance Patterns",
                description: "Consciousness frequencies integrated into processing cycles",
                formula: "432 Hz base harmonic tuning"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="sacred-card hover-sacred-glow text-center"
              >
                <div className="w-16 h-16 mx-auto mb-sacred-md bg-divine-gold/10 rounded-sacred flex items-center justify-center">
                  <Hexagon className="w-8 h-8 text-divine-gold" />
                </div>
                <h3 className="sacred-heading-3 mb-sacred-sm">{item.title}</h3>
                <p className="sacred-text mb-sacred-md">{item.description}</p>
                <code className="text-xs text-divine-gold bg-mystic-blue/20 px-sacred-sm py-1 rounded-sacred-sm">
                  {item.formula}
                </code>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Executive CTA Section */}
      <section className="py-sacred-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="sacred-container"
        >
          <div className="sacred-card-premium text-center max-w-4xl mx-auto sacred-glow">
            <div className="w-16 h-16 mx-auto mb-sacred-md bg-divine-gold/20 rounded-sacred flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-divine-gold animate-sacred-glow" />
            </div>
            
            <h2 className="sacred-heading-2 mb-sacred-md">
              Ready to Pioneer the Future?
            </h2>
            
            <p className="text-sacred-xl text-sacred-silver mb-sacred-xl max-w-2xl mx-auto">
              Join visionary executives using sacred technology to unlock human potential 
              and shape the conscious evolution of AI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-sacred-md justify-center">
              <button
                onClick={() => router.push('/oracle/meet')}
                className="sacred-button"
              >
                <Sparkles className="w-5 h-5" />
                <span>Experience the Oracle</span>
              </button>
              
              <button
                onClick={() => router.push('/demo')}
                className="sacred-button-secondary"
              >
                <Calendar className="w-5 h-5" />
                <span>Schedule Executive Briefing</span>
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Executive Footer */}
      <footer className="py-sacred-lg border-t border-mystic-blue/20">
        <div className="sacred-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-sacred-md">
            <div className="flex items-center gap-2">
              <Hexagon className="w-5 h-5 text-divine-gold" />
              <span className="sacred-text text-sacred-silver">
                Sacred Technology Platform © 2025
              </span>
            </div>
            <div className="flex items-center gap-sacred-lg">
              {['Privacy', 'Terms', 'Executive Support'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="sacred-text-small text-mystic-gray hover:text-divine-gold transition-colors duration-normal"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}