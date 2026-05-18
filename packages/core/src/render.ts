import sharp from "sharp";
import { buildBackground, buildRoundedMask, buildShadow, buildTitleSvg } from "./svg.js";
import type { RenderOptions, ShadowIntensity } from "./types.js";

/**
 * Render a single marketing screenshot.
 *
 * Pipeline:
 *   1. Solid/gradient background fills the canvas.
 *   2. Drop shadow rectangle is composited beneath the screenshot.
 *   3. Source screenshot is resized + masked with rounded corners.
 *   4. Title SVG (with optional accent) is composited on top/bottom.
 *
 * Returns a PNG buffer at canvas.width × canvas.height.
 */
export async function render(opts: RenderOptions): Promise<Buffer> {
  const { source, canvas, title, screenshot } = opts;

  // 1. Compute screenshot dimensions, preserving aspect ratio
  const meta = await sharp(source).metadata();
  if (!meta.width || !meta.height) {
    throw new Error("Could not read source image dimensions");
  }
  const ratio = meta.width / meta.height;

  let ssWidth = screenshot.maxWidth;
  let ssHeight = ssWidth / ratio;
  if (ssHeight > screenshot.maxHeight) {
    ssHeight = screenshot.maxHeight;
    ssWidth = ssHeight * ratio;
  }
  ssWidth = Math.round(ssWidth);
  ssHeight = Math.round(ssHeight);

  // 2. Resize + mask the screenshot
  const mask = buildRoundedMask({
    width: ssWidth,
    height: ssHeight,
    radius: screenshot.cornerRadius,
  });

  const screenshotBuf = await sharp(source)
    .resize(ssWidth, ssHeight)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();

  // 3. Title
  const titleResult = buildTitleSvg({ canvasWidth: canvas.width, title });

  // 4. Compute layout positions
  const ssX = Math.round((canvas.width - ssWidth) / 2);
  const ssY = screenshot.top;

  const titleX = 0;
  const titleY =
    title.position === "top"
      ? title.padding
      : canvas.height - title.padding - titleResult.height;

  // 5. Shadow (optional)
  const shadowConfig = resolveShadow(screenshot.shadow);
  const composites: sharp.OverlayOptions[] = [];

  if (shadowConfig) {
    const shadowPad = shadowConfig.padding;
    const shadowSvg = buildShadow({
      width: ssWidth,
      height: ssHeight,
      radius: screenshot.cornerRadius,
      padding: shadowPad,
      blurStdDev: shadowConfig.blur,
      fill: shadowConfig.fill,
    });
    composites.push({
      input: shadowSvg,
      top: ssY - shadowPad,
      left: ssX - shadowPad,
    });
  }

  composites.push({ input: screenshotBuf, top: ssY, left: ssX });
  composites.push({ input: titleResult.svg, top: titleY, left: titleX });

  // 6. Background + composite
  const bg = buildBackground(canvas.width, canvas.height, canvas.background);

  return sharp(bg).composite(composites).png().toBuffer();
}

function resolveShadow(intensity: ShadowIntensity): {
  padding: number;
  blur: number;
  fill: string;
} | null {
  switch (intensity) {
    case "none":
      return null;
    case "subtle":
      return { padding: 60, blur: 22, fill: "rgba(30,58,46,0.18)" };
    case "strong":
      return { padding: 80, blur: 36, fill: "rgba(0,0,0,0.28)" };
    default:
      return null;
  }
}
