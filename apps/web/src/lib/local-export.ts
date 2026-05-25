import type { StoreScreenshotScene } from "@shotwise/types";
import { STORE_PRESETS, type StorePresetId } from "./editor-scene";
import type { LocalProject, LocalScreenshot } from "./local-studio-store";

export type LocalRenderInput = {
  project: LocalProject;
  scene: StoreScreenshotScene;
  presetId: StorePresetId;
  locale?: string;
};

export function getLocalExportName(project: Pick<LocalProject, "name" | "templateId"> & Partial<Pick<LocalProject, "screenName">>, args: {
  screenIndex: number;
  locale: string;
  deviceId: string;
  folderMode?: "locale" | "device" | "flat";
  ext?: "png" | "json";
}) {
  const projectSlug = slug(project.name || "shotwise");
  const screenSlug = slug(project.screenName || `screen-${String(args.screenIndex + 1).padStart(2, "0")}`);
  const fileName = `${screenSlug}.${args.ext ?? "png"}`;
  if (args.folderMode === "flat") {
    return `${projectSlug}/${project.templateId}/${screenSlug}-${args.locale}-${args.deviceId}.${args.ext ?? "png"}`;
  }
  if (args.folderMode === "device") {
    return `${projectSlug}/${project.templateId}/${args.deviceId}/${args.locale}/${fileName}`;
  }
  return `${projectSlug}/${project.templateId}/${args.locale}/${args.deviceId}/${fileName}`;
}

export async function renderLocalSceneToBlob(input: LocalRenderInput): Promise<Blob> {
  const preset = STORE_PRESETS[input.presetId];
  const svg = await buildLocalSceneSvg({
    project: input.project,
    scene: { ...input.scene, canvasPresetId: input.presetId },
    canvas: { width: preset.width, height: preset.height },
    locale: input.locale ?? "en",
  });
  return svgToPngBlob(svg, preset.width, preset.height);
}

export async function buildLocalSceneSvg(input: {
  project: LocalProject;
  scene: StoreScreenshotScene;
  canvas: { width: number; height: number };
  locale: string;
}) {
  const { project, scene, canvas, locale } = input;
  const bg = scene.background.type === "linear"
    ? `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${escapeXml(scene.background.from)}"/><stop offset="100%" stop-color="${escapeXml(scene.background.to)}"/></linearGradient>`
    : "";
  const fill = scene.background.type === "linear" ? "url(#bg)" : escapeXml(scene.background.color);
  const art = templateArt(scene, canvas);
  const localized = project.localized[locale] ?? project.localized.en ?? {};
  const text = layoutLocalTextBlocks(scene.textBlocks, canvas, localized).map((block) => {
    const content = block.role === "title" ? localized.title ?? block.text : block.role === "subtitle" ? localized.subtitle ?? block.text : block.text;
    if (!content.trim()) return "";
    const x = canvas.width * block.x;
    const y = canvas.height * block.y;
    const width = canvas.width * block.width;
    const fontSize = block.fontSize < 1 ? block.fontSize * canvas.height : block.fontSize;
    const anchor = block.align === "center" ? "middle" : block.align === "right" ? "end" : "start";
    const tx = block.align === "center" ? x + width / 2 : block.align === "right" ? x + width : x;
    const lines = wrap(content, Math.max(10, Math.round(width / (fontSize * 0.52))));
    return lines.map((line, index) => {
      const accent = block.role === "title" ? localized.accent ?? block.accent : block.accent;
      const spacing = textSpacingAttributes(block, fontSize);
      const wordGap = textWordGap(block, fontSize);
      const letterGap = textLetterGap(block, fontSize);
      return `<text x="${tx}" y="${y + index * fontSize * block.lineHeight}" text-anchor="${anchor}" dominant-baseline="hanging" font-family="${escapeXml(block.fontFamily)}" font-size="${fontSize}" font-weight="${block.fontWeight}" fill="${escapeXml(block.color)}" ${spacing}>${renderTextLine(line, accent, block.accentColor, wordGap, letterGap)}</text>`;
    }).join("\n");
  }).join("\n");

  const slots = scene.screenshots?.length ? scene.screenshots : [{ id: "primary", ...scene.screenshot }];
  const shotLayers = await Promise.all(slots.map(async (slot, index) => {
    const shot = resolveShot(project.screenshots, slot.sourceId, index);
    if (!shot) return placeholderSlot(scene, slot, canvas);
    const href = await blobToDataUrl(shot.blob);
    const width = canvas.width * slot.width * slot.scale;
    const height = width * (shot.height / shot.width);
    const x = canvas.width * slot.x - width / 2;
    const y = canvas.height * slot.y - height / 2;
    const device = { ...scene.device, ...(slot.device ?? {}) };
    const pad = device.enabled ? device.padding : 0;
    const frameX = x - pad;
    const frameY = y - pad;
    const frameW = width + pad * 2;
    const frameH = height + pad * 2;
    const rotation = slot.rotation + device.tilt;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const clip = `local_clip_${index}`;
    const frame = renderLocalDeviceFrame(device, {
      x,
      y,
      width,
      height,
      frameX,
      frameY,
      frameW,
      frameH,
      centerX,
    });
    const label = slot.label ? `<text x="${x}" y="${y - 26}" font-family="Sora, system-ui, sans-serif" font-size="24" font-weight="800" fill="${scene.textBlocks[0]?.color ?? "#193D31"}">${escapeXml(slot.label)}</text>` : "";

    return `<g transform="rotate(${rotation} ${centerX} ${centerY})">
      ${frame}
      <clipPath id="${clip}"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${Math.max(0, device.radius - pad * 0.45)}"/></clipPath>
      <image href="${href}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="${slot.fit === "cover" ? "xMidYMid slice" : "xMidYMid meet"}" clip-path="url(#${clip})"/>
      ${label}
    </g>`;
  }));

  return `<svg width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      ${bg}
      ${art.defs}
      <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="34" stdDeviation="28" flood-color="#10261F" flood-opacity="0.24"/></filter>
    </defs>
    <rect width="100%" height="100%" fill="${fill}"/>
    ${art.overlay}
    ${text}
    ${shotLayers.join("\n")}
  </svg>`;
}

