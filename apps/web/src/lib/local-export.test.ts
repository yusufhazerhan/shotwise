import { describe, expect, it } from "vitest";
import { buildLocalSceneSvg, getLocalExportName, createLocalExportZip } from "./local-export";
import { createLocalProject } from "./local-studio-store";

describe("local-export", () => {
  it("uses stable project/template/screen-locale-device names", () => {
    expect(
      getLocalExportName(
        { name: "My Great App", templateId: "two-screens-one-story", screenName: "Home Overview" },
        { screenIndex: 0, locale: "en", deviceId: "iphone69" }
      )
    ).toBe("my-great-app/two-screens-one-story/en/iphone69/home-overview.png");
  });

  it("creates a valid uncompressed zip blob", async () => {
    const zip = await createLocalExportZip([
      { name: "one.txt", blob: new Blob(["hello"], { type: "text/plain" }) },
      { name: "two.txt", blob: new Blob(["world"], { type: "text/plain" }) },
    ]);
    const bytes = new Uint8Array(await zip.arrayBuffer());

    expect(zip.type).toBe("application/zip");
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
    expect(new TextDecoder().decode(bytes)).toContain("one.txt");
    expect(new TextDecoder().decode(bytes)).toContain("two.txt");
  });

  it("adds explicit word spacing in browser-rendered headline text", async () => {
    const project = createLocalProject("Petwises", "two-screens-one-story");
    project.localized.en = {
      title: "Progress and walks in one flow",
      subtitle: "Share progress, log walks, and keep Buddy routine moving every day.",
      accent: "one flow",
    };
    project.scene.textBlocks[0] = {
      ...project.scene.textBlocks[0]!,
      fontFamily: "Sora, system-ui, sans-serif",
      fontSize: 0.032,
      fontWeight: 900,
      letterSpacing: 0.09,
      wordSpacing: 0.62,
    };

    const svg = await buildLocalSceneSvg({
      project,
      scene: project.scene,
      canvas: { width: 1290, height: 2796 },
      locale: "en",
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
});
