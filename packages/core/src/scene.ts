import sharp from "sharp";
import { escapeXml, wrapText } from "./wrap.js";
import type {
  SceneBackground,
  SceneCallout,
  SceneDeviceOptions,
  SceneRenderOptions,
  SceneScreenshotSlot,
  SceneTextBlock,
  ShadowIntensity,
  StoreScreenshotScene,
} from "./types.js";

export function createDefaultScene(input: {
  canvasPresetId?: string;
  title?: string;
  accent?: string;
  background?: SceneBackground;
  deviceKind?: "iphone" | "ipad" | "android";
} = {}): StoreScreenshotScene {
  const isTablet = input.deviceKind === "ipad";
  return {
    version: 1,
    canvasPresetId: input.canvasPresetId ?? "iphone69",
    background: input.background ?? { type: "solid", color: "#F4EFE5" },
    layoutPreset: "single",
    device: {
      enabled: true,
      kind: input.deviceKind ?? "iphone",
      frameStyle: "bezel",
      padding: isTablet ? 34 : 26,
      radius: isTablet ? 54 : 64,
      shadow: "strong",
      tilt: 0,
      hideStatusBar: false,
    },
    screenshot: {
      x: 0.5,
      y: 0.43,
      width: isTablet ? 0.72 : 0.54,
      scale: 1,
      rotation: 0,
      fit: "contain",
    },
    screenshots: [
      {
        id: "primary",
        x: 0.5,
        y: 0.43,
        width: isTablet ? 0.72 : 0.54,
        scale: 1,
        rotation: 0,
        fit: "contain",
      },
    ],
    textBlocks: [
      {
        id: "title",
        role: "title",
        text: input.title ?? "Your title here",
        accent: input.accent,
        x: 0.12,
        y: 0.08,
        width: 0.76,
        align: "center",
        fontFamily: "Fraunces, Georgia, serif",
        fontSize: 0.045,
        fontWeight: 800,
        lineHeight: 1.08,
        color: "#193D31",
        accentColor: "#DF7958",
      },
      {
        id: "subtitle",
        role: "subtitle",
        text: "",
        x: 0.18,
        y: 0.17,
        width: 0.64,
        align: "center",
        fontFamily: "Sora, system-ui, sans-serif",
        fontSize: 0.019,
        fontWeight: 500,
        lineHeight: 1.24,
        color: "#48645A",
        accentColor: "#DF7958",
      },
    ],
    callouts: [],
    advanced: {},
  };
}

export async function renderScene(opts: SceneRenderOptions): Promise<Buffer> {
  const { source, sources, scene, canvas, localeText } = opts;
  const slots = await Promise.all(
    normalizeSceneScreenshotSlots(scene).map(async (slot) => {
      const slotSource = slot.sourceId && sources?.[slot.sourceId] ? sources[slot.sourceId]! : source;
      const image = await sharp(slotSource).metadata();
      if (!image.width || !image.height) throw new Error("Could not read source image dimensions");
      const width = Math.max(1, Math.round(canvas.width * slot.width * slot.scale));
      const height = Math.max(1, Math.round(width * (image.height / image.width)));
      const imageBuffer = await sharp(slotSource).resize(width, height, { fit: slot.fit }).png().toBuffer();
      return {
        slot,
        imageHref: `data:image/png;base64,${imageBuffer.toString("base64")}`,
        imageSize: { width, height },
      };
    })
  );

  const first = slots[0]!;
  const svg = buildSceneSvg({
    scene,
    canvas,
    imageHref: first.imageHref,
    imageSize: first.imageSize,
    imageSlots: slots,
    localeText,
  });
  return sharp(Buffer.from(svg)).png().toBuffer();
}

