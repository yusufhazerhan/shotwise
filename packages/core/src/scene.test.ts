import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { buildSceneSvg, createDefaultScene, normalizeSceneScreenshotSlots, renderScene } from "./scene.js";

async function sampleScreenshot() {
  return sharp({
    create: {
      width: 390,
      height: 844,
      channels: 4,
      background: "#ffffff",
    },
  })
    .png()
    .toBuffer();
}

describe("scene renderer", () => {
  it("renders a scene to the requested PNG size", async () => {
    const scene = createDefaultScene({ canvasPresetId: "iphone69", title: "Plan your day faster" });
    const output = await renderScene({
      source: await sampleScreenshot(),
      scene,
      canvas: { width: 1290, height: 2796 },
    });
    const metadata = await sharp(output).metadata();

    expect(metadata.width).toBe(1290);
    expect(metadata.height).toBe(2796);
  });

  it("builds gradient, wrapped text, device, and callout SVG layers", () => {
    const scene = createDefaultScene({
      title: "Capture everything your users need to trust your app",
      accent: "trust",
      background: { type: "linear", from: "#101820", to: "#f2aa4c", angle: 120 },
    });
    scene.callouts = [{ id: "callout-1", x: 0.2, y: 0.4, width: 0.36, height: 0.12, label: "New", color: "#df7958" }];

    const svg = buildSceneSvg({
      scene,
      canvas: { width: 1290, height: 2796 },
      imageHref: "data:image/png;base64,",
      imageSize: { width: 640, height: 1386 },
      localeText: { title: scene.textBlocks[0]!.text, accent: "trust" },
    });

    expect(svg).toContain("<linearGradient");
    expect(svg).toContain("<pattern");
    expect(svg).toContain("clipPath");
    expect(svg).toContain("stroke=\"#df7958\"");
    expect(svg).toContain("<tspan fill=\"#DF7958\">t</tspan>");
    expect(svg).toContain("<tspan dx=\"5\" fill=\"#DF7958\">r</tspan>");
  });

  it("pushes lower text blocks below wrapped title lines", () => {
    const scene = createDefaultScene({
      title: "Turn daily care into visible progress for every pet family",
      accent: "visible progress",
    });
    scene.textBlocks[0] = {
      ...scene.textBlocks[0]!,
      x: 0.08,
      y: 0.065,
      width: 0.84,
      fontSize: 0.032,
      lineHeight: 1.08,
    };
    scene.textBlocks[1] = {
      ...scene.textBlocks[1]!,
      text: "Share progress, log walks, and keep Buddy routine moving every day.",
      x: 0.16,
      y: 0.15,
      width: 0.68,
      fontSize: 0.017,
      lineHeight: 1.26,
    };

    const svg = buildSceneSvg({
      scene,
      canvas: { width: 1290, height: 2796 },
      imageHref: "data:image/png;base64,",
      imageSize: { width: 640, height: 1386 },
    });
    const yValues = Array.from(svg.matchAll(/<text[^>]* y="([0-9]+)"/g), (match) => Number(match[1]));
    const titleLineHeight = Math.round(0.032 * 2796 * 1.08);
    const titleLastY = yValues[2]!;
    const subtitleFirstY = yValues[3]!;

    expect(subtitleFirstY).toBeGreaterThan(titleLastY + titleLineHeight);
  });

  it("adds explicit word spacing for large store headline text", () => {
    const scene = createDefaultScene({
      title: "Progress and walks in one flow",
      accent: "one flow",
    });
    scene.textBlocks[0] = {
      ...scene.textBlocks[0]!,
      fontFamily: "Sora, system-ui, sans-serif",
      fontSize: 0.032,
      fontWeight: 900,
      letterSpacing: 0.09,
      wordSpacing: 0.62,
    };

    const svg = buildSceneSvg({
      scene,
      canvas: { width: 1290, height: 2796 },
      imageHref: "data:image/png;base64,",
      imageSize: { width: 640, height: 1386 },
    });
    const titleText = svg.match(/<text[^>]*>.*?<\/text>/s)?.[0] ?? "";

    expect(titleText).toContain('xml:space="preserve"');
    expect(titleText).toMatch(/letter-spacing="[3-4]"/);
    expect(titleText).toMatch(/word-spacing="2[0-9]"/);
    expect(titleText).toContain("<tspan>P</tspan>");
    expect(titleText).toMatch(/<tspan dx="[7-9]">r<\/tspan>/);
    expect(titleText).toMatch(/<tspan dx="5[0-9]"> a<\/tspan>/);
    expect(titleText).toMatch(/<tspan dx="[7-9]">n<\/tspan>/);
  });

  it("migrates legacy single-screenshot scenes into one render slot", () => {
    const scene = createDefaultScene();
    delete scene.screenshots;

    expect(normalizeSceneScreenshotSlots(scene)).toEqual([
      {
        id: "primary",
        x: scene.screenshot.x,
        y: scene.screenshot.y,
        width: scene.screenshot.width,
        scale: scene.screenshot.scale,
        rotation: scene.screenshot.rotation,
        fit: scene.screenshot.fit,
      },
    ]);
  });

  it("renders multiple screenshot slots with independent sources", async () => {
    const scene = createDefaultScene({ canvasPresetId: "iphone69", title: "Compare faster" });
    scene.screenshots = [
      { id: "before", sourceId: "before", x: 0.34, y: 0.54, width: 0.34, scale: 1, rotation: -4, fit: "contain", label: "Before" },
      { id: "after", sourceId: "after", x: 0.66, y: 0.54, width: 0.34, scale: 1, rotation: 4, fit: "contain", label: "After" },
    ];

    const output = await renderScene({
      source: await sampleScreenshot(),
      sources: {
        before: await sampleScreenshot(),
        after: await sampleScreenshot(),
      },
      scene,
      canvas: { width: 1290, height: 2796 },
    });
    const metadata = await sharp(output).metadata();

    expect(metadata.width).toBe(1290);
    expect(metadata.height).toBe(2796);
  });
});
