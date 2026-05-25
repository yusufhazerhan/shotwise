import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getDb: vi.fn(() => ({ kind: "db" })),
  listProjects: vi.fn(),
  createProject: vi.fn(),
}));

vi.mock("@/lib/auth.js", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("@shotwise/db", () => ({
  getDb: mocks.getDb,
  queries: {
    listProjects: mocks.listProjects,
    createProject: mocks.createProject,
  },
}));

describe("/api/projects", () => {
  beforeEach(() => {
    vi.resetModules();
    Object.values(mocks).forEach((fn) => {
      if (typeof fn === "function" && "mockReset" in fn) fn.mockReset();
    });
    mocks.getDb.mockReturnValue({ kind: "db" });
  });

  it("lists projects for the authenticated user", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.listProjects.mockResolvedValue([{ id: "project-1", name: "Launch" }]);

    const { GET } = await import("../projects/route");
    const res = await GET(new NextRequest("http://localhost/api/projects"), { params: Promise.resolve({}) });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      projects: [{ id: "project-1", name: "Launch" }],
    });
    expect(mocks.listProjects).toHaveBeenCalledWith({ kind: "db" }, "user-1");
  });

  it("creates a project with default config", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.createProject.mockResolvedValue({ id: "project-1", name: "Untitled project" });

    const { POST } = await import("../projects/route");
    const res = await POST(
      new NextRequest("http://localhost/api/projects", {
        method: "POST",
        body: JSON.stringify({ mode: "manual" }),
      }),
      { params: Promise.resolve({}) }
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      project: { id: "project-1", name: "Untitled project" },
    });
    expect(mocks.createProject).toHaveBeenCalledWith(
      { kind: "db" },
      expect.objectContaining({
        userId: "user-1",
        name: "Untitled project",
        mode: "manual",
        config: {
          themeId: "cream",
          canvasPresetId: "iphone67",
          languages: ["en"],
          defaultPosition: "top",
        },
      })
    );
  });

  it("returns 400 for invalid project payloads", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });

    const { POST } = await import("../projects/route");
    const res = await POST(
      new NextRequest("http://localhost/api/projects", {
        method: "POST",
        body: JSON.stringify({ name: "" }),
      }),
      { params: Promise.resolve({}) }
    );

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "validation" },
    });
  });
});
