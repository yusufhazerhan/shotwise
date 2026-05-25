import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getDb: vi.fn(() => ({ kind: "db" })),
  getScreenshotById: vi.fn(),
  getProjectById: vi.fn(),
  getObject: vi.fn(),
  createDefaultScene: vi.fn(),
  getCanvasPreset: vi.fn(),
  renderScene: vi.fn(),
  rawBucket: vi.fn(() => "raw-bucket"),
}));

vi.mock("@/lib/auth.js", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("@shotwise/db", () => ({
  getDb: mocks.getDb,
  queries: {
    getScreenshotById: mocks.getScreenshotById,
    getProjectById: mocks.getProjectById,
  },
}));

vi.mock("@shotwise/storage", () => ({
  BUCKETS: { raw: mocks.rawBucket },
  getObject: mocks.getObject,
}));

vi.mock("@shotwise/core", () => ({
  createDefaultScene: mocks.createDefaultScene,
  getCanvasPreset: mocks.getCanvasPreset,
  renderScene: mocks.renderScene,
}));

describe("/api/render/preview", () => {
  beforeEach(() => {
    vi.resetModules();
    Object.values(mocks).forEach((fn) => {
      if (typeof fn === "function" && "mockReset" in fn) fn.mockReset();
    });
  });

  it("renders a PNG preview from the screenshot scene", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.getScreenshotById.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      projectId: "project-1",
      rawKey: "raw/screens/1.png",
      localized: { en: { title: "Fast exports", accent: "No watermark" } },
      renderOverrides: {},
    });
    mocks.getProjectById.mockResolvedValue({ id: "project-1", name: "Shotwise" });
    mocks.createDefaultScene.mockReturnValue({ canvasPresetId: "iphone67", version: 1 });
    mocks.getCanvasPreset.mockReturnValue({ width: 1284, height: 2778 });
    mocks.getObject.mockResolvedValue(Buffer.from("raw"));
    mocks.renderScene.mockResolvedValue(Buffer.from("png"));

    const { POST } = await import("../render/preview/route");
    const res = await POST(
      new NextRequest("http://localhost/api/render/preview", {
        method: "POST",
        body: JSON.stringify({
          screenshotId: "11111111-1111-4111-8111-111111111111",
          locale: "en",
        }),
      }),
      { params: Promise.resolve({}) }
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
    expect(mocks.renderScene).toHaveBeenCalledTimes(1);
  });
});
