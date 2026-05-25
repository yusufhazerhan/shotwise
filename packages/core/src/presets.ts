/**
 * Canvas size presets matching App Store / Play Store requirements.
 */

export const CANVAS_PRESETS = {
  /** iPhone 6.9" / current Pro Max App Store portrait. */
  iphone69: { width: 1290, height: 2796, label: 'iPhone 6.9"' },
  /** iPhone 6.7" (15 Pro Max, 14 Plus, etc.). Apple auto-scales to smaller sizes. */
  iphone67: { width: 1284, height: 2778, label: 'iPhone 6.7"' },
  /** iPhone 6.5" (11 Pro Max, XS Max). */
  iphone65: { width: 1242, height: 2688, label: 'iPhone 6.5"' },
  /** iPhone 6.1" portrait. */
  iphone61: { width: 1179, height: 2556, label: 'iPhone 6.1"' },
  /** iPhone 5.5" (8 Plus, 7 Plus). */
  iphone55: { width: 1242, height: 2208, label: 'iPhone 5.5"' },
  /** iPad 13" current App Store portrait. */
  ipad13: { width: 2064, height: 2752, label: 'iPad 13"' },
  /** iPad Pro 12.9" 3rd gen+. */
  ipadPro129: { width: 2048, height: 2732, label: 'iPad Pro 12.9"' },
  /** Backwards-compatible id used by the early web UI. */
  ipad129: { width: 2048, height: 2732, label: 'iPad Pro 12.9"' },
  /** iPad 11" current App Store portrait. */
  ipad11: { width: 1668, height: 2420, label: 'iPad 11"' },
  /** Google Play Phone — recommended portrait. */
  playPhone: { width: 1080, height: 1920, label: "Google Play Phone" },
  /** Android Pixel-style tall Play Store screenshot. */
  android: { width: 1080, height: 2400, label: "Android Pixel" },
  /** Google Pixel 9 portrait screenshot. */
  pixel9: { width: 1080, height: 2424, label: "Pixel 9 Pro" },
  /** Pixel Fold unfolded screenshot. */
  pixelFold: { width: 2208, height: 1840, label: "Pixel Fold" },
  /** Samsung tall Android screenshot. */
  galaxy: { width: 1440, height: 3088, label: "Samsung Galaxy" },
  /** Samsung Galaxy S24 Ultra tall screenshot. */
  galaxyS24: { width: 1440, height: 3120, label: "Galaxy S24 Ultra" },
  /** OnePlus tall Android screenshot. */
  oneplus: { width: 1440, height: 3216, label: "OnePlus Tall" },
  /** Google Play tablet screenshot. */
  playTablet: { width: 1600, height: 2560, label: "Google Play Tablet" },
} as const;

export type CanvasPresetId = keyof typeof CANVAS_PRESETS;

export function getCanvasPreset(id: CanvasPresetId): {
  width: number;
  height: number;
  label: string;
} {
  return CANVAS_PRESETS[id];
}
