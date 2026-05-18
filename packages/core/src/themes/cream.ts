import type { Theme } from "../types.js";

/**
 * Cream — warm, premium aesthetic.
 * Inspired by Calm, Headspace, and Notion's marketing assets.
 */
export const cream: Theme = {
  id: "cream",
  label: "Cream",
  canvas: {
    background: "#F5EFE6",
  },
  title: {
    fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
    fontSize: 108,
    fontWeight: 800,
    letterSpacing: -2,
    color: "#1E3A2E",
    accentColor: "#D97757",
    position: "top",
    padding: 200,
    maxCharsPerLine: 22,
  },
  screenshot: {
    maxWidth: 1020,
    maxHeight: 1820,
    cornerRadius: 60,
    shadow: "subtle",
    top: 720,
  },
};
