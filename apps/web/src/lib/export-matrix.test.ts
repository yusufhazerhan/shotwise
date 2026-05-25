import { describe, expect, it } from "vitest";
import { createExportMatrix, setAllForDevice, summarizeExportMatrix, toggleExportCell } from "./export-matrix";

describe("export-matrix", () => {
  it("creates a matrix with english locked and other locales enabled", () => {
    const matrix = createExportMatrix({
      devicePresetIds: ["iphone69"],
      screenIds: ["shot-1"],
      languages: ["en", "tr"],
    });

    expect(matrix.iphone69?.["shot-1"]).toEqual({
      en: "locked",
      tr: "on",
    });
  });

  it("toggles non-locked cells and keeps locked cells unchanged", () => {
    const matrix = createExportMatrix({
      devicePresetIds: ["iphone69"],
      screenIds: ["shot-1"],
      languages: ["en", "tr"],
    });

    const toggled = toggleExportCell(matrix, { deviceId: "iphone69", screenId: "shot-1", locale: "tr" });
    const ignored = toggleExportCell(toggled, { deviceId: "iphone69", screenId: "shot-1", locale: "en" });

    expect(toggled.iphone69?.["shot-1"]?.tr).toBe("off");
    expect(ignored.iphone69?.["shot-1"]?.en).toBe("locked");
  });

  it("summarizes totals per device", () => {
    const matrix = setAllForDevice(
      createExportMatrix({
        devicePresetIds: ["iphone69", "android"],
        screenIds: ["shot-1", "shot-2"],
        languages: ["en", "tr"],
      }),
      { deviceId: "android", value: "off" }
    );

    expect(summarizeExportMatrix(matrix)).toEqual({
      total: 6,
      perDevice: {
        iphone69: 4,
        android: 2,
      },
    });
  });
});
