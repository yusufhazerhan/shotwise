import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

class RedirectSignal extends Error {}

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  redirect: vi.fn(),
  getDb: vi.fn(() => ({ kind: "db" })),
  getProjectById: vi.fn(),
  listScreenshots: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireUser: mocks.requireUser,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@shotwise/db", () => ({
  getDb: mocks.getDb,
  queries: {
    getProjectById: mocks.getProjectById,
    listScreenshots: mocks.listScreenshots,
  },
}));

vi.mock("./export-matrix-view", () => ({
  ExportMatrixView: ({ project, screenshots }: { project: { id: string }; screenshots: Array<{ id: string }> }) => (
    <div data-testid="export-matrix-view">{project.id}:{screenshots.length}</div>
  ),
}));

describe("ProjectExportMatrixPage", () => {
  beforeEach(() => {
    vi.resetModules();
    Object.values(mocks).forEach((fn) => {
      if (typeof fn === "function" && "mockReset" in fn) fn.mockReset();
    });
    mocks.getDb.mockReturnValue({ kind: "db" });
    mocks.redirect.mockImplementation(() => {
      throw new RedirectSignal("redirect");
    });
  });

  it("renders the export matrix for the user's project", async () => {
    mocks.requireUser.mockResolvedValue({ id: "user-1" });
    mocks.getProjectById.mockResolvedValue({ id: "project-1", name: "Project 1" });
    mocks.listScreenshots.mockResolvedValue([{ id: "shot-1" }, { id: "shot-2" }]);
    mocks.redirect.mockImplementation(() => undefined);

    const { default: ProjectExportMatrixPage } = await import("./page");
    const html = renderToStaticMarkup(
      await ProjectExportMatrixPage({ params: Promise.resolve({ id: "project-1" }) })
    );

    expect(html).toContain("export-matrix-view");
    expect(html).toContain("project-1:2");
  });
});
