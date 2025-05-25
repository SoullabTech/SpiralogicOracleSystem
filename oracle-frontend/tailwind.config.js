module.exports = {
  theme: {
    extend: {
      colors: {
        'soullab-mist': '#f4f3ff',
        'soullab-aether': '#cbbcf6',
        'soullab-twilight': '#483f59',
        'soullab-gold': '#f6e27f',
        'soullab-indigo': '#6b46c1',
        'soullab-purple': '#805ad5',
        'soullab-moon': '#dcd6f7',
      },
      fontFamily: {
        soullab: ['"Cormorant Garamond"', 'serif'],
      },
      animation: {
        orbit: 'orbit 12s infinite linear',
        breathe: 'breathe 6s ease-in-out infinite',
        'fade-in': 'fadeIn 1s ease-out forwards',
      },
      keyframes: {
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(0)' },
          '100%': { transform: 'rotate(360deg) translateX(0)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
