import type { Theme } from "../types.js";

/**
 * Dark — charcoal background, bright cream text, warm accent.
 * Modern developer-tool feel (Linear, Vercel, Raycast).
 */
export const dark: Theme = {
  id: "dark",
  label: "Dark",
  canvas: {
    background: "#1A1A1A",
  },
  title: {
    fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
    fontSize: 108,
    fontWeight: 800,
    letterSpacing: -2,
    color: "#F5EFE6",
    accentColor: "#FF8B5C",
    position: "top",
    padding: 200,
    maxCharsPerLine: 22,
  },
  screenshot: {
    maxWidth: 1020,
    maxHeight: 1820,
    cornerRadius: 60,
    shadow: "strong",
    top: 720,
  },
};
