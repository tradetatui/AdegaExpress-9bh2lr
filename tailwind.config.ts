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
          green: "#00D97E",
          "green-dim": "#00A861",
          yellow: "#F5C518",
          red: "#EF4444",
          "red-dim": "#DC2626",
        },
        surface: {
          DEFAULT: "#0A0A0A",
          card: "#111111",
          elevated: "#1A1A1A",
          border: "#2A2A2A",
          "border-subtle": "#1E1E1E",
        },
        tx: {
          primary: "#F9FAFB",
          secondary: "#9CA3AF",
          muted: "#4B5563",
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
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(0,217,126,0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(0,217,126,0)" },
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
