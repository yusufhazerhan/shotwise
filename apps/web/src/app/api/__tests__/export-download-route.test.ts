import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getDb: vi.fn(() => ({ kind: "db" })),
  getExportJobById: vi.fn(),
  exportsBucket: vi.fn(() => "exports-bucket"),
  getSignedDownloadUrl: vi.fn(),
}));

vi.mock("@/lib/auth.js", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("@shotwise/db", () => ({
  getDb: mocks.getDb,
  queries: {
    getExportJobById: mocks.getExportJobById,
  },
}));

vi.mock("@shotwise/storage", () => ({
  BUCKETS: { exports: mocks.exportsBucket },
  getSignedDownloadUrl: mocks.getSignedDownloadUrl,
}));

describe("/api/exports/[jobId]/download", () => {
  beforeEach(() => {
    vi.resetModules();
    Object.values(mocks).forEach((fn) => {
      if (typeof fn === "function" && "mockReset" in fn) fn.mockReset();
    });
    mocks.getDb.mockReturnValue({ kind: "db" });
    mocks.exportsBucket.mockReturnValue("exports-bucket");
  });

  it("redirects to a signed download URL for successful jobs", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.getExportJobById.mockResolvedValue({
      id: "job-1",
      userId: "user-1",
      status: "succeeded",
      zipKey: "exports/job-1.zip",
    });
    mocks.getSignedDownloadUrl.mockResolvedValue("https://downloads.example.com/job-1.zip");

    const { GET } = await import("../exports/[jobId]/download/route");
    const res = await GET(new NextRequest("http://localhost/api/exports/job-1/download"), {
      params: Promise.resolve({ jobId: "job-1" }),
    });

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://downloads.example.com/job-1.zip");
    expect(mocks.getSignedDownloadUrl).toHaveBeenCalledWith({
      bucket: "exports-bucket",
      key: "exports/job-1.zip",
      expiresIn: 3600,
    });
  });

  it("returns 409 while the job is still running", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.getExportJobById.mockResolvedValue({
      id: "job-1",
      userId: "user-1",
      status: "running",
      zipKey: null,
    });

    const { GET } = await import("../exports/[jobId]/download/route");
    const res = await GET(new NextRequest("http://localhost/api/exports/job-1/download"), {
      params: Promise.resolve({ jobId: "job-1" }),
    });

    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toMatchObject({
      error: { message: "Job is running" },
    });
  });
});
