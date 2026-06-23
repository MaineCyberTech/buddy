import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lcd: {
          bg: "#1a1a2e",
          fg: "#e8e8d0",
          dark: "#0f0f1a",
          accent: "#00ff88",
          warn: "#ffaa00",
          danger: "#ff3366",
        },
        buddy: {
          common: "#888888",
          uncommon: "#44aa44",
          rare: "#4488ff",
          epic: "#aa44ff",
          legendary: "#ffaa00",
          shiny: "#ffdd00",
        },
      },
      fontFamily: {
        lcd: ["'JetBrains Mono'", "monospace"],
        ui: ["'IBM Plex Sans'", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "blink": "blink 1s step-end infinite",
        "hatch-shake": "hatchShake 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.5s ease-out",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        hatchShake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;