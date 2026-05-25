import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getDb: vi.fn(() => ({ kind: "db" })),
  getProjectById: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
}));

vi.mock("@/lib/auth.js", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("@shotwise/db", () => ({
  getDb: mocks.getDb,
  queries: {
    getProjectById: mocks.getProjectById,
    updateProject: mocks.updateProject,
    deleteProject: mocks.deleteProject,
  },
}));

describe("/api/projects/[id]", () => {
  beforeEach(() => {
    vi.resetModules();
    Object.values(mocks).forEach((fn) => {
      if (typeof fn === "function" && "mockReset" in fn) fn.mockReset();
    });
    mocks.getDb.mockReturnValue({ kind: "db" });
  });

  it("returns the project for the owner", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.getProjectById.mockResolvedValue({ id: "project-1", name: "Launch" });

    const { GET } = await import("../projects/[id]/route");
    const res = await GET(new NextRequest("http://localhost/api/projects/project-1"), {
      params: Promise.resolve({ id: "project-1" }),
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      project: { id: "project-1", name: "Launch" },
    });
  });

  it("returns 404 when the project is missing", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.getProjectById.mockResolvedValue(null);

    const { GET } = await import("../projects/[id]/route");
    const res = await GET(new NextRequest("http://localhost/api/projects/project-404"), {
      params: Promise.resolve({ id: "project-404" }),
    });

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toMatchObject({
      error: { message: "Project not found" },
    });
  });

  it("patches a project", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.updateProject.mockResolvedValue({ id: "project-1", name: "Updated" });

    const { PATCH } = await import("../projects/[id]/route");
    const res = await PATCH(
      new NextRequest("http://localhost/api/projects/project-1", {
        method: "PATCH",
        body: JSON.stringify({ name: "Updated", config: { languages: ["en", "tr"] } }),
      }),
      { params: Promise.resolve({ id: "project-1" }) }
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      project: { id: "project-1", name: "Updated" },
    });
    expect(mocks.updateProject).toHaveBeenCalledWith(
      { kind: "db" },
      "project-1",
      "user-1",
      { name: "Updated", config: { languages: ["en", "tr"] } }
    );
  });

  it("deletes a project for the owner", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });

    const { DELETE } = await import("../projects/[id]/route");
    const res = await DELETE(new NextRequest("http://localhost/api/projects/project-1", {
      method: "DELETE",
    }), {
      params: Promise.resolve({ id: "project-1" }),
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(mocks.deleteProject).toHaveBeenCalledWith({ kind: "db" }, "project-1", "user-1");
  });
});
