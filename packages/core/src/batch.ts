import { render } from "./render.js";
import type { BatchRenderOptions, ScreenSpec, Theme } from "./types.js";

export interface BatchRenderResult {
  /** Index in the input array (preserves order). */
  index: number;
  /** Source screen spec (for reference). */
  spec: ScreenSpec;
  /** Generated PNG buffer. */
  buffer: Buffer;
}

/**
 * Render multiple screens in sequence using a single theme.
 *
 * The theme supplies all visual style (colors, fonts, layout); each
 * `ScreenSpec` supplies the source image and per-screen title/accent.
 *
 * Renders sequentially to keep memory predictable. For high throughput,
 * call this concurrently per project (one batch per language) at the
 * orchestrator level.
 */
export async function renderBatch(opts: BatchRenderOptions): Promise<BatchRenderResult[]> {
  const results: BatchRenderResult[] = [];

  for (let i = 0; i < opts.screens.length; i++) {
    const spec = opts.screens[i]!;
    const buffer = await renderWithTheme(spec, opts.theme, opts.canvasSize);
    results.push({ index: i, spec, buffer });
  }

  return results;
}

/**
 * Render a single screen using a theme as the visual config and a screen
 * spec as the content. Useful for tests + the CLI.
 */
export async function renderWithTheme(
  spec: ScreenSpec,
  theme: Theme,
  canvasSize: { width: number; height: number }
): Promise<Buffer> {
  return render({
    source: spec.source,
    canvas: {
      width: canvasSize.width,
      height: canvasSize.height,
      background: theme.canvas.background,
    },
    title: {
      ...theme.title,
      text: spec.title,
      accent: spec.accent,
    },
    screenshot: theme.screenshot,
  });
}
