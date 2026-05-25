import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

class RedirectSignal extends Error {}

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  redirect: vi.fn(),
  getDb: vi.fn(() => ({ kind: "db" })),
  createProject: vi.fn(),
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
    createProject: mocks.createProject,
    getProjectById: mocks.getProjectById,
    listScreenshots: mocks.listScreenshots,
  },
}));

vi.mock("./editor-shell", () => ({
  EditorShell: ({ project, initialScreenshots }: { project: { id: string }; initialScreenshots: Array<{ id: string }> }) => (
    <div data-testid="editor-shell">{project.id}:{initialScreenshots.length}</div>
  ),
}));

describe("EditorPage", () => {
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

  it("creates a new manual project and redirects when the route is /editor/new", async () => {
    mocks.requireUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.createProject.mockResolvedValue({ id: "project-1" });

    const { default: EditorPage } = await import("./page");
    await expect(EditorPage({ params: Promise.resolve({ projectId: "new" }) })).rejects.toBeInstanceOf(RedirectSignal);

    expect(mocks.createProject).toHaveBeenCalledWith(
      { kind: "db" },
      expect.objectContaining({
        userId: "user-1",
        mode: "manual",
        name: "Untitled project",
      })
    );
    expect(mocks.redirect).toHaveBeenCalledWith("/editor/project-1");
  });

  it("renders the shell for an existing manual project", async () => {
    mocks.requireUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.getProjectById.mockResolvedValue({ id: "project-1", name: "Manual project", mode: "manual" });
    mocks.listScreenshots.mockResolvedValue([{ id: "shot-1" }]);
    mocks.redirect.mockImplementation(() => undefined);

    const { default: EditorPage } = await import("./page");
    const html = renderToStaticMarkup(
      await EditorPage({ params: Promise.resolve({ projectId: "project-1" }) })
    );

    expect(html).toContain("editor-shell");
    expect(html).toContain("project-1:1");
  });
});
