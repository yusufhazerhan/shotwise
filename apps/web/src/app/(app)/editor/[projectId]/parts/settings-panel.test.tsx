import * as React from "react";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SettingsPanel } from "./settings-panel";
import { renderWithProviders } from "@/test/render";
import { makeProject, makeScene, makeScreenshot } from "@/test/factories";

describe("SettingsPanel", () => {
  it("updates the scene and project config when the output preset changes", () => {
    const onSceneChange = vi.fn();
    const onProjectConfig = vi.fn().mockResolvedValue(undefined);

    const { container } = renderWithProviders(
      <SettingsPanel
        project={makeProject()}
        screenshot={makeScreenshot()}
        scene={makeScene()}
        activeLayer="screenshot"
        previewLocale="en"
        availableLocales={["en", "tr"]}
        onPreviewLocale={() => {}}
        saveStatus="saved"
        onSceneChange={onSceneChange}
        onTextChange={() => {}}
        onProjectConfig={onProjectConfig}
      />
    );

    fireEvent.change(container.querySelector("select.select")!, {
      target: { value: "android" },
    });

    expect(onSceneChange).toHaveBeenCalledWith(
      expect.objectContaining({
        canvasPresetId: "android",
        device: expect.objectContaining({ kind: "android" }),
      })
    );
    expect(onProjectConfig).toHaveBeenCalledWith({
      config: expect.objectContaining({
        editor: expect.objectContaining({ canvasPresetId: "android" }),
      }),
    });
  });

  it("preserves en when export languages are changed", () => {
    const onProjectConfig = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <SettingsPanel
        project={makeProject({ config: { editor: { languages: ["en"] } } })}
        screenshot={makeScreenshot()}
        scene={makeScene()}
        activeLayer="screenshot"
        previewLocale="en"
        availableLocales={["en", "tr"]}
        onPreviewLocale={() => {}}
        saveStatus="saved"
        onSceneChange={() => {}}
        onTextChange={() => {}}
        onProjectConfig={onProjectConfig}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "export" }));
    fireEvent.click(screen.getByLabelText("TR"));

    expect(onProjectConfig).toHaveBeenCalledWith({
      config: expect.objectContaining({
        editor: expect.objectContaining({
          languages: expect.arrayContaining(["en", "tr"]),
        }),
      }),
    });
  });

  it("accepts valid advanced JSON and ignores invalid JSON", () => {
    const onSceneChange = vi.fn();

    const { container } = renderWithProviders(
      <SettingsPanel
        project={makeProject()}
        screenshot={makeScreenshot()}
        scene={makeScene()}
        activeLayer="screenshot"
        previewLocale="en"
        availableLocales={["en", "tr"]}
        onPreviewLocale={() => {}}
        saveStatus="saved"
        onSceneChange={onSceneChange}
        onTextChange={() => {}}
        onProjectConfig={vi.fn().mockResolvedValue(undefined)}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "advanced" }));
    const textarea = container.querySelector("textarea.textarea.code")!;
    fireEvent.change(textarea, {
      target: {
        value: JSON.stringify({ ...makeScene(), layoutPreset: "callout" }),
      },
    });
    fireEvent.change(textarea, {
      target: { value: "{ nope" },
    });

    expect(onSceneChange).toHaveBeenCalledTimes(1);
    expect(onSceneChange).toHaveBeenCalledWith(
      expect.objectContaining({ layoutPreset: "callout" })
    );
  });
});