function renderLocalDeviceFrame(
  device: StoreScreenshotScene["device"],
  box: { x: number; y: number; width: number; height: number; frameX: number; frameY: number; frameW: number; frameH: number; centerX: number }
) {
  if (!device.enabled || device.frameStyle === "none") return "";
  const pad = device.padding;
  const strokeWidth = Math.max(3, pad * 0.16);
  const isLight = device.frameStyle === "glass" || device.frameStyle === "minimal";
  const frameFill = isLight ? "rgba(255,255,255,0.72)" : "#090D0C";
  const outerStroke = isLight ? "rgba(15,20,18,0.18)" : "rgba(255,255,255,0.16)";
  const innerStroke = isLight ? "rgba(15,20,18,0.12)" : "rgba(255,255,255,0.2)";
  const buttonFill = isLight ? "rgba(15,20,18,0.28)" : "#171D1A";
  const shadow = device.shadow === "none" ? "" : `filter="url(#shadow)"`;
  const sideButtons = device.kind === "iphone"
    ? `<rect x="${box.frameX - strokeWidth * 0.9}" y="${box.frameY + box.frameH * 0.2}" width="${strokeWidth * 0.9}" height="${box.frameH * 0.09}" rx="${strokeWidth}" fill="${buttonFill}"/>
      <rect x="${box.frameX - strokeWidth * 0.9}" y="${box.frameY + box.frameH * 0.34}" width="${strokeWidth * 0.9}" height="${box.frameH * 0.13}" rx="${strokeWidth}" fill="${buttonFill}"/>
      <rect x="${box.frameX + box.frameW}" y="${box.frameY + box.frameH * 0.32}" width="${strokeWidth * 0.9}" height="${box.frameH * 0.12}" rx="${strokeWidth}" fill="${buttonFill}"/>`
    : device.kind === "android"
      ? `<rect x="${box.frameX + box.frameW}" y="${box.frameY + box.frameH * 0.24}" width="${strokeWidth * 0.8}" height="${box.frameH * 0.16}" rx="${strokeWidth}" fill="${buttonFill}"/>`
      : "";
  const islandW = Math.max(82, box.frameW * 0.24);
  const islandH = Math.max(28, pad * 0.82);
  const signature = device.kind === "iphone"
    ? `<rect x="${box.centerX - islandW / 2}" y="${box.frameY + pad * 0.62}" width="${islandW}" height="${islandH}" rx="${islandH / 2}" fill="#050706" opacity="0.98"/>
      <circle cx="${box.centerX + islandW * 0.27}" cy="${box.frameY + pad * 0.62 + islandH / 2}" r="${Math.max(4, islandH * 0.18)}" fill="#121716" opacity="0.9"/>`
    : device.kind === "ipad"
      ? `<circle cx="${box.centerX}" cy="${box.frameY + pad * 0.78}" r="${Math.max(5, pad * 0.14)}" fill="#111816" opacity="0.86"/>`
      : device.kind === "android"
        ? `<circle cx="${box.centerX}" cy="${box.frameY + pad * 0.82}" r="${Math.max(7, pad * 0.2)}" fill="#080B0A" opacity="0.9"/>`
        : "";
  return `${sideButtons}
    <rect x="${box.frameX}" y="${box.frameY}" width="${box.frameW}" height="${box.frameH}" rx="${device.radius}" fill="${frameFill}" stroke="${outerStroke}" stroke-width="${strokeWidth}" ${shadow}/>
    <rect x="${box.frameX + pad * 0.48}" y="${box.frameY + pad * 0.48}" width="${box.frameW - pad * 0.96}" height="${box.frameH - pad * 0.96}" rx="${Math.max(0, device.radius - pad * 0.5)}" fill="none" stroke="${innerStroke}" stroke-width="${Math.max(2, pad * 0.08)}"/>
    ${signature}`;
}