export function buildSceneSvg(input: {
  scene: StoreScreenshotScene;
  canvas: { width: number; height: number };
  imageHref: string;
  imageSize: { width: number; height: number };
  imageSlots?: Array<{
    slot: SceneScreenshotSlot;
    imageHref: string;
    imageSize: { width: number; height: number };
  }>;
  localeText?: { title?: string; subtitle?: string; accent?: string };
}): string {
  const { scene, canvas, imageHref, imageSize, localeText } = input;
  const bg = backgroundSvg(scene.background);
  const texture = backgroundTexture(scene.background, canvas);
  const art = templateArt(scene, canvas);
  const text = layoutTextBlocks(scene.textBlocks, canvas, localeText)
    .map((block) => renderTextBlock(block, canvas, localeText))
    .join("\n");
  const calls = scene.callouts.map((callout) => renderCallout(callout, canvas)).join("\n");
  const imageLayers = (
    input.imageSlots ?? [
      {
        slot: { id: "primary", ...scene.screenshot },
        imageHref,
        imageSize,
      },
    ]
  )
    .map(({ slot, imageHref: href, imageSize: size }) => renderScreenshotSlot(scene, slot, canvas, href, size))
    .join("\n");

  return `<svg width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${bg.defs}
    ${texture.defs}
    ${art.defs}
    <filter id="sceneShadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="34" stdDeviation="28" flood-color="#10261F" flood-opacity="0.28"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="${bg.fill}"/>
  ${texture.overlay}
  ${art.overlay}
  ${text}
  ${imageLayers}
  ${calls}
</svg>`;
}

export function normalizeSceneScreenshotSlots(scene: StoreScreenshotScene): SceneScreenshotSlot[] {
  if (scene.screenshots?.length) {
    return scene.screenshots.map((slot, index) => ({
      id: slot.id || `slot-${index + 1}`,
      x: slot.x,
      y: slot.y,
      width: slot.width,
      scale: slot.scale,
      rotation: slot.rotation,
      fit: slot.fit,
      sourceId: slot.sourceId,
      device: slot.device,
      label: slot.label,
    }));
  }

  return [{ id: "primary", ...scene.screenshot }];
}

function renderScreenshotSlot(
  scene: StoreScreenshotScene,
  slot: SceneScreenshotSlot,
  canvas: { width: number; height: number },
  imageHref: string,
  imageSize: { width: number; height: number }
) {
  const device = { ...scene.device, ...(slot.device ?? {}) };
  const shotX = Math.round(canvas.width * slot.x - imageSize.width / 2);
  const shotY = Math.round(canvas.height * slot.y - imageSize.height / 2);
  const centerX = shotX + imageSize.width / 2;
  const centerY = shotY + imageSize.height / 2;
  const rotation = slot.rotation + device.tilt;
  const clipId = `clip_${Math.abs(hash(`${slot.id}:${shotX}:${shotY}:${imageSize.width}:${imageSize.height}`))}`;
  const radius = Math.max(0, device.enabled ? device.radius - device.padding * 0.45 : device.radius);
  const statusCover = device.hideStatusBar
    ? `<rect x="${shotX}" y="${shotY}" width="${imageSize.width}" height="${Math.max(16, imageSize.height * 0.045)}" fill="#fff" opacity="0.96"/>`
    : "";
  const deviceSvg = renderDevice(device, {
    x: shotX,
    y: shotY,
    width: imageSize.width,
    height: imageSize.height,
    rotation,
    centerX,
    centerY,
  });
  const label = slot.label
    ? `<text x="${shotX}" y="${shotY - 34}" font-family="Sora, system-ui, sans-serif" font-size="30" font-weight="800" fill="#193D31">${escapeXml(slot.label)}</text>`
    : "";

  return `<clipPath id="${clipId}"><rect x="${shotX}" y="${shotY}" width="${imageSize.width}" height="${imageSize.height}" rx="${radius}" ry="${radius}"/></clipPath>
  <g transform="rotate(${rotation} ${centerX} ${centerY})">
    ${deviceSvg}
    <image href="${imageHref}" x="${shotX}" y="${shotY}" width="${imageSize.width}" height="${imageSize.height}" preserveAspectRatio="${slot.fit === "cover" ? "xMidYMid slice" : "xMidYMid meet"}" clip-path="url(#${clipId})"/>
    ${statusCover}
    ${label}
  </g>`;
}

