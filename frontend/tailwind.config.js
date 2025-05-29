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
        // Soullab Brand Identity - Professional Sacred Technology
        'soullab-fire': 'rgb(var(--soullab-fire) / <alpha-value>)',
        'soullab-air': 'rgb(var(--soullab-air) / <alpha-value>)',
        'soullab-earth': 'rgb(var(--soullab-earth) / <alpha-value>)',
        'soullab-water': 'rgb(var(--soullab-water) / <alpha-value>)',
        'soullab-black': 'rgb(var(--soullab-black) / <alpha-value>)',
        'soullab-gray': 'rgb(var(--soullab-gray) / <alpha-value>)',
        'soullab-earth-brown': 'rgb(var(--soullab-earth-brown) / <alpha-value>)',
        'soullab-white': 'rgb(var(--soullab-white) / <alpha-value>)',
        
        // Enhanced Sacred Technology Palette
        'soullab-fire-light': 'rgb(var(--soullab-fire-light) / <alpha-value>)',
        'soullab-air-light': 'rgb(var(--soullab-air-light) / <alpha-value>)',
        'soullab-earth-light': 'rgb(var(--soullab-earth-light) / <alpha-value>)',
        'soullab-water-light': 'rgb(var(--soullab-water-light) / <alpha-value>)',
      },
      spacing: {
        // Sacred Spacing System (Golden Ratio φ = 1.618)
        'soullab-xs': 'var(--space-xs)',    // 0.618rem
        'soullab-sm': 'var(--space-sm)',    // 1rem
        'soullab-md': 'var(--space-md)',    // 1.618rem
        'soullab-lg': 'var(--space-lg)',    // 2.618rem
        'soullab-xl': 'var(--space-xl)',    // 4.236rem
        'soullab-2xl': 'var(--space-2xl)',  // 6.854rem
        'soullab-3xl': 'var(--space-3xl)',  // 11.09rem
      },
      borderRadius: {
        // Sacred Border Radius System (Spiral-inspired)
        'soullab-sm': 'var(--radius-sm)',
        'soullab-md': 'var(--radius-md)',
        'soullab-lg': 'var(--radius-lg)',
        'soullab-spiral': 'var(--radius-spiral)',
        'soullab-xl': 'var(--radius-xl)',
        'soullab-full': 'var(--radius-full)',
      },
      boxShadow: {
        // Sacred Shadow System
        'soullab-subtle': 'var(--shadow-subtle)',
        'soullab-glow': 'var(--shadow-glow)',
        'soullab-deep': 'var(--shadow-deep)',
        'soullab-fire': 'var(--shadow-fire)',
        'soullab-water': 'var(--shadow-water)',
        'soullab-float': 'var(--shadow-float)',
      },
      animation: {
        // Sacred Animations
        'soullab-emergence': 'emergence var(--duration-ceremonial) var(--ease-sacred-out)',
        'soullab-float': 'float 6s var(--ease-organic) infinite',
        'soullab-spiral': 'spiral 20s linear infinite',
        'rotate-slow': 'rotate-slow 120s linear infinite',
        'spin': 'spin var(--duration-slower) linear infinite',
        'pulse': 'pulse var(--duration-slower) var(--ease-sacred) infinite',
      },
      keyframes: {
        emergence: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.9) translateY(20px)',
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
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.05)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
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
        // Soullab Sacred Gradients
        'soullab-elemental': 'conic-gradient(from 0deg, rgb(var(--soullab-fire)), rgb(var(--soullab-air)), rgb(var(--soullab-earth)), rgb(var(--soullab-water)), rgb(var(--soullab-fire)))',
        'soullab-fire-gradient': 'linear-gradient(135deg, rgb(var(--soullab-fire)) 0%, rgb(var(--soullab-fire-light)) 100%)',
        'soullab-water-gradient': 'linear-gradient(135deg, rgb(var(--soullab-water)) 0%, rgb(var(--soullab-water-light)) 100%)',
        'soullab-earth-gradient': 'linear-gradient(135deg, rgb(var(--soullab-earth)) 0%, rgb(var(--soullab-earth-light)) 100%)',
        'soullab-air-gradient': 'linear-gradient(135deg, rgb(var(--soullab-air)) 0%, rgb(var(--soullab-air-light)) 100%)',
      },
      fontFamily: {
        // Soullab Typography Stack
        'soullab': ['Blair ITC', 'Lato', 'sans-serif'],
        'lato': ['Lato', 'sans-serif'],
        'sans': ['Lato', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        // Sacred Typography Scale (Golden Ratio)
        'soullab-xs': ['var(--space-xs)', { lineHeight: 'var(--space-sm)' }],
        'soullab-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'soullab-base': ['var(--space-sm)', { lineHeight: 'var(--space-md)' }],
        'soullab-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'soullab-xl': ['var(--space-md)', { lineHeight: '2.25rem' }],
        'soullab-2xl': ['var(--space-lg)', { lineHeight: '3rem' }],
        'soullab-3xl': ['var(--space-xl)', { lineHeight: '4.5rem' }],
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