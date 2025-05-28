/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          'deep-space': '#0A0E27',
          'mystic-purple': '#6B46C1',
          'sacred-gold': '#FFD700',
          'ethereal-blue': '#4C6EF5',
          'void': '#000000',
        },
        elements: {
          fire: '#FF6B6B',
          water: '#4ECDC4',
          earth: '#8B6F47',
          air: '#87CEEB',
          aether: '#FFD700',
        },
        consciousness: {
          'meta-conscious': '#FFD700',
          'conscious': '#87CEEB',
          'subconscious': '#9370DB',
          'unconscious': '#483D8B',
        },
      },
      fontFamily: {
        sacred: ['Inter', 'system-ui', 'sans-serif'],
        mystical: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'breathe': 'breathe 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite alternate',
        'rotate-slow': 'spin 60s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { opacity: '0.5' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 215, 0, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.4)' },
        },
      },
      backgroundImage: {
        'cosmic-gradient': 'radial-gradient(circle at center, #0A0E27 0%, #000000 100%)',
        'sacred-gradient': 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6347 100%)',
      },
    },
  },
  plugins: [],
}