import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        legal: {
          50: "#f0f5ff",
          100: "#e0ebff",
          200: "#c7dbfe",
          300: "#a1c2fd",
          400: "#709efb",
          500: "#3b75f7",
          600: "#2256eb",
          700: "#1d44d8",
          800: "#1e3a8a", // Primary authority navy
          900: "#1e3470",
          950: "#172244",
        },
        gold: {
          500: "#d97706",
          600: "#b45309",
          700: "#92400e",
        },
      },
      fontFamily: {
        serif: ["var(--font-eb-garamond)", "Georgia", "Cambria", "serif"],
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
