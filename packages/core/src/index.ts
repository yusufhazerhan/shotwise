/**
 * @shotwise/core — public API
 *
 * Native SVG + Sharp image generation engine for App Store marketing
 * screenshots. Used by Shotwise's CLI, web editor, and batch renderer.
 */

export { render } from "./render.js";
export { renderBatch, renderWithTheme } from "./batch.js";
export type { BatchRenderResult } from "./batch.js";

export { wrapText, escapeXml } from "./wrap.js";
export {
  buildTitleSvg,
  buildRoundedMask,
  buildShadow,
  buildBackground,
} from "./svg.js";

export {
  cream,
  dark,
  premium,
  themes,
  getTheme,
  type ThemeId,
} from "./themes/index.js";

export {
  CANVAS_PRESETS,
  getCanvasPreset,
  type CanvasPresetId,
} from "./presets.js";

export type {
  RenderOptions,
  BatchRenderOptions,
  CanvasOptions,
  TitleOptions,
  ScreenshotOptions,
  Theme,
  ScreenSpec,
  TitlePosition,
  ShadowIntensity,
} from "./types.js";
