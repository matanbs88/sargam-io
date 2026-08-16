import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAF9F6",
        "cream-warm": "#F4F0E8",
        teal: "#136052",
        "teal-deep": "#0B4038",
        "yellow-soft": "#FFF099",
        "mint-emerald": "#28B182",
        "performance-blue": "#58A6FF",
        charcoal: "#0F172A",
      },
      fontFamily: {
        sans: ["var(--font-sargam-sans)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-sargam-display)", "Georgia", "serif"],
        devanagari: [
          "var(--font-sargam-devanagari)",
          "Noto Sans Devanagari",
          "sans-serif",
        ],
      },
      boxShadow: {
        "teal-float": "0 18px 45px rgba(15, 76, 65, 0.12)",
        "teal-soft": "0 10px 28px rgba(15, 76, 65, 0.10)",
        "yellow-glow": "0 12px 28px rgba(255, 240, 153, 0.34)",
      },
    },
  },
  plugins: [],
};

export default config;
