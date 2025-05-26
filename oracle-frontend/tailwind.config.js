/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#d4af37',
        deep: {
          purple: '#0d0218',
          violet: '#1a0c2b'
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-cinzel)', 'sans-serif'],
      },
      boxShadow: {
        glyph: '0 0 20px rgba(212, 175, 55, 0.25)',
      },
    },
  },
  plugins: [],
}
