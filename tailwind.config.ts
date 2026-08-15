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
        teal: "#136052",
        "yellow-soft": "#FFF099",
        "mint-emerald": "#28B182",
        charcoal: "#0F172A",
      },
    },
  },
  plugins: [],
};

export default config;
