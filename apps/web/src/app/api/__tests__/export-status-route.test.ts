import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getDb: vi.fn(() => ({ kind: "db" })),
  getExportJobById: vi.fn(),
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

describe("/api/exports/[jobId]/status", () => {
  beforeEach(() => {
    vi.resetModules();
    Object.values(mocks).forEach((fn) => {
      if (typeof fn === "function" && "mockReset" in fn) fn.mockReset();
    });
    mocks.getDb.mockReturnValue({ kind: "db" });
  });

  it("returns export status for the owning user", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.getExportJobById.mockResolvedValue({
      id: "job-1",
      userId: "user-1",
      status: "running",
      progress: { completed: 1 },
      zipKey: null,
      languages: ["en"],
      creditsDebited: 3,
      errorMessage: null,
      expiresAt: null,
    });

    const { GET } = await import("../exports/[jobId]/status/route");
    const res = await GET(new NextRequest("http://localhost/api/exports/job-1/status"), {
      params: Promise.resolve({ jobId: "job-1" }),
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      id: "job-1",
      status: "running",
      progress: { completed: 1 },
      zipKey: null,
      languages: ["en"],
      creditsDebited: 3,
      errorMessage: null,
      expiresAt: null,
    });
  });

  it("returns 404 for jobs belonging to another user", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: "owner@example.com" });
    mocks.getExportJobById.mockResolvedValue({ id: "job-1", userId: "user-2" });

    const { GET } = await import("../exports/[jobId]/status/route");
    const res = await GET(new NextRequest("http://localhost/api/exports/job-1/status"), {
      params: Promise.resolve({ jobId: "job-1" }),
    });

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toMatchObject({
      error: { message: "Job not found" },
    });
  });
});
