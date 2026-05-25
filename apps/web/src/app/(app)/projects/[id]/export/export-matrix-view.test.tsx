import * as React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { makeProject, makeScreenshot } from "@/test/factories";
import { installFetchMock } from "@/test/setup";
import { ExportMatrixView } from "./export-matrix-view";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

describe("ExportMatrixView", () => {
  beforeEach(() => {
    push.mockReset();
  });

  it("updates the total when matrix cells and feature graphics change", async () => {
    const project = makeProject({
      config: {
        editor: {
          canvasPresetId: "iphone69",
          languages: ["en", "tr"],
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
    installFetchMock(async () => Response.json({ ok: true }));

    renderWithProviders(<ExportMatrixView project={project} screenshots={screenshots} />, {
      balance: 20,
      lifetimeActive: true,
    });

    expect(screen.getByRole("button", { name: /export 2 pngs/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /^on$/i }));
    await waitFor(() => expect(screen.getByRole("button", { name: /export 1 png/i })).toBeTruthy());

    fireEvent.click(screen.getByText(/google play feature graphic/i));
    await waitFor(() => expect(screen.getByRole("button", { name: /export 3 pngs/i })).toBeTruthy());
  });

  it("posts the selected matrix to the export route", async () => {
    const project = makeProject({
      config: {
        editor: {
          canvasPresetId: "iphone69",
          languages: ["en", "tr"],
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
    const fetchMock = installFetchMock(async (input, init) => {
      const url = String(input);
      if (url === "/api/credits") {
        return Response.json({ balance: 99, lifetimeActive: true });
      }
      if (url === `/api/projects/${project.id}/export`) {
        return Response.json({ jobId: "job-1" });
      }
      return Response.json({ ok: true });
    });

    renderWithProviders(<ExportMatrixView project={project} screenshots={screenshots} />, {
      balance: 20,
      lifetimeActive: true,
    });

    fireEvent.click(screen.getByText(/google play feature graphic/i));
    fireEvent.click(screen.getByRole("button", { name: /export 4 pngs/i }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/projects/${project.id}/export`,
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      )
    );

    const exportCall = fetchMock.mock.calls.find(([input]) => String(input) === `/api/projects/${project.id}/export`);
    const body = JSON.parse(String(exportCall?.[1]?.body ?? "{}")) as {
      languages: string[];
      includeFeatureGraphic: boolean;
      devicePresetIds: string[];
      selectionMatrix: Record<string, unknown>;
    };

    expect(body.languages).toEqual(["en", "tr"]);
    expect(body.includeFeatureGraphic).toBe(true);
    expect(body.devicePresetIds).toEqual(["iphone69"]);
    expect(body.selectionMatrix.iphone69).toBeTruthy();
    expect(push).toHaveBeenCalledWith(`/projects/${project.id}?job=job-1`);
  });
});
