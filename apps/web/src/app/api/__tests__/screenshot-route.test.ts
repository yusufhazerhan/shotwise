import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getDb: vi.fn(() => ({ kind: "db" })),
  getProjectById: vi.fn(),
  getScreenshotById: vi.fn(),
  updateScreenshot: vi.fn(),
  deleteScreenshot: vi.fn(),
  rawBucket: vi.fn(() => "raw-bucket"),
  deleteObject: vi.fn(),
}));

vi.mock("@/lib/auth.js", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("@shotwise/db", () => ({
  getDb: mocks.getDb,
  queries: {
    getProjectById: mocks.getProjectById,
    getScreenshotById: mocks.getScreenshotById,
    updateScreenshot: mocks.updateScreenshot,
    deleteScreenshot: mocks.deleteScreenshot,
  },
}));

vi.mock("@shotwise/storage", () => ({
  BUCKETS: { raw: mocks.rawBucket },
  deleteObject: mocks.deleteObject,
}));

describe("/api/projects/[id]/screenshots/[ssId]", () => {
  beforeEach(() => {
    vi.resetModules();
    Object.values(mocks).forEach((fn) => {
      if (typeof fn === "function" && "mockReset" in fn) fn.mockReset();
    });
    mocks.getDb.mockReturnValue({ kind: "db" });
    mocks.rawBucket.mockReturnValue("raw-bucket");
  });

  it("patches screenshot metadata for the owner", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.getProjectById.mockResolvedValue({ id: "project-1" });
    mocks.getScreenshotById.mockResolvedValue({ id: "shot-1", projectId: "project-1" });
    mocks.updateScreenshot.mockResolvedValue({
      id: "shot-1",
      localized: { en: { title: "Updated" } },
    });

    const { PATCH } = await import("../projects/[id]/screenshots/[ssId]/route");
    const res = await PATCH(
      new NextRequest("http://localhost/api/projects/project-1/screenshots/shot-1", {
        method: "PATCH",
        body: JSON.stringify({ localized: { en: { title: "Updated" } } }),
      }),
      { params: Promise.resolve({ id: "project-1", ssId: "shot-1" }) }
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      screenshot: { id: "shot-1", localized: { en: { title: "Updated" } } },
    });
  });

  it("deletes the raw object before deleting the screenshot row", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.getProjectById.mockResolvedValue({ id: "project-1" });
    mocks.getScreenshotById.mockResolvedValue({
      id: "shot-1",
      projectId: "project-1",
      rawKey: "raw/project-1/shot-1.png",
    });

    const { DELETE } = await import("../projects/[id]/screenshots/[ssId]/route");
    const res = await DELETE(
      new NextRequest("http://localhost/api/projects/project-1/screenshots/shot-1", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ id: "project-1", ssId: "shot-1" }) }
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(mocks.deleteObject).toHaveBeenCalledWith("raw-bucket", "raw/project-1/shot-1.png");
    expect(mocks.deleteScreenshot).toHaveBeenCalledWith({ kind: "db" }, "shot-1");
  });

  it("returns 404 when the screenshot is outside the project", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.getProjectById.mockResolvedValue({ id: "project-1" });
    mocks.getScreenshotById.mockResolvedValue({
      id: "shot-1",
      projectId: "project-2",
    });

    const { PATCH } = await import("../projects/[id]/screenshots/[ssId]/route");
    const res = await PATCH(
      new NextRequest("http://localhost/api/projects/project-1/screenshots/shot-1", {
        method: "PATCH",
        body: JSON.stringify({ localized: { en: { title: "Updated" } } }),
      }),
      { params: Promise.resolve({ id: "project-1", ssId: "shot-1" }) }
    );

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toMatchObject({
      error: { message: "Screenshot not found" },
    });
  });
});
