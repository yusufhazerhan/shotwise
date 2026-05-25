import { describe, expect, it } from "vitest";
import { getExportPlan } from "./export-cost";

describe("getExportPlan", () => {
  it("charges one credit per final PNG", () => {
    expect(getExportPlan({ screenCount: 10, languages: ["en", "tr", "de"] })).toEqual({
      screenCount: 10,
      languageCount: 3,
      deviceCount: 1,
      finalImageCount: 30,
      featureGraphicCount: 0,
      credits: 30,
    });
  });

  it("keeps at least one language in the cost model", () => {
    expect(getExportPlan({ screenCount: 4, languages: [] })).toEqual({
      screenCount: 4,
      languageCount: 1,
      deviceCount: 1,
      finalImageCount: 4,
      featureGraphicCount: 0,
      credits: 4,
    });
  });

  it("clamps invalid screen counts to zero", () => {
    expect(getExportPlan({ screenCount: -3, languages: ["en"] }).credits).toBe(0);
  });

  it("includes device and feature graphic variants", () => {
    expect(
      getExportPlan({
        screenCount: 2,
        languages: ["en", "tr", "de"],
        devicePresetIds: ["iphone69", "android"],
        includeFeatureGraphic: true,
      })
    ).toEqual({
      screenCount: 2,
      languageCount: 3,
      deviceCount: 2,
      finalImageCount: 15,
      featureGraphicCount: 3,
      credits: 15,
    });
  });
});
