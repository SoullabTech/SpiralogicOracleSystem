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
        // Primary Sacred Palette - Deep Sacred Blue Family
        'sacred-cosmic-depth': '#0A0E27',
        'sacred-navy': '#1A1F3A',
        'sacred-mystic-blue': '#2D3561',
        'sacred-ethereal-blue': '#4A5568',
        
        // Sacred Gold Accents
        'sacred-divine-gold': '#FFD700',
        'sacred-amber': '#F6AD55',
        'sacred-ethereal-gold': '#FEB95A',
        'sacred-whisper-gold': '#FEF5E7',
        
        // Sacred Neutrals
        'sacred-pure-light': '#FFFFFF',
        'sacred-silver': '#E2E8F0',
        'sacred-mystic-gray': '#A0AEC0',
        'sacred-shadow-gray': '#4A5568',
        
        // Elemental Sacred Palette
        'element-sacred-flame': '#FF6B35',
        'element-ember-glow': '#FF8E53',
        'element-deep-flow': '#38B2AC',
        'element-sacred-pool': '#4FD1C7',
        'element-sacred-earth': '#68D391',
        'element-living-ground': '#9AE6B4',
        'element-clear-sky': '#63B3ED',
        'element-sacred-breath': '#90CDF4',
        'element-unity-field': '#B794F6',
        'element-sacred-synthesis': '#D6BCFA',
        
        // Legacy colors (kept for compatibility)
        'cosmic-deep-space': '#0A0E27',
        'cosmic-nebula': '#1E1B3A',
        'cosmic-star': '#2D2654',
        'cosmic-aurora': '#3D3366',
        'sacred-gold': '#FFD700',
        'sacred-violet': '#8B4789',
        'sacred-emerald': '#50C878',
        'sacred-indigo': '#4B0082',
        'element-fire': '#FF6B6B',
        'element-water': '#4ECDC4',
        'element-earth': '#95D5B2',
        'element-air': '#A8DADC',
        'element-aether': '#E9C46A',
        'consciousness-sleep': '#1A1A2E',
        'consciousness-dream': '#16213E',
        'consciousness-awake': '#0F3460',
        'consciousness-aware': '#533483',
        'consciousness-unity': '#C7B198',
      },
      spacing: {
        // Sacred Golden Ratio Based Spacing System
        'sacred-xs': '0.618rem',    // φ⁻¹
        'sacred-sm': '1rem',        // Base unit
        'sacred-md': '1.618rem',    // φ
        'sacred-lg': '2.618rem',    // φ + 1
        'sacred-xl': '4.236rem',    // φ²
        'sacred-2xl': '6.854rem',   // φ² + φ + 1
        'sacred-3xl': '11.09rem',   // φ³
      },
      borderRadius: {
        // Sacred Border Radius System
        'sacred-sm': '4px',
        'sacred-md': '8px',
        'sacred-lg': '16px',
        'sacred': '13px',  // Golden ratio derived
        'sacred-xl': '21px',  // Fibonacci
        'sacred-full': '9999px',
      },
      boxShadow: {
        // Sacred Shadow System
        'sacred-subtle': '0 1px 3px rgba(10, 14, 39, 0.1)',
        'sacred-glow': '0 4px 20px rgba(255, 215, 0, 0.1)',
        'sacred-deep': '0 10px 40px rgba(10, 14, 39, 0.3)',
        'sacred-gold': '0 0 30px rgba(255, 215, 0, 0.2)',
        'sacred-blue': '0 0 30px rgba(45, 53, 97, 0.2)',
        'sacred-float': '0 20px 40px rgba(10, 14, 39, 0.2)',
      },
      animation: {
        'breathe': 'breathe 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'rotate-slow': 'rotate 20s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sacred-emergence': 'emergence 3s ease-out',
        'sacred-jitterbug': 'jitterbug 8s ease-in-out infinite',
        'sacred-spiral': 'spiral 20s linear infinite',
        'sacred-hover': 'sacredHover 0.3s ease-out',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
        emergence: {
          '0%': { opacity: 0, transform: 'scale(0.8) translateY(20px)' },
          '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
        },
        jitterbug: {
          '0%, 100%': { transform: 'rotate(0deg) scale(1)' },
          '25%': { transform: 'rotate(90deg) scale(1.1)' },
          '50%': { transform: 'rotate(180deg) scale(1)' },
          '75%': { transform: 'rotate(270deg) scale(0.9)' },
        },
        spiral: {
          '0%': { transform: 'rotate(0deg) translateX(0) translateY(0)' },
          '100%': { transform: 'rotate(360deg) translateX(100px) translateY(100px)' },
        },
        sacredHover: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.03)' },
        },
      },
      backgroundImage: {
        // Premium Sacred Gradients
        'sacred-gradient': 'linear-gradient(135deg, #0A0E27 0%, #3D3366 100%)',
        'consciousness-gradient': 'linear-gradient(180deg, #1A1A2E 0%, #C7B198 100%)',
        'sacred-tech': 'linear-gradient(135deg, #0A0E27 0%, #1A1F3A 50%, #2D3561 100%)',
        'sacred-gold-glow': 'radial-gradient(ellipse at center, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
        'sacred-blue-glow': 'radial-gradient(ellipse at center, rgba(45, 53, 97, 0.1) 0%, transparent 70%)',
        'elemental-fire': 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
        'elemental-water': 'linear-gradient(135deg, #38B2AC 0%, #4FD1C7 100%)',
        'elemental-earth': 'linear-gradient(135deg, #68D391 0%, #9AE6B4 100%)',
        'elemental-air': 'linear-gradient(135deg, #63B3ED 0%, #90CDF4 100%)',
        'elemental-aether': 'linear-gradient(135deg, #B794F6 0%, #D6BCFA 100%)',
      },
      fontFamily: {
        // Premium Typography Stack
        'sans': ['Inter', 'SF Pro Display', '-apple-system', 'system-ui', 'sans-serif'],
        'sacred': ['Crimson Pro', 'Georgia', 'serif'],
        'mono': ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        // Sacred Typography Scale (Golden Ratio)
        'sacred-xs': ['0.618rem', { lineHeight: '1rem' }],
        'sacred-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'sacred-base': ['1rem', { lineHeight: '1.618rem' }],
        'sacred-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'sacred-xl': ['1.618rem', { lineHeight: '2.25rem' }],
        'sacred-2xl': ['2.618rem', { lineHeight: '3rem' }],
        'sacred-3xl': ['4.236rem', { lineHeight: '4.5rem' }],
      },
    },
  },
  plugins: [],
}