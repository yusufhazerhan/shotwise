import * as React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EditorShell } from "./editor-shell";
import { renderWithProviders } from "@/test/render";
import { makeProject, makeScene, makeScreenshot } from "@/test/factories";
import { installFetchMock } from "@/test/setup";

vi.mock("./parts/screenshot-list", () => ({
  ScreenshotList: ({ screenshots, onReorder }: { screenshots: Array<{ id: string }>; onReorder: (shots: Array<{ id: string }>) => Promise<void> }) => (
    <button onClick={() => onReorder([...screenshots].reverse())}>reorder shots</button>
  ),
}));

vi.mock("@/components/scene-preview", () => ({
  ScenePreview: ({ scene, onSceneChange }: { scene: ReturnType<typeof makeScene>; onSceneChange: (scene: ReturnType<typeof makeScene>) => void }) => (
    <button onClick={() => onSceneChange({ ...scene, screenshot: { ...scene.screenshot, scale: 1.2 } })}>change scene</button>
  ),
}));

vi.mock("./parts/settings-panel", () => ({
  SettingsPanel: ({ saveStatus }: { saveStatus: string }) => <div data-testid="settings-status">{saveStatus}</div>,
}));

vi.mock("./parts/export-button", () => ({
  ExportButton: () => <div>export</div>,
}));

describe("EditorShell", () => {
  it("debounces scene autosave and updates the save status", async () => {
    const screenshot = makeScreenshot({
      renderOverrides: { scene: makeScene() },
      localized: { en: { title: "Fast exports" } },
    });
    const fetchMock = installFetchMock(async (_input, init) => {
      const body = JSON.parse(String(init?.body));
      return Response.json({
        screenshot: {
          ...screenshot,
          ...body,
        },
      });
    });

    renderWithProviders(
      <EditorShell
        project={makeProject()}
        initialScreenshots={[screenshot]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /change scene/i }));
    expect(screen.getByText("Saving...")).toBeTruthy();

    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByTestId("settings-status").textContent).toBe("saved"));
  }, 7000);

  it("reorders screenshots through the reorder endpoint and refreshes the list", async () => {
    const screenshots = [makeScreenshot(), makeScreenshot({ id: "shot-2", order: 1 })];
    const fetchMock = installFetchMock(async (input, init) => {
      const url = String(input);
      if (url.endsWith("/screenshots/reorder")) {
        return new Response(null, { status: 200 });
      }
      if (url.endsWith("/screenshots")) {
        return Response.json({ screenshots: [...screenshots].reverse() });
      }
      return Response.json({ project: makeProject() });
    });

    renderWithProviders(
      <EditorShell
        project={makeProject()}
        initialScreenshots={screenshots}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /reorder shots/i }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/screenshots/reorder"),
        expect.objectContaining({ method: "PATCH" })
      )
    );
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/screenshots"),
        expect.objectContaining({ cache: "no-store" })
      )
    );
  });
});
