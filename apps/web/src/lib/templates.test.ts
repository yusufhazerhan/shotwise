import { describe, expect, it } from "vitest";
import { makeScene } from "@/test/factories";
import { applyStyleTheme, applyTemplate, filterTemplates, getTemplate, STYLE_THEMES, TEMPLATE_REGISTRY } from "./templates";

describe("templates", () => {
  it("keeps stable ids and includes the required first release families", () => {
    expect(TEMPLATE_REGISTRY.length).toBeGreaterThanOrEqual(20);
    expect(TEMPLATE_REGISTRY.map((template) => template.id)).toEqual(expect.arrayContaining([
      "classic-app-store",
      "bold-split",
      "before-after",
      "two-screens-one-story",
      "feature-zoom",
      "social-proof",
      "paywall-pricing",
      "onboarding-flow",
      "dark-premium",
      "minimal-utility",
      "android-showcase",
      "tablet-command",
      "glass-duo",
      "wellness-warm",
    ]));
  });

  it("filters templates by inspiration taxonomy", () => {
    expect(filterTemplates({ category: "comparison", slots: 2 }).map((template) => template.id)).toEqual(expect.arrayContaining(["before-after", "comparison-ribbon"]));
    expect(filterTemplates({ platform: "android" }).map((template) => template.id)).toContain("two-screens-one-story");
    expect(filterTemplates({ mood: "fresh" }).map((template) => template.id)).toContain("android-showcase");
  });

  it("applies a two-slot template without losing existing source references", () => {
    const scene = makeScene({
      screenshots: [
        { id: "slot-a", sourceId: "shot-a", x: 0.5, y: 0.5, width: 0.5, scale: 1, rotation: 0, fit: "contain" },
        { id: "slot-b", sourceId: "shot-b", x: 0.5, y: 0.5, width: 0.5, scale: 1, rotation: 0, fit: "contain" },
      ],
    });
    const next = applyTemplate(scene, "two-screens-one-story");

    expect(next.layoutPreset).toBe("sideBySide");
    expect(next.screenshots).toHaveLength(2);
    expect(next.screenshots?.map((slot) => slot.sourceId)).toEqual(["shot-a", "shot-b"]);
  });

  it("falls back to the first template for unknown ids", () => {
    expect(getTemplate("missing").id).toBe("classic-app-store");
  });

  it("applies style themes without changing screenshot slots", () => {
    expect(STYLE_THEMES.length).toBeGreaterThanOrEqual(8);
    const scene = makeScene({
      screenshots: [
        { id: "slot-a", sourceId: "shot-a", x: 0.5, y: 0.5, width: 0.5, scale: 1, rotation: 0, fit: "contain" },
      ],
    });

    const next = applyStyleTheme(scene, "fresh-mint");

    expect(next.background).toMatchObject({ type: "linear", from: "#F6FFF9", to: "#BFE8D3" });
    expect(next.screenshots?.[0]?.sourceId).toBe("shot-a");
  });
});
