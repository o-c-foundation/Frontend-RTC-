/* eslint-disable import/no-extraneous-dependencies */
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/daisyui/dist/**/*.js",
    "node_modules/react-daisyui/dist/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        silkscreen: ["Silkscreen", "monospace"],
        capsula: ["Capsula Sans", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        "neon-green": {
          50: "#f0fdf4",
          100: "#dcfce7", 
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#00ff7f", // Robin-neon green
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        "deep-black": {
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
          950: "#000000", // Pure black
        }
      }
    },
  },
  daisyui: {
    themes: [
      {
        vlayer: {
          primary: "#00ff7f", // Robin-neon green
          secondary: "#00cc66", // Darker neon green
          accent: "#00ff7f", // Robin-neon green
          neutral: "#000000", // Pure black
          "base-100": "#000000", // Pure black background
          "base-200": "#0f0f0f", // Very dark gray
          "base-300": "#1a1a1a", // Dark gray
          info: "#00ff7f", // Neon green
          success: "#00ff7f", // Neon green
          warning: "#ffff00", // Neon yellow
          error: "#ff0040", // Neon red/pink
        },
      },
    ],
  },
  plugins: [daisyui],
};
