import * as React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ScreenshotList } from "./screenshot-list";
import { renderWithProviders } from "@/test/render";
import { makeScreenshot } from "@/test/factories";
import { installFetchMock } from "@/test/setup";

vi.mock("@shotwise/ui-primitives", () => ({
  DropZone: ({ children, onDrop }: { children: React.ReactNode; onDrop: (files: File[]) => void }) => (
    <button onClick={() => onDrop([new File(["a"], "screen.png", { type: "image/png" })])}>{children}</button>
  ),
}));

describe("ScreenshotList", () => {
  beforeEach(() => {
    vi.stubGlobal("confirm", vi.fn(() => true));
  });

  it("passes dropped files to the upload handler", async () => {
    const onDrop = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <ScreenshotList
        screenshots={[makeScreenshot()]}
        activeId={null}
        onSelect={() => {}}
        onDrop={onDrop}
        onRefresh={vi.fn().mockResolvedValue(undefined)}
        onReorder={vi.fn().mockResolvedValue(undefined)}
        projectId="project-1"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /\+ add screenshot/i }));

    await waitFor(() => expect(onDrop).toHaveBeenCalledTimes(1));
    expect(onDrop.mock.calls[0]?.[0]).toHaveLength(1);
  });

  it("reorders and deletes screenshots through the provided handlers", async () => {
    const onReorder = vi.fn().mockResolvedValue(undefined);
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    installFetchMock(async () => new Response(null, { status: 200 }));

    renderWithProviders(
      <ScreenshotList
        screenshots={[makeScreenshot(), makeScreenshot({ id: "shot-2", order: 1 })]}
        activeId={null}
        onSelect={() => {}}
        onDrop={vi.fn().mockResolvedValue(undefined)}
        onRefresh={onRefresh}
        onReorder={onReorder}
        projectId="project-1"
      />
    );

    fireEvent.click(screen.getAllByTitle("Move down")[0]!);
    await waitFor(() => expect(onReorder).toHaveBeenCalledTimes(1));
    expect(onReorder.mock.calls[0]?.[0].map((item: { id: string }) => item.id)).toEqual(["shot-2", "shot-1"]);

    fireEvent.click(screen.getAllByTitle("Delete")[0]!);
    await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(1));
  });
});
