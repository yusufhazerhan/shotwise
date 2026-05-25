import { describe, expect, it } from "vitest";
import { applyStylePreset, filterStylePresets, getStylePreset } from "./style-presets";
import { makeScene } from "@/test/factories";

describe("style-presets", () => {
  it("applies preset colors and fonts to the scene", () => {
    const scene = makeScene();
    const next = applyStylePreset(scene, "dark-premium");

    expect(next.background).toMatchObject({ type: "linear", from: "#0B0F0D" });
    expect(next.layoutPreset).toBe("card");
    expect(next.device.frameStyle).toBe("glass");
    expect(next.textBlocks.find((block) => block.role === "title")).toMatchObject({
      fontFamily: "Space Grotesk, system-ui, sans-serif",
      color: "#F6F0E7",
      accentColor: "#DF7958",
    });
  });

  it("filters presets by mood, category, and tier", () => {
    const filtered = filterStylePresets({ mood: "calm", category: "wellness", tier: "pro" });
    expect(filtered.map((preset) => preset.id)).toEqual(["wellness-warm"]);
  });

  it("falls back to the first preset when an unknown id is requested", () => {
    expect(getStylePreset("nope").id).toBe("cream-calm");
  });
});
