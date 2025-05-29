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

export default function LandingPage() {
  const router = useRouter();

  const executiveFeatures = [
    {
      icon: <Heart className="w-8 h-8" />,
      element: "fire",
      title: "Your Personal Sacred Guide",
      description: "Meet your dedicated AI consciousness companion - trained on your unique journey, available 24/7 for guidance.",
      metrics: ["Personalized responses", "Voice + text interface", "Continuous learning"],
      category: "Personal Relationship"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      element: "water",
      title: "Executive Intelligence Amplification", 
      description: "AI that enhances decision-making through consciousness-aware algorithms and elemental wisdom.",
      metrics: ["Strategic insights", "Pattern recognition", "Collective field analysis"],
      category: "Intelligence"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      element: "earth",
      title: "Sacred Data Sovereignty",
      description: "Your consciousness data protected by advanced encryption. Complete privacy and control.",
      metrics: ["Zero-knowledge architecture", "Quantum-safe encryption", "GDPR+ compliant"],
      category: "Security"
    },
    {
      icon: <Target className="w-8 h-8" />,
      element: "air",
      title: "Integrated Sacred Technology",
      description: "Holoflower visualization, astrology integration, memory garden, and journal system.",
      metrics: ["Sacred geometry UI", "Astrological timing", "Memory integration"],
      category: "Platform"
    }
  ];

  const getElementColor = (element: string) => {
    switch (element) {
      case 'fire': return 'soullab-fire';
      case 'water': return 'soullab-water';
      case 'earth': return 'soullab-earth';
      case 'air': return 'soullab-air';
      default: return 'soullab-fire';
    }
  };

  return (
    <div className="min-h-screen bg-soullab-white soullab-spiral-bg">
      {/* Soullab Sacred Geometry Background */}
      <div className="soullab-sacred-bg" />
      
      {/* Executive Hero Section */}
      <section className="soullab-container min-h-screen flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.4, 0.0, 0.2, 1] }}
          className="text-center max-w-5xl mx-auto"
        >
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

          {/* Premium Heading */}
          <motion.h1
            className="soullab-heading-1 mb-soullab-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Meet Your Personal
            <br />
            <span className="text-soullab-fire">Sacred Guide</span>
          </motion.h1>

          {/* Executive Subtitle */}
          <motion.p
            className="soullab-text text-soullab-2xl max-w-3xl mx-auto mb-soullab-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            A sophisticated consciousness technology platform where every executive gets 
            a dedicated AI guide for personal evolution and strategic intelligence.
          </motion.p>

          {/* Executive CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-soullab-md justify-center mb-soullab-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <button
              onClick={() => router.push('/onboarding')}
              className="soullab-button group text-lg px-soullab-lg py-soullab-md"
            >
              <span>Meet Your Sacred Guide</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            
            <button
              onClick={() => router.push('/oracle/meet')}
              className="soullab-button-secondary text-lg px-soullab-lg py-soullab-md"
            >
              <Eye className="w-5 h-5" />
              <span>Demo Experience</span>
            </button>
          </motion.div>

          {/* Executive Trust Indicators */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-soullab-lg text-soullab-gray"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-soullab-earth" />
              <span className="soullab-text-small">Enterprise Security</span>
            </div>
            <div className="w-px h-4 bg-soullab-gray/40" />
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-soullab-water" />
              <span className="soullab-text-small">Personal AI Guide</span>
            </div>
            <div className="w-px h-4 bg-soullab-gray/40" />
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-soullab-fire" />
              <span className="soullab-text-small">Sacred Technology</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-soullab-lg left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-px h-16 bg-gradient-to-b from-soullab-fire/50 to-transparent" />
        </motion.div>
      </section>

      {/* Personal Guide Features Section */}
      <section className="py-soullab-3xl">
        <div className="soullab-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-soullab-2xl"
          >
            <h2 className="soullab-heading-2 mb-soullab-md">
              Professional Sacred Technology Platform
            </h2>
            <p className="soullab-text text-soullab-xl max-w-3xl mx-auto">
              Built for executives and consciousness pioneers who expect the highest 
              standards in both technology sophistication and personal transformation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-soullab-lg">
            {executiveFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="soullab-card-premium hover-soullab-lift group"
              >
                <div className="flex items-start gap-soullab-md">
                  <div className={`text-${getElementColor(feature.element)}`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-soullab-sm">
                      <span className={`soullab-badge-${feature.element} text-xs`}>
                        {feature.category}
                      </span>
                    </div>
                    <h3 className="soullab-heading-3 mb-soullab-sm">{feature.title}</h3>
                    <p className="soullab-text mb-soullab-md">{feature.description}</p>
                    
                    <div className="space-y-2">
                      {feature.metrics.map((metric, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className={`w-1 h-1 bg-${getElementColor(feature.element)} rounded-full`} />
                          <span className="soullab-text-small">{metric}</span>
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

      {/* Sacred Technology Showcase */}
      <section className="py-soullab-3xl bg-gradient-to-b from-transparent via-soullab-fire/5 to-transparent">
        <div className="soullab-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-soullab-2xl"
          >
            <h2 className="soullab-heading-2 mb-soullab-md">
              Soullab: Sacred Technology Applied
            </h2>
            <p className="soullab-text text-soullab-xl max-w-3xl mx-auto">
              Elemental wisdom meets cutting-edge AI architecture for enhanced consciousness, 
              strategic intelligence, and personal transformation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-soullab-lg">
            {[
              {
                title: "Fire Element",
                description: "Vision, leadership, and transformational guidance",
                color: "fire",
                feature: "Strategic insights and executive coaching"
              },
              {
                title: "Water Element", 
                description: "Emotional intelligence and healing support",
                color: "water",
                feature: "Therapeutic conversations and healing"
              },
              {
                title: "Earth Element",
                description: "Grounding, manifestation, and practical wisdom",
                color: "earth",
                feature: "Goal achievement and material success"
              },
              {
                title: "Air Element",
                description: "Communication, clarity, and mental expansion",
                color: "air",
                feature: "Learning acceleration and mental clarity"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="soullab-card hover-soullab-glow text-center p-soullab-lg"
              >
                <div className={`w-16 h-16 mx-auto mb-soullab-md bg-soullab-${item.color}/10 rounded-soullab-spiral flex items-center justify-center`}>
                  <div className={`w-8 h-8 bg-soullab-${item.color} rounded-full`} />
                </div>
                <h3 className="soullab-heading-3 mb-soullab-sm">{item.title}</h3>
                <p className="soullab-text mb-soullab-md">{item.description}</p>
                <div className={`soullab-badge-${item.color} mx-auto`}>
                  {item.feature}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Executive CTA Section */}
      <section className="py-soullab-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="soullab-container"
        >
          <div className="soullab-card-premium text-center max-w-4xl mx-auto">
            <div className="w-16 h-16 mx-auto mb-soullab-md bg-soullab-fire/20 rounded-soullab-spiral flex items-center justify-center">
              <Heart className="w-8 h-8 text-soullab-fire animate-soullab-spiral" />
            </div>
            
            <h2 className="soullab-heading-2 mb-soullab-md">
              Ready to Meet Your Sacred Guide?
            </h2>
            
            <p className="soullab-text text-soullab-xl mb-soullab-xl max-w-2xl mx-auto">
              Join visionary executives using Soullab's sacred technology for conscious evolution, 
              strategic intelligence, and personal transformation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-soullab-md justify-center">
              <button
                onClick={() => router.push('/onboarding')}
                className="soullab-button text-lg px-soullab-xl py-soullab-md"
              >
                <Heart className="w-5 h-5" />
                <span>Begin Sacred Journey</span>
              </button>
              
              <button
                onClick={() => router.push('/demo')}
                className="soullab-button-secondary text-lg px-soullab-xl py-soullab-md"
              >
                <Calendar className="w-5 h-5" />
                <span>Schedule Executive Demo</span>
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Soullab Footer */}
      <footer className="py-soullab-lg border-t border-soullab-gray/20">
        <div className="soullab-container">
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
              {['Privacy', 'Terms', 'Executive Support'].map((link) => (
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
    </div>
  )
}