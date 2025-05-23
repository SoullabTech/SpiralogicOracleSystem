import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        soullab: ['Cormorant Garamond', 'serif'],
      },
      colors: {
        'soullab-gold': '#F4C430',
        'soullab-twilight': '#5E548E',
        'soullab-aether': '#D4CBE5',
        'soullab-fire': '#E25822',
      },
    },
  },
  plugins: [],
};

export default config;