export async function createLocalExportZip(files: Array<{ name: string; blob: Blob }>): Promise<Blob> {
  const chunks: Array<Uint8Array> = [];
  const central: Array<Uint8Array> = [];
  let offset = 0;

  for (const file of files) {
    const data = new Uint8Array(await file.blob.arrayBuffer());
    const name = new TextEncoder().encode(file.name);
    const crc = crc32(data);
    const local = zipHeader(0x04034b50, name, data.length, crc);
    chunks.push(local, data);
    central.push(zipCentralHeader(name, data.length, crc, offset));
    offset += local.length + data.length;
  }

  const centralOffset = offset;
  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = zipEnd(files.length, centralSize, centralOffset);
  const blobParts = [...chunks, ...central, end].map((part) => {
    const copy = new Uint8Array(part.byteLength);
    copy.set(part);
    return copy.buffer;
  });
  return new Blob(blobParts, { type: "application/zip" });
}

function resolveShot(shots: LocalScreenshot[], sourceId: string | undefined, index: number) {
  if (sourceId) {
    const match = shots.find((shot) => shot.id === sourceId);
    if (match) return match;
  }
  return shots[index] ?? shots[0];
}

function placeholderSlot(scene: StoreScreenshotScene, slot: { x: number; y: number; width: number; scale: number }, canvas: { width: number; height: number }) {
  const width = canvas.width * slot.width * slot.scale;
  const height = width * 1.95;
  const x = canvas.width * slot.x - width / 2;
  const y = canvas.height * slot.y - height / 2;
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${scene.device.radius}" fill="rgba(255,255,255,0.46)" stroke="rgba(30,58,46,0.16)" stroke-width="3" stroke-dasharray="18 14"/><text x="${x + width / 2}" y="${y + height / 2}" text-anchor="middle" font-family="Sora, system-ui, sans-serif" font-size="24" font-weight="700" fill="#7A8A82">Add screenshot</text>`;
}

