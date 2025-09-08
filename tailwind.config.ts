// root/tailwind.config.ts
import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  safelist: [{ pattern: /bg-oracle-(50|100|200|300|400|500|600|700|800|900)/ }],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "sacred-gradient": "linear-gradient(135deg, #B69A78 0%, #7A9A65 50%, #6B9BD1 100%)",
        "sacred-radial": "radial-gradient(circle at center, rgba(255, 215, 0, 0.1) 0%, transparent 70%)",
      },
      colors: {
        // Earth Tone Sacred Palette - Based on Facet Colors
        sacred: {
          brown: "#B69A78",     // Base earth brown
          tan: "#D4B896",       // Light tan 
          sienna: "#C85450",    // Sacred sienna
          sage: "#7A9A65",      // Sacred sage green
        },
        // Elemental Earth Tones - From Facets
        fire: {
          base: "#C85450",      // Fire facet red
          glow: "#E06B67",      // Fire glow
          shadow: "#A84440",    // Fire shadow
        },
        water: {
          base: "#6B9BD1",      // Water facet blue
          glow: "#83B3E9",      // Water glow
          shadow: "#5383B9",    // Water shadow
        },
        earth: {
          base: "#7A9A65",      // Earth facet green
          glow: "#92B27D",      // Earth glow
          shadow: "#628253",    // Earth shadow
        },
        air: {
          base: "#D4B896",      // Air facet tan
          glow: "#F0D4B2",      // Air glow
          shadow: "#B89A7A",    // Air shadow
        },
        // Sacred Gold Accents - Premium Highlights
        gold: {
          divine: "#FFD700",    // Primary accent - Divine Gold
          amber: "#F6AD55",     // Secondary accent - Sacred Amber
          ethereal: "#FEB95A",  // Tertiary accent - Ethereal Gold
          whisper: "#FEF5E7",   // Background accent - Whisper Gold
        },
        // Sacred Neutrals - Text and UI Elements
        neutral: {
          pure: "#FFFFFF",      // Text/contrast - Pure Light
          silver: "#E2E8F0",    // Secondary text - Sacred Silver
          mystic: "#A0AEC0",    // Tertiary text - Mystic Gray
          shadow: "#4A5568",    // Subdued elements - Shadow Gray
        },
        tesla: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        "tesla-red": "#DC2626",
        "tesla-blue": "#3B82F6",
      },
      spacing: {
        // Golden Ratio Based Spacing System
        'sacred-xs': '0.618rem',  // φ⁻¹
        'sacred-sm': '1rem',       // Base unit
        'sacred-md': '1.618rem',   // φ
        'sacred-lg': '2.618rem',   // φ + 1
        'sacred-xl': '4.236rem',   // φ²
        'sacred-2xl': '6.854rem',  // φ³
        'sacred-3xl': '11.09rem',  // φ⁴
      },
      borderRadius: {
        'sacred-sm': '4px',        // Subtle Sacred curves
        'sacred-md': '8px',        // Standard Sacred radius
        'sacred-lg': '16px',       // Prominent Sacred curves
        'sacred': '13px',          // Golden ratio derived
      },
      boxShadow: {
        'sacred-subtle': '0 1px 3px rgba(10, 14, 39, 0.1)',
        'sacred-glow': '0 4px 20px rgba(255, 215, 0, 0.1)',
        'sacred-deep': '0 10px 40px rgba(10, 14, 39, 0.3)',
        'sacred-gold': '0 0 30px rgba(255, 215, 0, 0.2)',
        'sacred-inner': 'inset 0 2px 10px rgba(255, 215, 0, 0.05)',
      },
      fontFamily: {
        'sacred-primary': ['Inter', 'SF Pro Display', '-apple-system', 'sans-serif'],
        'sacred-accent': ['Crimson Pro', 'Georgia', 'serif'],
      },
      animation: {
        // Premium Sacred Animations
        "emergence": "emergence 1.618s ease-out",
        "jitterbug": "jitterbug 2.618s ease-in-out",
        "spiral": "spiral 3.236s ease-in-out infinite",
        "sacred-hover": "sacred-hover 0.382s ease-out",
        "sacred-pulse": "sacred-pulse 2s infinite",
        "sacred-rotate": "sacred-rotate 10s infinite linear",
        "consciousness-ripple": "consciousness-ripple 2s infinite",
        "golden-spin": "golden-spin 6.18s linear infinite",
        "float-sacred": "float-sacred 4.236s ease-in-out infinite",
      },
      keyframes: {
        emergence: {
          '0%': { opacity: '0', transform: 'scale(0.618) translateY(20px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        jitterbug: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '25%': { transform: 'rotate(90deg) scale(1.1)' },
          '50%': { transform: 'rotate(180deg) scale(1)' },
          '75%': { transform: 'rotate(270deg) scale(0.9)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        spiral: {
          '0%': { transform: 'rotate(0deg) translateX(0)' },
          '100%': { transform: 'rotate(360deg) translateX(10px)' },
        },
        'sacred-hover': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        'sacred-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.618' },
        },
        'golden-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'float-sacred': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [forms],
};

export default config;
