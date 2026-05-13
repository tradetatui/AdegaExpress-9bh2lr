import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      colors: {
        brand: {
          green: "#F97316",
          "green-dim": "#EA6C0A",
          yellow: "#F59E0B",
          red: "#EF4444",
          "red-dim": "#DC2626",
          orange: "#F97316",
          "orange-dim": "#EA6C0A",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          card: "#FFFFFF",
          elevated: "#F8F7F4",
          border: "#E5E7EB",
          "border-subtle": "#F3F4F6",
        },
        tx: {
          primary: "#111827",
          secondary: "#6B7280",
          muted: "#9CA3AF",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "pulse-green": "pulseGreen 2s ease-in-out infinite",
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
      },
      keyframes: {
        pulseGreen: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(249,115,22,0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(249,115,22,0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
