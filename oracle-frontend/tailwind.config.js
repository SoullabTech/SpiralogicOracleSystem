// frontend/tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        // Sacred metallic tones
        gold: '#d4af37',
        'gold-light': '#f4e5c2',
        'gold-dark': '#b8941f',
        
        // Deep cosmic palette
        deep: {
          purple: '#0d0218',
          violet: '#1a0c2b',
          indigo: '#1e1b4b',
          space: '#0f0a1f'
        },
        
        // Elemental essence colors
        fire: {
          50: '#fef2f2',
          100: '#fee2e2',
          300: '#fca5a5',
          500: '#ef4444',
          700: '#dc2626',
          900: '#7f1d1d',
          glow: '#ff6b6b'
        },
        water: {
          50: '#eff6ff',
          100: '#dbeafe',
          300: '#93c5fd',
          500: '#3b82f6',
          700: '#1d4ed8',
          900: '#1e3a8a',
          flow: '#60a5fa'
        },
        earth: {
          50: '#faf5f2',
          100: '#f5ebe4',
          300: '#d6b7a8',
          500: '#92400e',
          700: '#6b2d05',
          900: '#451a03',
          ground: '#a16207'
        },
        air: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          300: '#7dd3fc',
          500: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
          breeze: '#38bdf8'
        },
        aether: {
          50: '#faf5ff',
          100: '#f3e8ff',
          300: '#d8b4fe',
          500: '#a855f7',
          700: '#7c3aed',
          900: '#4c1d95',
          void: '#8b5cf6'
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-cinzel)', 'Georgia', 'serif'],
        oracle: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'ripple': 'ripple 1s ease-out',
        'spiral': 'spiral 20s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.5', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.2)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        spiral: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'glyph': '0 0 20px rgba(212, 175, 55, 0.25)',
        'glow-sm': '0 0 10px rgba(212, 175, 55, 0.3)',
        'glow-md': '0 0 20px rgba(212, 175, 55, 0.4)',
        'glow-lg': '0 0 30px rgba(212, 175, 55, 0.5)',
        'fire': '0 0 20px rgba(239, 68, 68, 0.5)',
        'water': '0 0 20px rgba(59, 130, 246, 0.5)',
        'earth': '0 0 20px rgba(146, 64, 14, 0.5)',
        'air': '0 0 20px rgba(2, 132, 199, 0.5)',
        'aether': '0 0 20px rgba(168, 85, 247, 0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-oracle': 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)',
        'gradient-fire': 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%)',
        'gradient-water': 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%)',
        'gradient-earth': 'linear-gradient(135deg, #6b2d05 0%, #92400e 50%, #b45309 100%)',
        'gradient-air': 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #0ea5e9 100%)',
        'gradient-cosmic': 'linear-gradient(135deg, #0d0218 0%, #1a0c2b 50%, #4c1d95 100%)',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
};