function backgroundSvg(bg: SceneBackground): { defs: string; fill: string } {
  if (bg.type === "linear") {
    const id = "sceneBg";
    const angle = Number.isFinite(bg.angle) ? bg.angle : 135;
    const rad = ((angle - 90) * Math.PI) / 180;
    const x = Math.cos(rad);
    const y = Math.sin(rad);
    return {
      defs: `<linearGradient id="${id}" x1="${0.5 - x / 2}" y1="${0.5 - y / 2}" x2="${0.5 + x / 2}" y2="${0.5 + y / 2}">
        <stop offset="0%" stop-color="${escapeXml(bg.from)}"/>
        <stop offset="${bg.midpoint ?? 100}%" stop-color="${escapeXml(bg.to)}"/>
      </linearGradient>`,
      fill: `url(#${id})`,
    };
  }
  return { defs: "", fill: escapeXml(bg.color) };
}

function backgroundTexture(bg: SceneBackground, canvas: { width: number; height: number }): { defs: string; overlay: string } {
  const dot = bg.type === "solid" && bg.color.toLowerCase() === "#f4efe5" ? "#dccfbd" : "rgba(255,255,255,0.18)";
  const step = Math.round(Math.min(canvas.width, canvas.height) * 0.035);
  return {
    defs: `<pattern id="dots" width="${step}" height="${step}" patternUnits="userSpaceOnUse">
    <circle cx="2" cy="2" r="1.4" fill="${dot}" opacity="0.45"/>
  </pattern>`,
    overlay: `<rect width="100%" height="100%" fill="url(#dots)" opacity="0.55"/>`,
  };
}

