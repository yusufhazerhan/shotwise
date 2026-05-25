import * as React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import { makeProject, makeScreenshot } from "@/test/factories";
import { installFetchMock } from "@/test/setup";
import { StyleGalleryView } from "./style-gallery-view";

describe("StyleGalleryView", () => {
  it("filters presets and applies the selected style to the project and screens", async () => {
    const project = makeProject({
      config: {
        editor: {
          canvasPresetId: "iphone69",
          languages: ["en"],
          selectedDevicePresetIds: ["iphone69"],
          includeFeatureGraphic: false,
          stylePresetId: "cream-calm",
          themeId: "cream",
          layoutPreset: "single",
          defaultFont: "Fraunces, Georgia, serif",
        },
      },
    });
    const screenshots = [makeScreenshot()];
    const fetchMock = installFetchMock(async () => Response.json({ ok: true }));

    renderWithProviders(<StyleGalleryView project={project} screenshots={screenshots} />, {
      balance: 20,
      lifetimeActive: false,
    });

    fireEvent.click(screen.getByLabelText("pro"));
    expect(screen.getByText(/Fintech Sharp/i)).toBeTruthy();
    expect(screen.queryByText(/Cream Calm/i)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /fintech sharp/i }));
    fireEvent.click(screen.getByRole("button", { name: /apply style/i }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/projects/${project.id}`,
        expect.objectContaining({ method: "PATCH" })
      )
    );

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/projects/${project.id}/screenshots/${screenshots[0]!.id}`,
        expect.objectContaining({ method: "PATCH" })
      )
    );
  });
});