function templateArt(scene: StoreScreenshotScene, canvas: { width: number; height: number }) {
  const art = typeof scene.advanced?.customJson?.templateArt === "string" ? scene.advanced.customJson.templateArt : "";
  const w = canvas.width;
  const h = canvas.height;
  const defs = "";
  const blob = (x: number, y: number, width: number, height: number, fill: string, opacity = 1, rotate = 0, rx = 80) =>
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="${fill}" opacity="${opacity}" transform="rotate(${rotate} ${x + width / 2} ${y + height / 2})"/>`;
  const circle = (cx: number, cy: number, r: number, fill: string, opacity = 1) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${opacity}"/>`;

  switch (art) {
    case "bold-ribbon":
      return { defs, overlay: `<g>${blob(w * 0.5, h * 0.08, w * 0.58, h * 0.84, "#FFF4EA", 0.24, -12, 120)}${blob(w * 0.58, h * 0.12, w * 0.38, h * 0.78, "#F7C4A8", 0.28, -12, 96)}${circle(w * 0.18, h * 0.82, w * 0.18, "#FFFFFF", 0.12)}</g>` };
    case "connected-diptych":
      return { defs, overlay: `<g>${blob(w * 0.13, h * 0.34, w * 0.76, h * 0.42, "#FFFFFF", 0.28, -7, 130)}${blob(w * 0.22, h * 0.43, w * 0.58, h * 0.28, "#BBD9E1", 0.24, -7, 110)}${blob(w * 0.1, h * 0.72, w * 0.8, h * 0.11, "#193D31", 0.08, -7, 80)}</g>` };
    case "comparison-split":
      return { defs, overlay: `<g><rect x="${w * 0.06}" y="${h * 0.34}" width="${w * 0.42}" height="${h * 0.52}" rx="${w * 0.045}" fill="#FFFFFF" opacity="0.56"/><rect x="${w * 0.52}" y="${h * 0.34}" width="${w * 0.42}" height="${h * 0.52}" rx="${w * 0.045}" fill="#FFFFFF" opacity="0.72"/><path d="M ${w * 0.5} ${h * 0.37} C ${w * 0.46} ${h * 0.48}, ${w * 0.55} ${h * 0.62}, ${w * 0.5} ${h * 0.84}" fill="none" stroke="#D9B8A4" stroke-width="${Math.max(6, w * 0.012)}" stroke-linecap="round" opacity="0.45"/></g>` };
    case "feature-burst":
      return { defs, overlay: `<g>${circle(w * 0.5, h * 0.55, w * 0.34, "#FFFFFF", 0.28)}${circle(w * 0.72, h * 0.28, w * 0.11, "#193D31", 0.1)}${circle(w * 0.24, h * 0.72, w * 0.16, "#DF7958", 0.16)}</g>` };
    case "proof-cards":
      return { defs, overlay: `<g>${blob(w * 0.08, h * 0.34, w * 0.3, h * 0.12, "#FFFFFF", 0.58, -5, 42)}${blob(w * 0.62, h * 0.68, w * 0.3, h * 0.12, "#FFFFFF", 0.5, 5, 42)}${blob(w * 0.12, h * 0.78, w * 0.22, h * 0.08, "#193D31", 0.08, -5, 34)}</g>` };
    case "premium-orbit":
      return { defs, overlay: `<g>${circle(w * 0.5, h * 0.53, w * 0.34, "#FFFFFF", 0.08)}<ellipse cx="${w * 0.5}" cy="${h * 0.54}" rx="${w * 0.36}" ry="${h * 0.18}" fill="none" stroke="#EAA07F" stroke-width="${Math.max(3, w * 0.006)}" opacity="0.22" transform="rotate(-12 ${w * 0.5} ${h * 0.54})"/>${circle(w * 0.76, h * 0.35, w * 0.055, "#EAA07F", 0.24)}</g>` };
    case "playful-flow":
      return { defs, overlay: `<g>${blob(w * 0.12, h * 0.38, w * 0.76, h * 0.36, "#FFFFFF", 0.32, -8, 120)}<path d="M ${w * 0.24} ${h * 0.69} C ${w * 0.38} ${h * 0.58}, ${w * 0.58} ${h * 0.72}, ${w * 0.76} ${h * 0.53}" fill="none" stroke="#193D31" stroke-width="${Math.max(5, w * 0.01)}" stroke-linecap="round" opacity="0.16"/></g>` };
    case "minimal-grid":
      return { defs, overlay: `<g opacity="0.34"><path d="M ${w * 0.12} ${h * 0.34} H ${w * 0.88} M ${w * 0.12} ${h * 0.66} H ${w * 0.88} M ${w * 0.24} ${h * 0.27} V ${h * 0.86} M ${w * 0.76} ${h * 0.27} V ${h * 0.86}" stroke="#D9D3C8" stroke-width="2"/></g>` };
    case "soft-platform":
    default:
      return { defs, overlay: art ? `<g>${circle(w * 0.5, h * 0.58, w * 0.34, "#FFFFFF", 0.26)}${blob(w * 0.24, h * 0.77, w * 0.52, h * 0.09, "#193D31", 0.08, 0, 80)}</g>` : "" };
  }
}

function svgToPngBlob(svg: string, width: number, height: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas is unavailable"));
        return;
      }
      ctx.drawImage(image, 0, 0, width, height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (blob) resolve(blob);
        else reject(new Error("PNG export failed"));
      }, "image/png");
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("SVG render failed"));
    };
    image.src = url;
  });
}