function templateArt(scene: StoreScreenshotScene, canvas: { width: number; height: number }): { defs: string; overlay: string } {
  const art = typeof scene.advanced?.customJson?.templateArt === "string" ? scene.advanced.customJson.templateArt : "";
  const w = canvas.width;
  const h = canvas.height;
  const defs = `<filter id="artBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${Math.round(w * 0.018)}"/></filter>`;
  const blob = (x: number, y: number, width: number, height: number, fill: string, opacity = 1, rotate = 0, rx = 80) =>
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="${fill}" opacity="${opacity}" transform="rotate(${rotate} ${x + width / 2} ${y + height / 2})"/>`;
  const circle = (cx: number, cy: number, r: number, fill: string, opacity = 1) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${opacity}"/>`;

  switch (art) {
    case "bold-ribbon":
      return {
        defs,
        overlay: `<g>
          ${blob(w * 0.5, h * 0.08, w * 0.58, h * 0.84, "#FFF4EA", 0.24, -12, 120)}
          ${blob(w * 0.58, h * 0.12, w * 0.38, h * 0.78, "#F7C4A8", 0.28, -12, 96)}
          ${circle(w * 0.18, h * 0.82, w * 0.18, "#FFFFFF", 0.12)}
        </g>`,
      };
    case "connected-diptych":
      return {
        defs,
        overlay: `<g>
          ${blob(w * 0.13, h * 0.34, w * 0.76, h * 0.42, "#FFFFFF", 0.28, -7, 130)}
          ${blob(w * 0.22, h * 0.43, w * 0.58, h * 0.28, "#BBD9E1", 0.24, -7, 110)}
          ${blob(w * 0.1, h * 0.72, w * 0.8, h * 0.11, "#193D31", 0.08, -7, 80)}
        </g>`,
      };
    case "comparison-split":
      return {
        defs,
        overlay: `<g>
          <rect x="${w * 0.06}" y="${h * 0.34}" width="${w * 0.42}" height="${h * 0.52}" rx="${w * 0.045}" fill="#FFFFFF" opacity="0.56"/>
          <rect x="${w * 0.52}" y="${h * 0.34}" width="${w * 0.42}" height="${h * 0.52}" rx="${w * 0.045}" fill="#FFFFFF" opacity="0.72"/>
          <path d="M ${w * 0.5} ${h * 0.37} C ${w * 0.46} ${h * 0.48}, ${w * 0.55} ${h * 0.62}, ${w * 0.5} ${h * 0.84}" fill="none" stroke="#D9B8A4" stroke-width="${Math.max(6, w * 0.012)}" stroke-linecap="round" opacity="0.45"/>
        </g>`,
      };
    case "feature-burst":
      return {
        defs,
        overlay: `<g>
          ${circle(w * 0.5, h * 0.55, w * 0.34, "#FFFFFF", 0.28)}
          ${circle(w * 0.72, h * 0.28, w * 0.11, "#193D31", 0.1)}
          ${circle(w * 0.24, h * 0.72, w * 0.16, "#DF7958", 0.16)}
        </g>`,
      };
    case "proof-cards":
      return {
        defs,
        overlay: `<g>
          ${blob(w * 0.08, h * 0.34, w * 0.3, h * 0.12, "#FFFFFF", 0.58, -5, 42)}
          ${blob(w * 0.62, h * 0.68, w * 0.3, h * 0.12, "#FFFFFF", 0.5, 5, 42)}
          ${blob(w * 0.12, h * 0.78, w * 0.22, h * 0.08, "#193D31", 0.08, -5, 34)}
        </g>`,
      };
    case "premium-orbit":
      return {
        defs,
        overlay: `<g>
          ${circle(w * 0.5, h * 0.53, w * 0.34, "#FFFFFF", 0.08)}
          <ellipse cx="${w * 0.5}" cy="${h * 0.54}" rx="${w * 0.36}" ry="${h * 0.18}" fill="none" stroke="#EAA07F" stroke-width="${Math.max(3, w * 0.006)}" opacity="0.22" transform="rotate(-12 ${w * 0.5} ${h * 0.54})"/>
          ${circle(w * 0.76, h * 0.35, w * 0.055, "#EAA07F", 0.24)}
        </g>`,
      };
    case "playful-flow":
      return {
        defs,
        overlay: `<g>
          ${blob(w * 0.12, h * 0.38, w * 0.76, h * 0.36, "#FFFFFF", 0.32, -8, 120)}
          <path d="M ${w * 0.24} ${h * 0.69} C ${w * 0.38} ${h * 0.58}, ${w * 0.58} ${h * 0.72}, ${w * 0.76} ${h * 0.53}" fill="none" stroke="#193D31" stroke-width="${Math.max(5, w * 0.01)}" stroke-linecap="round" opacity="0.16"/>
        </g>`,
      };
    case "minimal-grid":
      return {
        defs,
        overlay: `<g opacity="0.34">
          <path d="M ${w * 0.12} ${h * 0.34} H ${w * 0.88} M ${w * 0.12} ${h * 0.66} H ${w * 0.88} M ${w * 0.24} ${h * 0.27} V ${h * 0.86} M ${w * 0.76} ${h * 0.27} V ${h * 0.86}" stroke="#D9D3C8" stroke-width="2"/>
        </g>`,
      };
    case "soft-platform":
    default:
      return {
        defs,
        overlay: art
          ? `<g>
            ${circle(w * 0.5, h * 0.58, w * 0.34, "#FFFFFF", 0.26)}
            ${blob(w * 0.24, h * 0.77, w * 0.52, h * 0.09, "#193D31", 0.08, 0, 80)}
          </g>`
          : "",
      };
  }
}

