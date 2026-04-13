import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        surface: "#0d1525",
        border: "#1a2535",
        primary: {
          DEFAULT: "#00ff88",
          foreground: "#0a0a0f",
        },
        danger: {
          DEFAULT: "#ff4455",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#8892a4",
          foreground: "#8892a4",
        },
        card: {
          DEFAULT: "#0d1525",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#0d1525",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#00ff8815",
          foreground: "#00ff88",
        },
        ring: "#00ff88",
        foreground: "#ffffff",
        input: "#1a2535",
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 255, 136, 0.15)",
        "glow-lg": "0 0 40px rgba(0, 255, 136, 0.25)",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
