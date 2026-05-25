import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getDb: vi.fn(() => ({ kind: "db" })),
  getProjectById: vi.fn(),
  listScreenshots: vi.fn(),
  getScreenshotById: vi.fn(),
  updateScreenshot: vi.fn(),
}));

vi.mock("@/lib/auth.js", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("@shotwise/db", () => ({
  getDb: mocks.getDb,
  queries: {
    getProjectById: mocks.getProjectById,
    listScreenshots: mocks.listScreenshots,
    getScreenshotById: mocks.getScreenshotById,
    updateScreenshot: mocks.updateScreenshot,
  },
}));

describe("/api/projects/[id]/screenshots", () => {
  beforeEach(() => {
    vi.resetModules();
    Object.values(mocks).forEach((fn) => {
      if (typeof fn === "function" && "mockReset" in fn) fn.mockReset();
    });
    mocks.getDb.mockReturnValue({ kind: "db" });
  });

  it("lists screenshots for the project owner", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.getProjectById.mockResolvedValue({ id: "project-1" });
    mocks.listScreenshots.mockResolvedValue([{ id: "shot-1", status: "uploaded" }]);

    const { GET } = await import("../projects/[id]/screenshots/route");
    const res = await GET(new NextRequest("http://localhost/api/projects/project-1/screenshots"), {
      params: Promise.resolve({ id: "project-1" }),
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      screenshots: [{ id: "shot-1", status: "uploaded" }],
    });
  });

  it("confirms an uploaded screenshot and persists the final size", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.getProjectById.mockResolvedValue({ id: "project-1" });
    mocks.getScreenshotById.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      projectId: "project-1",
      rawSize: 123,
    });
    mocks.updateScreenshot.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      status: "uploaded",
      rawSize: 456,
    });

    const { POST } = await import("../projects/[id]/screenshots/route");
    const res = await POST(
      new NextRequest("http://localhost/api/projects/project-1/screenshots", {
        method: "POST",
        body: JSON.stringify({
          screenshotId: "11111111-1111-4111-8111-111111111111",
          size: 456,
        }),
      }),
      { params: Promise.resolve({ id: "project-1" }) }
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      screenshot: {
        id: "11111111-1111-4111-8111-111111111111",
        status: "uploaded",
        rawSize: 456,
      },
    });
    expect(mocks.updateScreenshot).toHaveBeenCalledWith(
      { kind: "db" },
      "11111111-1111-4111-8111-111111111111",
      { status: "uploaded", rawSize: 456 }
    );
  });

  it("returns 404 when the screenshot belongs to another project", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.getProjectById.mockResolvedValue({ id: "project-1" });
    mocks.getScreenshotById.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      projectId: "project-2",
    });

    const { POST } = await import("../projects/[id]/screenshots/route");
    const res = await POST(
      new NextRequest("http://localhost/api/projects/project-1/screenshots", {
        method: "POST",
        body: JSON.stringify({
          screenshotId: "11111111-1111-4111-8111-111111111111",
        }),
      }),
      { params: Promise.resolve({ id: "project-1" }) }
    );

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toMatchObject({
      error: { message: "Screenshot not found" },
    });
  });
});