function renderTextBlock(block: SceneTextBlock, canvas: { width: number; height: number }, localeText?: { title?: string; subtitle?: string; accent?: string }) {
  const raw = getTextBlockContent(block, localeText);
  if (!raw.trim()) return "";

  const x = Math.round(canvas.width * block.x);
  const y = Math.round(canvas.height * block.y);
  const width = Math.round(canvas.width * block.width);
  const fontSize = toPixels(block.fontSize, canvas.height);
  const lineHeight = Math.round(fontSize * block.lineHeight);
  const maxChars = Math.max(8, Math.round(width / (fontSize * 0.52)));
  const anchor = block.align === "center" ? "middle" : block.align === "right" ? "end" : "start";
  const tx = block.align === "center" ? x + width / 2 : block.align === "right" ? x + width : x;
  const accent = block.role === "title" ? localeText?.accent ?? block.accent : block.accent;

  return wrapText(raw, maxChars)
    .map((line, index) => {
      const wordGap = textWordGap(block, fontSize);
      const letterGap = textLetterGap(block, fontSize);
      const content = renderTextLine(line, accent, block.accentColor, wordGap, letterGap);
      const spacing = textSpacingAttributes(block, fontSize);
      return `<text x="${tx}" y="${y + index * lineHeight}" text-anchor="${anchor}" dominant-baseline="hanging"
        font-family="${escapeXml(block.fontFamily)}" font-size="${fontSize}" font-weight="${block.fontWeight}"
        fill="${escapeXml(block.color)}" ${spacing}>${content}</text>`;
    })
    .join("\n");
}

function layoutTextBlocks(
  blocks: SceneTextBlock[],
  canvas: { width: number; height: number },
  localeText?: { title?: string; subtitle?: string; accent?: string }
): SceneTextBlock[] {
  let occupiedBottom = 0;
  return blocks.map((block) => {
    const raw = getTextBlockContent(block, localeText);
    if (!raw.trim()) return block;
    const fontSize = toPixels(block.fontSize, canvas.height);
    const lineHeight = Math.round(fontSize * block.lineHeight);
    const width = Math.round(canvas.width * block.width);
    const maxChars = Math.max(8, Math.round(width / (fontSize * 0.52)));
    const lineCount = Math.max(1, wrapText(raw, maxChars).length);
    const desiredTop = Math.round(canvas.height * block.y);
    const margin = Math.round(fontSize * 0.55);
    const nextTop = occupiedBottom > 0 ? Math.max(desiredTop, occupiedBottom + margin) : desiredTop;
    occupiedBottom = nextTop + lineCount * lineHeight;
    return { ...block, y: nextTop / canvas.height };
  });
}

function getTextBlockContent(block: SceneTextBlock, localeText?: { title?: string; subtitle?: string; accent?: string }) {
  if (block.role === "title" && localeText?.title) return localeText.title;
  if (block.role === "subtitle" && localeText?.subtitle) return localeText.subtitle;
  return block.text;
}

function textSpacingAttributes(block: SceneTextBlock, fontSize: number) {
  const wordSpacing = Math.round(fontSize * textWordSpacing(block) * 0.38);
  const letterSpacing = Math.round(fontSize * textLetterSpacing(block) * 0.45);
  return `xml:space="preserve" word-spacing="${Math.max(2, wordSpacing)}" letter-spacing="${Math.max(0, letterSpacing)}"`;
}

function textWordGap(block: SceneTextBlock, fontSize: number) {
  return Math.max(4, Math.round(fontSize * textWordSpacing(block)));
}

function textLetterGap(block: SceneTextBlock, fontSize: number) {
  return Math.max(0, Math.round(fontSize * textLetterSpacing(block)));
}

function textWordSpacing(block: SceneTextBlock) {
  return block.wordSpacing ?? (block.role === "title" ? 0.42 : 0.28);
}

