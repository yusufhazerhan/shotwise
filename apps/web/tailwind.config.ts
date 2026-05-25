import type { Config } from "tailwindcss";

/** Shotwise design tokens. */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
    "../../packages/ui-primitives/src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "28px",
      screens: { lg: "1200px", xl: "1200px", "2xl": "1200px" },
    },
    extend: {
      colors: {
        cream: { DEFAULT: "#F5EFE6", 2: "#EFE7DA", 3: "#E8DFCF" },
        ink: {
          DEFAULT: "#1E3A2E",
          2: "#2C4A3C",
          soft: "#4A6258",
          mute: "#7A8A82",
        },
        coral: { DEFAULT: "#D97757", 2: "#C8623F", soft: "rgba(217,119,87,0.12)" },
        charcoal: "#1A1A1A",
        line: { DEFAULT: "rgba(30,58,46,0.10)", 2: "rgba(30,58,46,0.18)" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo"],
        display: ["var(--font-sans)", "Inter", "ui-sans-serif"],
      },
      borderRadius: {
        card: "16px",
        input: "8px",
        pill: "999px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(30,58,46,0.04), 0 1px 1px rgba(30,58,46,0.03)",
        md: "0 4px 14px rgba(30,58,46,0.06), 0 1px 3px rgba(30,58,46,0.04)",
        lg: "0 16px 40px rgba(30,58,46,0.08), 0 4px 12px rgba(30,58,46,0.04)",
        xl: "0 30px 60px rgba(30,58,46,0.10), 0 8px 20px rgba(30,58,46,0.06)",
      },
      letterSpacing: {
        tightest: "-0.035em",
        tighter: "-0.028em",
        tight: "-0.02em",
        mono: "0.06em",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "none" },
        },
        "orb-pulse": {
          "0%,100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.04)" },
        },
        "step-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        "fade-up": "fade-up .5s ease both",
        "orb-pulse": "orb-pulse 2s ease-in-out infinite",
        "step-in": "step-in .35s cubic-bezier(.2,.7,.3,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
