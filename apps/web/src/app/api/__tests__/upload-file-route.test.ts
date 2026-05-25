import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getDb: vi.fn(() => ({ kind: "db" })),
  getProjectById: vi.fn(),
  createScreenshot: vi.fn(),
  updateScreenshot: vi.fn(),
  rawBucket: vi.fn(() => "raw-bucket"),
  keyForRawScreenshot: vi.fn(),
  putObject: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("@shotwise/db", () => ({
  getDb: mocks.getDb,
  queries: {
    getProjectById: mocks.getProjectById,
    createScreenshot: mocks.createScreenshot,
    updateScreenshot: mocks.updateScreenshot,
  },
}));

vi.mock("@shotwise/storage", () => ({
  BUCKETS: { raw: mocks.rawBucket },
  keyForRawScreenshot: mocks.keyForRawScreenshot,
  putObject: mocks.putObject,
}));

describe("/api/projects/[id]/screenshots/upload-file", () => {
  beforeEach(() => {
    vi.resetModules();
    Object.values(mocks).forEach((fn) => {
      if (typeof fn === "function" && "mockReset" in fn) fn.mockReset();
    });
    mocks.getDb.mockReturnValue({ kind: "db" });
    mocks.rawBucket.mockReturnValue("raw-bucket");
  });

  it("rejects unauthenticated uploads", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);

    const form = new FormData();
    form.set("file", new File(["img"], "screen.png", { type: "image/png" }));
    const { POST } = await import("../projects/[id]/screenshots/upload-file/route");
    const res = await POST(
      new NextRequest("http://localhost/api/projects/project-1/screenshots/upload-file", {
        method: "POST",
        body: form,
      }),
      { params: Promise.resolve({ id: "project-1" }) }
    );

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "unauthorized" },
    });
  });

  it("stores an uploaded screenshot and returns the updated screenshot metadata", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.getProjectById.mockResolvedValue({ id: "project-1" });
    mocks.createScreenshot.mockResolvedValue({ id: "shot-1" });
    mocks.keyForRawScreenshot.mockReturnValue("raw/project-1/shot-1.png");
    mocks.putObject.mockResolvedValue(undefined);
    mocks.updateScreenshot.mockResolvedValue({
      id: "shot-1",
      status: "uploaded",
      rawKey: "raw/project-1/shot-1.png",
      rawSize: 3,
    });

    const form = new FormData();
    form.set("file", new File(["img"], "screen.png", { type: "image/png" }));
    form.set("order", "2");

    const { POST } = await import("../projects/[id]/screenshots/upload-file/route");
    const res = await POST(
      new NextRequest("http://localhost/api/projects/project-1/screenshots/upload-file", {
        method: "POST",
        body: form,
      }),
      { params: Promise.resolve({ id: "project-1" }) }
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      screenshotId: "shot-1",
      key: "raw/project-1/shot-1.png",
      screenshot: {
        id: "shot-1",
        status: "uploaded",
        rawKey: "raw/project-1/shot-1.png",
        rawSize: 3,
      },
    });
    expect(mocks.createScreenshot).toHaveBeenCalledWith({ kind: "db" }, {
      projectId: "project-1",
      order: 2,
      status: "pending_upload",
      rawMime: "image/png",
      rawSize: 3,
    });
    expect(mocks.putObject).toHaveBeenCalledWith(
      expect.objectContaining({
        bucket: "raw-bucket",
        key: "raw/project-1/shot-1.png",
        contentType: "image/png",
      })
    );
  });
});