function textLetterSpacing(block: SceneTextBlock) {
  return block.letterSpacing ?? (block.role === "title" ? 0.04 : 0.006);
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

function normalizeWord(word: string) {
  return word.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

function renderDevice(
  device: SceneDeviceOptions,
  box: { x: number; y: number; width: number; height: number; rotation: number; centerX: number; centerY: number }
) {
  if (!device.enabled || device.frameStyle === "none") return "";
  const pad = device.padding;
  const x = box.x - pad;
  const y = box.y - pad;
  const w = box.width + pad * 2;
  const h = box.height + pad * 2;
  const rx = device.radius;
  const shadow = shadowFilter(device.shadow);
  const isLight = device.frameStyle === "glass" || device.frameStyle === "minimal";
  const frameFill = isLight ? "rgba(255,255,255,0.72)" : "#090D0C";
  const outerStroke = isLight ? "rgba(15,20,18,0.18)" : "rgba(255,255,255,0.16)";
  const innerStroke = isLight ? "rgba(15,20,18,0.12)" : "rgba(255,255,255,0.2)";
  const strokeWidth = Math.max(3, pad * 0.16);
  const buttonFill = isLight ? "rgba(15,20,18,0.28)" : "#171D1A";
  const sideButtons = device.kind === "iphone"
    ? `<rect x="${x - strokeWidth * 0.9}" y="${y + h * 0.2}" width="${strokeWidth * 0.9}" height="${h * 0.09}" rx="${strokeWidth}" fill="${buttonFill}"/>
      <rect x="${x - strokeWidth * 0.9}" y="${y + h * 0.34}" width="${strokeWidth * 0.9}" height="${h * 0.13}" rx="${strokeWidth}" fill="${buttonFill}"/>
      <rect x="${x + w}" y="${y + h * 0.32}" width="${strokeWidth * 0.9}" height="${h * 0.12}" rx="${strokeWidth}" fill="${buttonFill}"/>`
    : device.kind === "android"
      ? `<rect x="${x + w}" y="${y + h * 0.24}" width="${strokeWidth * 0.8}" height="${h * 0.16}" rx="${strokeWidth}" fill="${buttonFill}"/>`
      : "";
  const islandW = Math.max(82, w * 0.24);
  const islandH = Math.max(28, pad * 0.82);
  const signature = device.kind === "iphone"
    ? `<rect x="${box.centerX - islandW / 2}" y="${y + pad * 0.62}" width="${islandW}" height="${islandH}" rx="${islandH / 2}" fill="#050706" opacity="0.98"/>
      <circle cx="${box.centerX + islandW * 0.27}" cy="${y + pad * 0.62 + islandH / 2}" r="${Math.max(4, islandH * 0.18)}" fill="#121716" opacity="0.9"/>`
    : device.kind === "ipad"
      ? `<circle cx="${box.centerX}" cy="${y + pad * 0.78}" r="${Math.max(5, pad * 0.14)}" fill="#111816" opacity="0.86"/>`
      : device.kind === "android"
        ? `<circle cx="${box.centerX}" cy="${y + pad * 0.82}" r="${Math.max(7, pad * 0.2)}" fill="#080B0A" opacity="0.9"/>`
        : "";

  return `${sideButtons}
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${frameFill}" stroke="${outerStroke}" stroke-width="${strokeWidth}" ${shadow}/>
    <rect x="${x + pad * 0.48}" y="${y + pad * 0.48}" width="${w - pad * 0.96}" height="${h - pad * 0.96}" rx="${Math.max(0, rx - pad * 0.5)}" fill="none" stroke="${innerStroke}" stroke-width="${Math.max(2, pad * 0.08)}"/>
    ${signature}`;
}

function renderCallout(callout: SceneCallout, canvas: { width: number; height: number }) {
  const x = Math.round(callout.x * canvas.width);
  const y = Math.round(callout.y * canvas.height);
  const width = Math.round(callout.width * canvas.width);
  const height = Math.round(callout.height * canvas.height);
  return `<g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="28" fill="none" stroke="${escapeXml(callout.color)}" stroke-width="8" stroke-dasharray="18 14"/>
    ${callout.label ? `<text x="${x + 24}" y="${y - 20}" font-family="Sora, system-ui, sans-serif" font-size="32" font-weight="700" fill="${escapeXml(callout.color)}">${escapeXml(callout.label)}</text>` : ""}
  </g>`;
}

function shadowFilter(shadow: ShadowIntensity) {
  if (shadow === "none") return "";
  return shadow === "strong" ? 'filter="url(#sceneShadow)"' : 'filter="url(#sceneShadow)" opacity="0.92"';
}

function toPixels(value: number, basis: number) {
  return value < 1 ? Math.round(value * basis) : Math.round(value);
}

function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (Math.imul(31, h) + value.charCodeAt(i)) | 0;
  return h;
}