function zipHeader(signature: number, name: Uint8Array, size: number, crc: number) {
  const out = new Uint8Array(30 + name.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, signature, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, 0, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, size, true);
  view.setUint32(22, size, true);
  view.setUint16(26, name.length, true);
  out.set(name, 30);
  return out;
}

function zipCentralHeader(name: Uint8Array, size: number, crc: number, offset: number) {
  const out = new Uint8Array(46 + name.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, size, true);
  view.setUint32(24, size, true);
  view.setUint16(28, name.length, true);
  view.setUint32(42, offset, true);
  out.set(name, 46);
  return out;
}

function zipEnd(count: number, centralSize: number, centralOffset: number) {
  const out = new Uint8Array(22);
  const view = new DataView(out.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(8, count, true);
  view.setUint16(10, count, true);
  view.setUint32(12, centralSize, true);
  view.setUint32(16, centralOffset, true);
  return out;
}

function crc32(data: Uint8Array) {
  let crc = -1;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ -1) >>> 0;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read image"));
    reader.readAsDataURL(blob);
  });
}

function wrap(text: string, maxChars: number) {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (candidate.length > maxChars && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function renderTextLine(line: string, accent: string | undefined, color: string, wordGap: number, letterGap: number) {
  const words = line.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  const accentWords = new Set((accent ?? "").toLowerCase().split(/\s+/).filter(Boolean).map(normalizeWord));
  return words
    .map((word, index) => {
      const fill = accentWords.has(normalizeWord(word)) ? ` fill="${escapeXml(color)}"` : "";
      return renderWord(word, index, fill, wordGap, letterGap);
    })
    .join("");
}

function renderWord(word: string, wordIndex: number, fill: string, wordGap: number, letterGap: number) {
  return Array.from(word)
    .map((char, charIndex) => {
      const dx = charIndex === 0 ? (wordIndex === 0 ? "" : ` dx="${wordGap}"`) : letterGap > 0 ? ` dx="${letterGap}"` : "";
      const text = charIndex === 0 && wordIndex > 0 ? ` ${char}` : char;
      return `<tspan${dx}${fill}>${escapeXml(text)}</tspan>`;
    })
    .join("");
}

function layoutLocalTextBlocks(
  blocks: StoreScreenshotScene["textBlocks"],
  canvas: { width: number; height: number },
  localized: { title?: string; subtitle?: string; accent?: string }
) {
  let occupiedBottom = 0;
  return blocks.map((block) => {
    const content = block.role === "title" ? localized.title ?? block.text : block.role === "subtitle" ? localized.subtitle ?? block.text : block.text;
    if (!content.trim()) return block;
    const width = canvas.width * block.width;
    const fontSize = block.fontSize < 1 ? block.fontSize * canvas.height : block.fontSize;
    const lineHeight = fontSize * block.lineHeight;
    const lines = wrap(content, Math.max(10, Math.round(width / (fontSize * 0.52))));
    const desiredTop = canvas.height * block.y;
    const margin = fontSize * 0.55;
    const nextTop = occupiedBottom > 0 ? Math.max(desiredTop, occupiedBottom + margin) : desiredTop;
    occupiedBottom = nextTop + Math.max(1, lines.length) * lineHeight;
    return { ...block, y: nextTop / canvas.height };
  });
}

function textSpacingAttributes(block: StoreScreenshotScene["textBlocks"][number], fontSize: number) {
  const wordSpacing = Math.round(fontSize * textWordSpacing(block) * 0.38);
  const letterSpacing = Math.round(fontSize * textLetterSpacing(block) * 0.45);
  return `xml:space="preserve" word-spacing="${Math.max(2, wordSpacing)}" letter-spacing="${Math.max(0, letterSpacing)}"`;
}

function textWordGap(block: StoreScreenshotScene["textBlocks"][number], fontSize: number) {
  return Math.max(4, Math.round(fontSize * textWordSpacing(block)));
}

function textLetterGap(block: StoreScreenshotScene["textBlocks"][number], fontSize: number) {
  return Math.max(0, Math.round(fontSize * textLetterSpacing(block)));
}

function textWordSpacing(block: StoreScreenshotScene["textBlocks"][number]) {
  return block.wordSpacing ?? (block.role === "title" ? 0.42 : 0.28);
}

function textLetterSpacing(block: StoreScreenshotScene["textBlocks"][number]) {
  return block.letterSpacing ?? (block.role === "title" ? 0.04 : 0.006);
}

function normalizeWord(word: string) {
  return word.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char] ?? char);
}

function slug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "shotwise";
}
