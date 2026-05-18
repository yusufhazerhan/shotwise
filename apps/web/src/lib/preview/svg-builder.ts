/**
 * Browser-side SVG composition mirroring @shotwise/core for instant preview.
 *
 * The server-side pipeline (Sharp + SVG) is the source of truth at export
 * time. This builder approximates it visually so the editor can re-render
 * <300ms on each keystroke. For pixel-perfect output, the client can hit
 * `/api/render/preview` (server-side Sharp).
 */

export interface PreviewParams {
  canvas: { width: number; height: number; background: string };
  title: { text: string; accent?: string; color: string; accentColor?: string; fontSize: number; fontWeight: number; position: "top" | "bottom"; padding: number; maxCharsPerLine: number };
  screenshot: { maxWidth: number; maxHeight: number; cornerRadius: number; shadow: "none" | "subtle" | "strong"; top: number };
  /** Source image as data URL or absolute https URL. */
  imageHref: string;
}

export function buildPreviewSvg(p: PreviewParams): string {
  const { width, height, background } = p.canvas;
  const lines = wrapText(p.title.text, p.title.maxCharsPerLine);
  const lineHeight = Math.round(p.title.fontSize * 1.2);
  const totalTitleHeight = lineHeight * lines.length;

  const titleY =
    p.title.position === "top"
      ? p.title.padding + p.title.fontSize
      : height - p.title.padding - totalTitleHeight + p.title.fontSize;

  const titleSvg = lines
    .map((line, i) => {
      const y = titleY + i * lineHeight;
      const inner = renderAccent(line, p.title.accent, p.title.accentColor ?? p.title.color);
      return `<text x="50%" y="${y}" text-anchor="middle" font-size="${p.title.fontSize}" font-weight="${p.title.fontWeight}" fill="${p.title.color}" font-family="-apple-system, system-ui, sans-serif">${inner}</text>`;
    })
    .join("");

  // Screenshot positioned beneath the title at p.screenshot.top
  const ssWidth = Math.min(p.screenshot.maxWidth, width - 80);
  const ssHeight = p.screenshot.maxHeight;
  const ssX = (width - ssWidth) / 2;
  const ssY = p.screenshot.top;
  const radius = p.screenshot.cornerRadius;

  const shadow =
    p.screenshot.shadow === "none"
      ? ""
      : `<filter id="sw-shadow"><feGaussianBlur stdDeviation="${p.screenshot.shadow === "strong" ? 28 : 18}"/></filter>
         <rect x="${ssX}" y="${ssY + 12}" width="${ssWidth}" height="${ssHeight}" rx="${radius}" fill="rgba(0,0,0,0.18)" filter="url(#sw-shadow)"/>`;

  const bg = background.startsWith("linear-gradient(")
    ? `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">${gradientStops(background)}</linearGradient></defs><rect width="100%" height="100%" fill="url(#bg)"/>`
    : `<rect width="100%" height="100%" fill="${background}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
    ${bg}
    ${shadow}
    <clipPath id="sw-mask"><rect x="${ssX}" y="${ssY}" width="${ssWidth}" height="${ssHeight}" rx="${radius}" ry="${radius}"/></clipPath>
    <image href="${escapeAttr(p.imageHref)}" x="${ssX}" y="${ssY}" width="${ssWidth}" height="${ssHeight}" clip-path="url(#sw-mask)" preserveAspectRatio="xMidYMid slice"/>
    ${titleSvg}
  </svg>`;
}

function wrapText(text: string, maxChars: number): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    const words = para.split(/\s+/);
    let line = "";
    for (const w of words) {
      const candidate = line ? `${line} ${w}` : w;
      if (candidate.length > maxChars && line) {
        out.push(line);
        line = w;
      } else {
        line = candidate;
      }
    }
    if (line) out.push(line);
  }
  return out;
}

function renderAccent(line: string, accent: string | undefined, accentColor: string): string {
  if (!accent) return escapeXml(line);
  const idx = line.indexOf(accent);
  if (idx === -1) return escapeXml(line);
  const before = line.slice(0, idx);
  const middle = line.slice(idx, idx + accent.length);
  const after = line.slice(idx + accent.length);
  return [
    escapeXml(before),
    `<tspan fill="${accentColor}">${escapeXml(middle)}</tspan>`,
    escapeXml(after),
  ].join("");
}

function gradientStops(css: string): string {
  // Very forgiving parser — extract colors after the angle and turn them into evenly spaced stops.
  const inside = css.slice(css.indexOf("(") + 1, css.lastIndexOf(")"));
  const parts = inside.split(",").slice(1).map((p) => p.trim());
  if (parts.length < 2) return `<stop offset="0%" stop-color="${parts[0] ?? "#fff"}"/><stop offset="100%" stop-color="${parts[parts.length - 1] ?? "#000"}"/>`;
  return parts
    .map((p, i) => `<stop offset="${(i / (parts.length - 1)) * 100}%" stop-color="${p.split(" ")[0]}"/>`)
    .join("");
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] ?? c);
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;");
}
