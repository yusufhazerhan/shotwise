import { escapeXml, wrapText } from "./wrap.js";
import type { TitleOptions } from "./types.js";

const DEFAULT_FONT_STACK =
  '-apple-system, "SF Pro Display", "Helvetica Neue", "Helvetica", "Arial", sans-serif';

interface BuildTitleSvgInput {
  canvasWidth: number;
  title: TitleOptions;
}

interface BuildTitleSvgResult {
  svg: Buffer;
  width: number;
  height: number;
}

/**
 * Build an SVG containing the title (with optional accent coloring).
 * Returns the SVG buffer plus its rendered dimensions so the caller can
 * position it on the canvas.
 */
export function buildTitleSvg({ canvasWidth, title }: BuildTitleSvgInput): BuildTitleSvgResult {
  const lines = wrapText(title.text, title.maxCharsPerLine);
  const lineHeight = title.lineHeight ?? Math.round(title.fontSize * 1.2);
  const fontFamily = title.fontFamily ?? DEFAULT_FONT_STACK;
  const letterSpacing = title.letterSpacing ?? 0;
  const totalHeight = lines.length * lineHeight;

  const css = `
    .t {
      font-family: ${fontFamily};
      font-weight: ${title.fontWeight};
      font-size: ${title.fontSize}px;
      letter-spacing: ${letterSpacing}px;
      fill: ${title.color};
    }
    .accent {
      fill: ${title.accentColor ?? title.color};
    }
  `;

  const tspans = lines
    .map((line, i) => {
      const y = (i + 0.85) * lineHeight;
      const inner = title.accent
        ? renderLineWithAccent(line, title.accent)
        : escapeXml(line);
      return `<text x="${canvasWidth / 2}" y="${y}" text-anchor="middle" class="t">${inner}</text>`;
    })
    .join("");

  const svg = `<svg width="${canvasWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
    <style>${css}</style>
    ${tspans}
  </svg>`;

  return { svg: Buffer.from(svg), width: canvasWidth, height: totalHeight };
}

/**
 * Render a single line with optional accent coloring on a substring.
 * Falls back to plain text if accent not found.
 */
function renderLineWithAccent(line: string, accent: string): string {
  const idx = line.indexOf(accent);
  if (idx === -1) return escapeXml(line);

  const before = line.slice(0, idx);
  const middle = line.slice(idx, idx + accent.length);
  const after = line.slice(idx + accent.length);

  return [
    escapeXml(before),
    `<tspan class="accent">${escapeXml(middle)}</tspan>`,
    escapeXml(after),
  ].join("");
}

interface BuildRoundedMaskInput {
  width: number;
  height: number;
  radius: number;
}

/** Rounded rectangle mask used to clip the screenshot. */
export function buildRoundedMask({ width, height, radius }: BuildRoundedMaskInput): Buffer {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="white"/>
  </svg>`;
  return Buffer.from(svg);
}

interface BuildShadowInput {
  width: number;
  height: number;
  radius: number;
  padding: number;
  blurStdDev: number;
  fill: string;
  offsetY?: number;
}

/** Build a soft drop shadow SVG that wraps the screenshot. */
export function buildShadow({
  width,
  height,
  radius,
  padding,
  blurStdDev,
  fill,
  offsetY = 12,
}: BuildShadowInput): Buffer {
  const totalW = width + padding * 2;
  const totalH = height + padding * 2;
  const svg = `<svg width="${totalW}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="b" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="${blurStdDev}"/>
      </filter>
    </defs>
    <rect x="${padding}" y="${padding + offsetY}" width="${width}" height="${height}"
          rx="${radius}" ry="${radius}"
          fill="${fill}" filter="url(#b)"/>
  </svg>`;
  return Buffer.from(svg);
}

/**
 * Build a background SVG supporting solid colors or CSS-style gradients.
 *
 * @example
 *   buildBackground(1284, 2778, "#F5EFE6")
 *   buildBackground(1284, 2778, "linear-gradient(180deg, #F5EFE6 0%, #E8DECC 100%)")
 */
export function buildBackground(width: number, height: number, background: string): Buffer {
  const gradMatch = /linear-gradient\((\d+deg),\s*(.+)\)/i.exec(background);

  if (gradMatch) {
    const angle = Number(gradMatch[1]);
    const stops = parseStops(gradMatch[2]);
    const { x1, y1, x2, y2 } = angleToCoords(angle);

    const stopsXml = stops
      .map((s) => `<stop offset="${s.offset}" stop-color="${s.color}"/>`)
      .join("");

    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stopsXml}</linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#g)"/>
    </svg>`;

    return Buffer.from(svg);
  }

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="${background}"/>
  </svg>`;
  return Buffer.from(svg);
}

function parseStops(input: string): Array<{ color: string; offset: string }> {
  return input.split(",").map((raw) => {
    const parts = raw.trim().split(/\s+/);
    const color = parts[0]!;
    const pct = parts[1] ?? "0%";
    return { color, offset: pct };
  });
}

/** Convert CSS-style gradient angle (0deg = up) to SVG x1/y1/x2/y2 (0..1). */
function angleToCoords(angle: number): { x1: number; y1: number; x2: number; y2: number } {
  // CSS angles: 0deg points up, increases clockwise.
  // SVG gradient coords (0..1) — convert via trig.
  const rad = ((angle - 90) * Math.PI) / 180;
  const x = Math.cos(rad);
  const y = Math.sin(rad);
  return {
    x1: 0.5 - x / 2,
    y1: 0.5 - y / 2,
    x2: 0.5 + x / 2,
    y2: 0.5 + y / 2,
  };
}
