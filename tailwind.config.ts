// Tailwind config with Apple-minimal design tokens for Spiralogic Oracle System
// Voice-first, elemental theming with 5-element accent system
import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // Core Apple-minimal color scheme
      colors: {
        // Base app colors
        app: {
          bg: "#0b1220",      // Deep cosmic blue base
          surface: "#1a2333", // Elevated surface
          border: "#2a3441",  // Subtle borders
          text: "#ffffff",    // Primary text
          muted: "#94a3b8",   // Secondary text
        },
        // Elemental accent system
        elemental: {
          fire: "#FF5A3C",    // Warm energetic red-orange
          water: "#3CB9FF",   // Flowing blue
          earth: "#30C384",   // Grounding green
          air: "#C9D3E6",     // Light airy blue-gray
          aether: "#A88BFF",  // Mystical purple
        },
        // Legacy oracle colors (preserve existing)
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
      // Typography scale
      fontSize: {
        'headline': ['32px', { lineHeight: '1.2', fontWeight: '600' }],
        'headline-sm': ['28px', { lineHeight: '1.2', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['13px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      // Apple-style radii
      borderRadius: {
        'apple-sm': '16px',
        'apple': '20px',
        'apple-lg': '24px',
      },
      // Soft shadows
      boxShadow: {
        'apple': '0 4px 20px rgba(0, 0, 0, 0.15)',
        'apple-lg': '0 8px 32px rgba(0, 0, 0, 0.2)',
        'voice': '0 0 20px rgba(255, 255, 255, 0.1)',
      },
      // Smooth transitions
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
