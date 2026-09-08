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
        primary: {
          DEFAULT: "#0F766E",
          hover: "#0d655e",
          light: "#ccfbf1",
        },
        secondary: {
          DEFAULT: "#F59E0B",
          hover: "#d97706",
          light: "#fef3c7",
        },
        admin: {
          DEFAULT: "#4338CA",
          hover: "#3730a3",
          light: "#e0e7ff",
        },
        success: {
          DEFAULT: "#16A34A",
          hover: "#15803d",
          light: "#dcfce7",
        },
        danger: {
          DEFAULT: "#DC2626",
          hover: "#b91c1c",
          light: "#fee2e2",
        },
        bg: {
          DEFAULT: "#F8FAFC",
          dark: "#0F172A",
        },
        text: {
          DEFAULT: "#1E293B",
          muted: "#64748B",
        },
      },
      aspectRatio: {
        "9/16": "9 / 16",
      },
    },
  },
  plugins: [],
};

export default config;

