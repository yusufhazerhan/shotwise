import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getDb: vi.fn(() => ({ kind: "db" })),
  getProjectById: vi.fn(),
  listScreenshots: vi.fn(),
  createExportJob: vi.fn(),
  updateExportJob: vi.fn(),
  consumeForExport: vi.fn(),
  getBalance: vi.fn(),
  runExportJob: vi.fn(),
}));

class MockInsufficientCreditsError extends Error {}

vi.mock("@/lib/auth.js", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("@shotwise/db", () => ({
  getDb: mocks.getDb,
  queries: {
    getProjectById: mocks.getProjectById,
    listScreenshots: mocks.listScreenshots,
    createExportJob: mocks.createExportJob,
    updateExportJob: mocks.updateExportJob,
  },
}));

vi.mock("@shotwise/credits", () => ({
  consumeForExport: mocks.consumeForExport,
  getBalance: mocks.getBalance,
  InsufficientCreditsError: MockInsufficientCreditsError,
}));

vi.mock("@/lib/export/run-export-job", () => ({
  runExportJob: mocks.runExportJob,
}));

describe("/api/projects/[id]/export", () => {
  beforeEach(() => {
    vi.resetModules();
    Object.values(mocks).forEach((fn) => {
      if (typeof fn === "function" && "mockReset" in fn) fn.mockReset();
    });
    mocks.runExportJob.mockResolvedValue(undefined);
  });

  it("creates an export job and returns the export plan", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.getProjectById.mockResolvedValue({ id: "project-1", config: {} });
    mocks.listScreenshots.mockResolvedValue([
      { id: "shot-1", status: "uploaded", rawKey: "raw/1.png" },
      { id: "shot-2", status: "uploaded", rawKey: "raw/2.png" },
    ]);
    mocks.createExportJob.mockResolvedValue({ id: "job-1" });
    mocks.consumeForExport.mockResolvedValue(undefined);

    const { POST } = await import("../projects/[id]/export/route");
    const res = await POST(
      new NextRequest("http://localhost/api/projects/project-1/export", {
        method: "POST",
        body: JSON.stringify({ languages: ["en", "tr"], devicePresetIds: ["iphone69", "android"], includeFeatureGraphic: true }),
      }),
      { params: Promise.resolve({ id: "project-1" }) }
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      jobId: "job-1",
      screenCount: 2,
      finalImageCount: 10,
      languages: ["en", "tr"],
      devicePresetIds: ["iphone69", "android"],
      includeFeatureGraphic: true,
    });
    expect(mocks.consumeForExport).toHaveBeenCalledWith({
      userId: "user-1",
      jobId: "job-1",
      screenCount: 10,
    });
    expect(mocks.runExportJob).toHaveBeenCalledWith("job-1");
  });

  it("returns a 402 payload when credits are insufficient", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.getProjectById.mockResolvedValue({ id: "project-1", config: {} });
    mocks.listScreenshots.mockResolvedValue([{ id: "shot-1", status: "uploaded", rawKey: "raw/1.png" }]);
    mocks.createExportJob.mockResolvedValue({ id: "job-1" });
    mocks.consumeForExport.mockRejectedValue(new MockInsufficientCreditsError("nope"));
    mocks.getBalance.mockResolvedValue(1);

    const { POST } = await import("../projects/[id]/export/route");
    const res = await POST(
      new NextRequest("http://localhost/api/projects/project-1/export", {
        method: "POST",
        body: JSON.stringify({ languages: ["en", "tr"] }),
      }),
      { params: Promise.resolve({ id: "project-1" }) }
    );

    expect(res.status).toBe(402);
    await expect(res.json()).resolves.toMatchObject({
      error: {
        code: "insufficient_credits",
        required: 2,
        balance: 1,
        buyUrl: "/credits",
      },
    });
    expect(mocks.updateExportJob).toHaveBeenCalledWith(undefined, "job-1", {
      status: "failed",
      errorMessage: "insufficient_credits",
    });
  });
});
