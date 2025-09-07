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
      },
      colors: {
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
      animation: {
        "pulse-torus": "pulse-torus 2s infinite ease-in-out",
        "tesla-glow": "tesla-glow 3s infinite ease-in-out",
        "consciousness-ripple": "consciousness-ripple 2s infinite",
        "sacred-rotate": "sacred-rotate 10s infinite linear",
        "spin-slow": "spin-slow 3s linear infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float-slow 8s ease-in-out infinite",
        "float-reverse": "float-reverse 7s ease-in-out infinite",
      },
    },
  },
  plugins: [forms],
};

export default config;
