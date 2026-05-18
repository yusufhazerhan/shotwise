/**
 * Canvas size presets matching App Store / Play Store requirements.
 */

export const CANVAS_PRESETS = {
  /** iPhone 6.7" (15 Pro Max, 14 Plus, etc.). Apple auto-scales to smaller sizes. */
  iphone67: { width: 1284, height: 2778, label: 'iPhone 6.7"' },
  /** iPhone 6.5" (11 Pro Max, XS Max). */
  iphone65: { width: 1242, height: 2688, label: 'iPhone 6.5"' },
  /** iPhone 5.5" (8 Plus, 7 Plus). */
  iphone55: { width: 1242, height: 2208, label: 'iPhone 5.5"' },
  /** iPad Pro 12.9" 3rd gen+. */
  ipadPro129: { width: 2048, height: 2732, label: 'iPad Pro 12.9"' },
  /** Google Play Phone — recommended portrait. */
  playPhone: { width: 1080, height: 1920, label: "Google Play Phone" },
} as const;

export type CanvasPresetId = keyof typeof CANVAS_PRESETS;

export function getCanvasPreset(id: CanvasPresetId): {
  width: number;
  height: number;
  label: string;
} {
  return CANVAS_PRESETS[id];
}
