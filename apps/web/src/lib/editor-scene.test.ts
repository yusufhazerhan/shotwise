import { describe, expect, it } from "vitest";
import { getEditorConfig, getScene, localizedPatch, normalizePreset, normalizeScene, scenePatch } from "./editor-scene";
import { makeProject, makeScene, makeScreenshot } from "@/test/factories";

describe("editor scene helpers", () => {
  it("normalizes legacy presets", () => {
    expect(normalizePreset("ipad129")).toBe("ipadPro129");
    expect(normalizePreset("playPhone")).toBe("android");
    expect(normalizePreset("nope")).toBe("iphone69");
  });

  it("resolves editor config from project config", () => {
    const project = makeProject({
      config: {
        canvasPresetId: "iphone61",
        editor: { themeId: "dark", languages: ["en", "tr"], defaultFont: "Sora, system-ui, sans-serif" },
      },
    });
    expect(getEditorConfig(project)).toMatchObject({
      canvasPresetId: "iphone61",
      themeId: "dark",
      languages: ["en", "tr"],
      defaultFont: "Sora, system-ui, sans-serif",
    });
  });

  it("fills scene defaults with theme-aware colors", () => {
    const cfg = getEditorConfig(makeProject({ config: { editor: { themeId: "dark", canvasPresetId: "android" } } }));
    const scene = normalizeScene(undefined, cfg, { title: "Hello", subtitle: "World", accent: "Hello" });
    expect(scene.background.type).toBe("linear");
    expect(scene.device.kind).toBe("android");
    expect(scene.textBlocks[0]).toMatchObject({ text: "Hello", accent: "Hello", color: "#F6F0E7" });
  });

  it("uses screenshot overrides and localized text when deriving a scene", () => {
    const screenshot = makeScreenshot({
      localized: { en: { title: "Localized title", subtitle: "Localized subtitle", accent: "title" } },
      renderOverrides: { scene: { screenshot: { x: 0.2, y: 0.3, width: 0.4, scale: 1, rotation: 0, fit: "contain" } } },
    });
    const scene = getScene(screenshot, makeProject());
    expect(scene.screenshot.x).toBe(0.2);
    expect(scene.textBlocks[0]?.text).toBe("Localized title");
    expect(scene.textBlocks[1]?.text).toBe("Localized subtitle");
  });

  it("keeps legacy screenshot transforms available as the first slot", () => {
    const cfg = getEditorConfig(makeProject());
    const scene = normalizeScene(
      {
        screenshot: { x: 0.24, y: 0.58, width: 0.42, scale: 1, rotation: -3, fit: "contain" },
      },
      cfg,
      { title: "Legacy" }
    );

    expect(scene.screenshot.x).toBe(0.24);
    expect(scene.screenshots?.[0]).toMatchObject({ id: "primary", x: 0.24, y: 0.58, width: 0.42 });
  });

  it("produces stable patch payloads", () => {
    const scene = makeScene();
    expect(scenePatch(scene)).toEqual({ renderOverrides: { scene } });
    expect(localizedPatch(makeScreenshot(), "en", "New title", "Accent", "Subtitle")).toEqual({
      localized: {
        en: {
          title: "New title",
          accent: "Accent",
          subtitle: "Subtitle",
        },
      },
    });
  });
});
