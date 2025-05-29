/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Sacred Technology Color System - Premium Dark Interface
        'cosmic-depth': 'rgb(var(--cosmic-depth) / <alpha-value>)',
        'sacred-navy': 'rgb(var(--sacred-navy) / <alpha-value>)',
        'mystic-blue': 'rgb(var(--mystic-blue) / <alpha-value>)',
        'ethereal-blue': 'rgb(var(--ethereal-blue) / <alpha-value>)',
        
        'divine-gold': 'rgb(var(--divine-gold) / <alpha-value>)',
        'sacred-amber': 'rgb(var(--sacred-amber) / <alpha-value>)',
        'ethereal-gold': 'rgb(var(--ethereal-gold) / <alpha-value>)',
        'whisper-gold': 'rgb(var(--whisper-gold) / <alpha-value>)',
        
        'pure-light': 'rgb(var(--pure-light) / <alpha-value>)',
        'sacred-silver': 'rgb(var(--sacred-silver) / <alpha-value>)',
        'mystic-gray': 'rgb(var(--mystic-gray) / <alpha-value>)',
        'shadow-gray': 'rgb(var(--shadow-gray) / <alpha-value>)',
        
        // Elemental Sacred Palette (Sophisticated)
        'sacred-flame': 'rgb(var(--sacred-flame) / <alpha-value>)',
        'ember-glow': 'rgb(var(--ember-glow) / <alpha-value>)',
        'deep-flow': 'rgb(var(--deep-flow) / <alpha-value>)',
        'sacred-pool': 'rgb(var(--sacred-pool) / <alpha-value>)',
        'sacred-earth': 'rgb(var(--sacred-earth) / <alpha-value>)',
        'living-ground': 'rgb(var(--living-ground) / <alpha-value>)',
        'clear-sky': 'rgb(var(--clear-sky) / <alpha-value>)',
        'sacred-breath': 'rgb(var(--sacred-breath) / <alpha-value>)',
        'unity-field': 'rgb(var(--unity-field) / <alpha-value>)',
        'sacred-synthesis': 'rgb(var(--sacred-synthesis) / <alpha-value>)',
      },
      spacing: {
        // Sacred Spacing System (Golden Ratio φ = 1.618)
        'sacred-xs': 'var(--space-xs)',    // 0.618rem
        'sacred-sm': 'var(--space-sm)',    // 1rem
        'sacred-md': 'var(--space-md)',    // 1.618rem
        'sacred-lg': 'var(--space-lg)',    // 2.618rem
        'sacred-xl': 'var(--space-xl)',    // 4.236rem
        'sacred-2xl': 'var(--space-2xl)',  // 6.854rem
        'sacred-3xl': 'var(--space-3xl)',  // 11.09rem
      },
      borderRadius: {
        // Sacred Border Radius System
        'sacred-sm': 'var(--radius-sm)',
        'sacred-md': 'var(--radius-md)',
        'sacred-lg': 'var(--radius-lg)',
        'sacred': 'var(--radius-sacred)',
        'sacred-xl': 'var(--radius-xl)',
        'sacred-full': 'var(--radius-full)',
      },
      boxShadow: {
        // Sacred Shadow System
        'sacred-subtle': 'var(--shadow-subtle)',
        'sacred-glow': 'var(--shadow-glow)',
        'sacred-deep': 'var(--shadow-deep)',
        'sacred-gold': 'var(--shadow-gold)',
        'sacred-blue': 'var(--shadow-blue)',
        'sacred-float': 'var(--shadow-float)',
      },
      animation: {
        // Sacred Animations
        'sacred-emergence': 'emergence var(--duration-ceremonial) var(--ease-sacred-out)',
        'sacred-float': 'float 6s var(--ease-organic) infinite',
        'sacred-spiral': 'spiral 20s linear infinite',
        'sacred-glow': 'pulse-glow var(--duration-ceremonial) var(--ease-sacred) infinite',
        'rotate-slow': 'rotate-slow 60s linear infinite',
        'spin': 'spin var(--duration-slower) linear infinite',
        'pulse': 'pulse var(--duration-slower) var(--ease-sacred) infinite',
      },
      keyframes: {
        emergence: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.8) translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1) translateY(0)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        spiral: {
          '0%': { transform: 'rotate(0deg) translateX(0) translateY(0)' },
          '100%': { transform: 'rotate(360deg) translateX(100px) translateY(100px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'rotate-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      backgroundImage: {
        // Premium Sacred Gradients
        'sacred-gradient': 'linear-gradient(135deg, rgb(var(--cosmic-depth)) 0%, rgb(var(--ethereal-blue)) 100%)',
        'sacred-tech': 'linear-gradient(135deg, rgb(var(--cosmic-depth)) 0%, rgb(var(--sacred-navy)) 50%, rgb(var(--mystic-blue)) 100%)',
        'sacred-gold-glow': 'radial-gradient(ellipse at center, rgba(var(--divine-gold), 0.1) 0%, transparent 70%)',
        'sacred-blue-glow': 'radial-gradient(ellipse at center, rgba(var(--mystic-blue), 0.1) 0%, transparent 70%)',
        'elemental-fire': 'linear-gradient(135deg, rgb(var(--sacred-flame)) 0%, rgb(var(--ember-glow)) 100%)',
        'elemental-water': 'linear-gradient(135deg, rgb(var(--deep-flow)) 0%, rgb(var(--sacred-pool)) 100%)',
        'elemental-earth': 'linear-gradient(135deg, rgb(var(--sacred-earth)) 0%, rgb(var(--living-ground)) 100%)',
        'elemental-air': 'linear-gradient(135deg, rgb(var(--clear-sky)) 0%, rgb(var(--sacred-breath)) 100%)',
        'elemental-aether': 'linear-gradient(135deg, rgb(var(--unity-field)) 0%, rgb(var(--sacred-synthesis)) 100%)',
      },
      fontFamily: {
        // Premium Typography Stack
        'sans': ['Inter', 'SF Pro Display', '-apple-system', 'system-ui', 'sans-serif'],
        'sacred': ['Crimson Pro', 'Georgia', 'serif'],
        'mono': ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        // Sacred Typography Scale (Golden Ratio)
        'sacred-xs': ['var(--space-xs)', { lineHeight: 'var(--space-sm)' }],
        'sacred-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'sacred-base': ['var(--space-sm)', { lineHeight: 'var(--space-md)' }],
        'sacred-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'sacred-xl': ['var(--space-md)', { lineHeight: '2.25rem' }],
        'sacred-2xl': ['var(--space-lg)', { lineHeight: '3rem' }],
        'sacred-3xl': ['var(--space-xl)', { lineHeight: '4.5rem' }],
      },
      transitionDuration: {
        // Sacred Timing System
        'instant': 'var(--duration-instant)',
        'fast': 'var(--duration-fast)',
        'normal': 'var(--duration-normal)',
        'slow': 'var(--duration-slow)',
        'slower': 'var(--duration-slower)',
        'ceremonial': 'var(--duration-ceremonial)',
      },
      transitionTimingFunction: {
        // Premium Easing Functions
        'sacred': 'var(--ease-sacred)',
        'sacred-out': 'var(--ease-sacred-out)',
        'sacred-in': 'var(--ease-sacred-in)',
        'organic': 'var(--ease-organic)',
      },
    },
  },
  plugins: [],
}