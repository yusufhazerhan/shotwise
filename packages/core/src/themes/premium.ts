import type { Theme } from "../types.js";

/**
 * Premium — white background, deep navy text, gold accent.
 * Luxury / finance / B2B premium feel.
 */
export const premium: Theme = {
  id: "premium",
  label: "Premium",
  canvas: {
    background: "linear-gradient(180deg, #FFFFFF 0%, #F0F2F5 100%)",
  },
  title: {
    fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
    fontSize: 104,
    fontWeight: 800,
    letterSpacing: -2,
    color: "#0F1B2D",
    accentColor: "#C9A961",
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
