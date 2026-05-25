import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getDb: vi.fn(() => ({ kind: "db" })),
  getProjectById: vi.fn(),
  setScreenshotsOrder: vi.fn(),
}));

vi.mock("@/lib/auth.js", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("@shotwise/db", () => ({
  getDb: mocks.getDb,
  queries: {
    getProjectById: mocks.getProjectById,
    setScreenshotsOrder: mocks.setScreenshotsOrder,
  },
}));

describe("/api/projects/[id]/screenshots/reorder", () => {
  beforeEach(() => {
    vi.resetModules();
    Object.values(mocks).forEach((fn) => {
      if (typeof fn === "function" && "mockReset" in fn) fn.mockReset();
    });
    mocks.getDb.mockReturnValue({ kind: "db" });
  });

  it("reorders screenshots for the owner", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.getProjectById.mockResolvedValue({ id: "project-1" });

    const { PATCH } = await import("../projects/[id]/screenshots/reorder/route");
    const res = await PATCH(
      new NextRequest("http://localhost/api/projects/project-1/screenshots/reorder", {
        method: "PATCH",
        body: JSON.stringify({
          order: [{ id: "11111111-1111-4111-8111-111111111111", order: 0 }],
        }),
      }),
      { params: Promise.resolve({ id: "project-1" }) }
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(mocks.setScreenshotsOrder).toHaveBeenCalledWith(
      { kind: "db" },
      "project-1",
      [{ id: "11111111-1111-4111-8111-111111111111", order: 0 }]
    );
  });

  it("returns 400 when reorder payload is invalid", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });

    const { PATCH } = await import("../projects/[id]/screenshots/reorder/route");
    const res = await PATCH(
      new NextRequest("http://localhost/api/projects/project-1/screenshots/reorder", {
        method: "PATCH",
        body: JSON.stringify({
          order: [{ id: "not-a-uuid", order: -1 }],
        }),
      }),
      { params: Promise.resolve({ id: "project-1" }) }
    );

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "validation" },
    });
  });

  it("returns 404 when the project is not accessible", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.getProjectById.mockResolvedValue(null);

    const { PATCH } = await import("../projects/[id]/screenshots/reorder/route");
    const res = await PATCH(
      new NextRequest("http://localhost/api/projects/project-404/screenshots/reorder", {
        method: "PATCH",
        body: JSON.stringify({
          order: [{ id: "11111111-1111-4111-8111-111111111111", order: 0 }],
        }),
      }),
      { params: Promise.resolve({ id: "project-404" }) }
    );

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toMatchObject({
      error: { message: "Project not found" },
    });
  });
});
