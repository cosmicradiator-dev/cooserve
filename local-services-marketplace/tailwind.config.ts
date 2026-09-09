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
          DEFAULT: "#1D4ED8", // Enterprise Blue (primary action)
          hover: "#1E40AF",   // Darker blue hover
          light: "#EFF6FF",   // Light blue tint
          dark: "#1E3A8A",    // Deep navy accent
          border: "#BFDBFE",  // Focus/subtle borders
        },
        secondary: {
          DEFAULT: "#475569", // Muted steel slate
          hover: "#334155",   // Darker slate hover
          light: "#F1F5F9",   // Neutral light tint
          dark: "#1E293B",    // Slate dark
        },
        admin: {
          DEFAULT: "#1E3A8A", // Deep B2B navy
          hover: "#172554",
          light: "#DBEAFE",
        },
        success: {
          DEFAULT: "#16A34A",
          hover: "#15803d",
          light: "#DCFCE7",
        },
        warning: {
          DEFAULT: "#D97706",
          hover: "#B45309",
          light: "#FEF3C7",
        },
        danger: {
          DEFAULT: "#DC2626",
          hover: "#B91C1C",
          light: "#FEE2E2",
        },
        bg: {
          DEFAULT: "#F8FAFC", // Calm neutral background
          surface: "#FFFFFF", // Pure white card surface
          subtle: "#F1F5F9",  // Secondary surface
          dark: "#0F172A",    // Dark slate
        },
        text: {
          DEFAULT: "#0F172A", // Primary dark slate text
          secondary: "#475569", // Secondary text
          muted: "#64748B",   // Subtle/caption text
          light: "#94A3B8",
        },
        border: {
          DEFAULT: "#E2E8F0", // Standard crisp divider
          subtle: "#F1F5F9",
          strong: "#CBD5E1",
        },
      },
      borderRadius: {
        DEFAULT: "4px",
        sm: "4px",
        md: "6px",
        lg: "8px",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
    },
  },
  plugins: [],
};

export default config;
