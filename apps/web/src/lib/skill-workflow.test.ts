import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { createLocalExportZip, getLocalExportName } from "./local-export";
import { createLocalProject } from "./local-studio-store";

function zipText(blob: Blob) {
  return blob.arrayBuffer().then((buffer) => new TextDecoder().decode(buffer));
}

describe("Shotwise SKILL.md workflow", () => {
  it("documents the local Studio contract agents should follow", () => {
    const skill = readFileSync(resolve(process.cwd(), "../../SKILL.md"), "utf8");

    expect(skill).toContain("http://localhost:3000/studio");
    expect(skill).toContain("project.localized[locale]");
    expect(skill).toContain("project.exportConfig.locales");
    expect(skill).toContain("project.exportConfig.deviceConfigs[presetId]");
    expect(skill).toContain("STYLE_THEMES");
    expect(skill).toContain("<project>/<template>/<locale>/<device>/<screen-name>.png");
    expect(skill).toContain("two-screens-one-story");
  });

  it("can produce locale/device grouped ZIP output from a skill-authored project", async () => {
    const project = {
      ...createLocalProject("Petwises", "two-screens-one-story"),
      screenName: "home",
      localized: {
        en: {
          title: "Care smarter for every pet",
          subtitle: "Track routines, walks, lessons, and care notes in one calm place.",
          accent: "smarter",
        },
        tr: {
          title: "Her evcil dost için daha akıllı bakım",
          subtitle: "Rutinleri, yürüyüşleri, dersleri ve bakım notlarını tek yerde takip et.",
          accent: "akıllı",
        },
        de: {
          title: "Intelligentere Pflege für jedes Haustier",
          subtitle: "Routinen, Spaziergänge, Lektionen und Notizen an einem ruhigen Ort.",
          accent: "Intelligentere",
        },
      },
      exportConfig: {
        devicePresetIds: ["iphone69", "ipad13", "android", "pixel9"],
        locales: ["en", "tr", "de"],
        includeFeatureGraphic: false,
        styleThemeId: "fresh-mint",
        deviceConfigs: {
          ipad13: { frameStyle: "minimal", slotScale: 1.08, textScale: 0.92 },
          pixel9: { frameStyle: "bezel", slotScale: 0.96, textScale: 1 },
        },
      },
    };

    const files = project.exportConfig.locales.flatMap((locale) =>
      project.exportConfig.devicePresetIds.map((deviceId) => ({
        name: getLocalExportName(project, { screenIndex: 0, locale, deviceId }),
        blob: new Blob([`${locale}:${deviceId}`], { type: "image/png" }),
      }))
    );
    const zip = await createLocalExportZip(files);
    const body = await zipText(zip);

    expect(files).toHaveLength(12);
    expect(body).toContain("petwises/two-screens-one-story/en/iphone69/home.png");
    expect(body).toContain("petwises/two-screens-one-story/tr/ipad13/home.png");
    expect(body).toContain("petwises/two-screens-one-story/de/android/home.png");
    expect(body).toContain("petwises/two-screens-one-story/de/pixel9/home.png");
  });
});
