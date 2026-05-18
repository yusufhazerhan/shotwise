import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
    "../../packages/ui-primitives/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Placeholder tokens — Claude Design overrides these via CSS vars.
      colors: {
        // map to CSS vars so the design layer can switch palettes
        bg: "var(--bg)",
        fg: "var(--fg)",
        accent: "var(--accent)",
        muted: "var(--muted)",
        "muted-fg": "var(--muted-fg)",
        border: "var(--border)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
