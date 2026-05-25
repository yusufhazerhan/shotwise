/**
 * Public types for @shotwise/core.
 */

export type TitlePosition = "top" | "bottom";
export type ShadowIntensity = "none" | "subtle" | "strong";

export interface CanvasOptions {
  /** Output width in pixels (default: 1284 — App Store 6.7" iPhone). */
  width: number;
  /** Output height in pixels (default: 2778). */
  height: number;
  /**
   * Background fill — solid color hex (`#F5EFE6`) or CSS-style gradient string
   * (`linear-gradient(180deg, #F5EFE6 0%, #E8DECC 100%)`).
   */
  background: string;
}

export interface TitleOptions {
  /** Title text. Supports `\n` for explicit line breaks. */
  text: string;
  /**
   * Optional substring to colorize with `accentColor`. Case-sensitive,
   * first occurrence only.
   */
  accent?: string;
  /** Font family. Defaults to Apple SF / system sans-serif. */
  fontFamily?: string;
  /** Font size in pixels. */
  fontSize: number;
  /** Font weight (CSS numeric: 400, 600, 800, …). */
  fontWeight: number;
  /** Letter spacing in pixels (negative tightens). */
  letterSpacing?: number;
  /** Title fill color. */
  color: string;
  /** Accent fill color (only applied if `accent` is set). */
  accentColor?: string;
  /** Position on canvas. */
  position: TitlePosition;
  /** Pixels from top/bottom edge of canvas. */
  padding: number;
  /** Pixel line height (defaults to fontSize × 1.2). */
  lineHeight?: number;
  /** Max characters per line before soft-wrapping. */
  maxCharsPerLine: number;
}

export interface ScreenshotOptions {
  /** Maximum width of the screenshot inside the canvas (pixels). */
  maxWidth: number;
  /** Maximum height of the screenshot inside the canvas (pixels). */
  maxHeight: number;
  /** Corner radius in pixels. */
  cornerRadius: number;
  /** Drop shadow intensity. */
  shadow: ShadowIntensity;
  /** Vertical anchor — distance from top of canvas in pixels. */
  top: number;
}

export interface RenderOptions {
  /** Path to source PNG/JPG, a Buffer, or a Sharp instance. */
  source: string | Buffer;
  canvas: CanvasOptions;
  title: TitleOptions;
  screenshot: ScreenshotOptions;
}

export type SceneBackground =
  | { type: "solid"; color: string }
  | { type: "linear"; from: string; to: string; angle: number; midpoint?: number };

export type SceneLayoutPreset = "single" | "sideBySide" | "stacked" | "card" | "beforeAfter" | "callout";
export type SceneDeviceKind = "none" | "iphone" | "ipad" | "android";
export type SceneFrameStyle = "none" | "minimal" | "bezel" | "glass";
export type SceneTextRole = "title" | "subtitle" | "badge" | "note";

export interface SceneTextBlock {
  id: string;
  role: SceneTextRole;
  text: string;
  accent?: string;
  x: number;
  y: number;
  width: number;
  align: "left" | "center" | "right";
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  /** Relative extra gap between letters. Useful when heavy fonts visually merge. */
  letterSpacing?: number;
  /** Relative extra gap between words. Useful for bold store headlines. */
  wordSpacing?: number;
  color: string;
  accentColor: string;
}

export interface SceneScreenshotTransform {
  x: number;
  y: number;
  width: number;
  scale: number;
  rotation: number;
  fit: "contain" | "cover";
}

export interface SceneScreenshotSlot extends SceneScreenshotTransform {
  id: string;
  /** The uploaded/local screenshot id that should fill this slot. */
  sourceId?: string;
  /** Optional per-slot device overrides. Falls back to the scene-level device. */
  device?: Partial<SceneDeviceOptions>;
  /** Optional editor-facing label for templates such as Before / After. */
  label?: string;
}

export interface SceneDeviceOptions {
  enabled: boolean;
  kind: SceneDeviceKind;
  frameStyle: SceneFrameStyle;
  padding: number;
  radius: number;
  shadow: ShadowIntensity;
  tilt: number;
  hideStatusBar: boolean;
}

export interface SceneCallout {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
}

export interface SceneAdvancedOverrides {
  customCss?: string;
  customJson?: Record<string, unknown>;
}

export interface StoreScreenshotScene {
  version: 1;
  canvasPresetId: string;
  background: SceneBackground;
  layoutPreset: SceneLayoutPreset;
  /**
   * Backwards-compatible primary screenshot transform. New templates should use
   * `screenshots`; this remains the migration source and single-screen alias.
   */
  device: SceneDeviceOptions;
  screenshot: SceneScreenshotTransform;
  screenshots?: SceneScreenshotSlot[];
  textBlocks: SceneTextBlock[];
  callouts: SceneCallout[];
  advanced?: SceneAdvancedOverrides;
}

export interface SceneRenderOptions {
  source: string | Buffer;
  /** Optional source lookup for multi-slot scenes. Falls back to `source`. */
  sources?: Record<string, string | Buffer>;
  scene: StoreScreenshotScene;
  canvas: { width: number; height: number };
  localeText?: { title?: string; subtitle?: string; accent?: string };
}

export interface Theme {
  id: string;
  label: string;
  canvas: Omit<CanvasOptions, "width" | "height">;
  title: Omit<TitleOptions, "text" | "accent">;
  screenshot: ScreenshotOptions;
}

export interface ScreenSpec {
  /** Path or Buffer of raw screenshot. */
  source: string | Buffer;
  /** Output title for this screen (supports `\n`). */
  title: string;
  /** Optional accent substring. */
  accent?: string;
}

export interface BatchRenderOptions {
  /** Screens to render in sequence. */
  screens: ScreenSpec[];
  /** Theme preset or custom config. */
  theme: Theme;
  /** Canvas dimensions (theme overrides only colors, sizes come from here). */
  canvasSize: { width: number; height: number };
}
