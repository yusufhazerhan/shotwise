import { describe, expect, it } from "vitest";
import { createLocalProject, serializeLocalProject } from "./local-studio-store";

describe("local-studio-store", () => {
  it("creates a no-login local project from a real template", () => {
    const project = createLocalProject("Launch Kit", "two-screens-one-story");

    expect(project.id).toBeTruthy();
    expect(project.templateId).toBe("two-screens-one-story");
    expect(project.screenName).toBe("screen-01");
    expect(project.scene.screenshots).toHaveLength(2);
    expect(project.exportConfig.locales).toEqual(["en"]);
    expect(project.exportConfig.devicePresetIds).toContain("iphone69");
    expect(project.exportConfig.styleThemeId).toBe("cream-calm");
    expect(project.exportConfig.deviceConfigs).toEqual({});
  });

  it("exports project JSON without embedding screenshot blobs", () => {
    const blob = new Blob(["image"], { type: "image/png" });
    const json = serializeLocalProject({
      ...createLocalProject(),
      screenshots: [
        {
          id: "shot-1",
          name: "one.png",
          mimeType: "image/png",
          blob,
          width: 390,
          height: 844,
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });

    expect(json).toContain("one.png");
    expect(json).not.toContain("image]");
  });
});
