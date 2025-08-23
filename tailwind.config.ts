// Tailwind config with Spiralogic dark + gold design tokens
import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './stories/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Spiralogic tokens (using CSS variables)
        bg: { 900: 'var(--bg-900)', 800: 'var(--bg-800)' },
        ink: { 100: 'var(--ink-100)', 300: 'var(--ink-300)' },
        edge: { 600: 'var(--edge-600)', 700: 'var(--edge-700)' },
        gold: { 400: 'var(--gold-400)', 500: 'var(--gold-500)' },
        state: {
          green: 'var(--state-green)',
          amber: 'var(--state-amber)',
          red: 'var(--state-red)'
        },
        
        // Legacy colors (preserve for compatibility)
        app: {
          bg: "#0b1220",
          surface: "#1a2333",
          border: "#2a3441",
          text: "#ffffff",
          muted: "#94a3b8",
        },
        elemental: {
          fire: "#FF5A3C",
          water: "#3CB9FF",
          earth: "#30C384",
          air: "#C9D3E6",
          aether: "#A88BFF",
        },
        oracle: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
      },
      borderRadius: {
        xl: 'var(--radius-xl)',
        // Legacy Apple-style radii
        'apple-sm': '16px',
        'apple': '20px',
        'apple-lg': '24px',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        lift: 'var(--shadow-lift)',
        // Legacy shadows
        'apple': '0 4px 20px rgba(0, 0, 0, 0.15)',
        'apple-lg': '0 8px 32px rgba(0, 0, 0, 0.2)',
        'voice': '0 0 20px rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'serif']
      },
      transitionTimingFunction: {
        'ease-out-soft': 'var(--ease-out-soft)'
      },
      // Legacy typography scale
      fontSize: {
        'headline': ['32px', { lineHeight: '1.2', fontWeight: '600' }],
        'headline-sm': ['28px', { lineHeight: '1.2', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['13px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      // Legacy transitions
      transitionDuration: {
        'apple': '150ms',
        'apple-slow': '220ms',
      },
      // Layout spacing
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [forms],
  safelist: [
    // Elemental theme classes for dynamic theming
    'text-elemental-fire',
    'text-elemental-water', 
    'text-elemental-earth',
    'text-elemental-air',
    'text-elemental-aether',
    'bg-elemental-fire',
    'bg-elemental-water',
    'bg-elemental-earth', 
    'bg-elemental-air',
    'bg-elemental-aether',
    'border-elemental-fire',
    'border-elemental-water',
    'border-elemental-earth',
    'border-elemental-air', 
    'border-elemental-aether',
  ],
};

export default config;
