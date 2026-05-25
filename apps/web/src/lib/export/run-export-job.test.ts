import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getDb: vi.fn(() => ({ kind: "db" })),
  getExportJobById: vi.fn(),
  getProjectById: vi.fn(),
  listScreenshots: vi.fn(),
  updateExportJob: vi.fn(),
  updateScreenshot: vi.fn(),
  getObject: vi.fn(),
  putObject: vi.fn(),
  deleteObject: vi.fn(),
  refund: vi.fn(),
  createDefaultScene: vi.fn(),
  getCanvasPreset: vi.fn(),
  renderScene: vi.fn(),
  rawBucket: vi.fn(() => "raw-bucket"),
  exportsBucket: vi.fn(() => "exports-bucket"),
  keyForExportPng: vi.fn((jobId: string, index: number, locale: string) => `jobs/${jobId}/${locale}/${index}.png`),
  keyForExportZip: vi.fn((jobId: string) => `jobs/${jobId}/bundle.zip`),
  uploadDone: vi.fn().mockResolvedValue(undefined),
  s3Send: vi.fn(),
}));

vi.mock("@shotwise/db", () => ({
  getDb: mocks.getDb,
  queries: {
    getExportJobById: mocks.getExportJobById,
    getProjectById: mocks.getProjectById,
    listScreenshots: mocks.listScreenshots,
    updateExportJob: mocks.updateExportJob,
    updateScreenshot: mocks.updateScreenshot,
  },
}));

vi.mock("@shotwise/storage", async () => {
  const actual = await vi.importActual<object>("@shotwise/storage");
  return {
    ...actual,
    BUCKETS: {
      raw: mocks.rawBucket,
      exports: mocks.exportsBucket,
    },
    getObject: mocks.getObject,
    putObject: mocks.putObject,
    deleteObject: mocks.deleteObject,
    keyForExportPng: mocks.keyForExportPng,
    keyForExportZip: mocks.keyForExportZip,
    getS3: () => ({ send: mocks.s3Send }),
  };
});

vi.mock("@shotwise/credits", () => ({
  refund: mocks.refund,
}));

vi.mock("@shotwise/core", () => ({
  createDefaultScene: mocks.createDefaultScene,
  getCanvasPreset: mocks.getCanvasPreset,
  renderScene: mocks.renderScene,
}));

vi.mock("@aws-sdk/lib-storage", () => ({
  Upload: class MockUpload {
    done() {
      return mocks.uploadDone();
    }
  },
}));

describe("runExportJob", () => {
  beforeEach(() => {
    vi.resetModules();
    Object.values(mocks).forEach((fn) => {
      if (typeof fn === "function" && "mockReset" in fn) fn.mockReset();
    });
    mocks.getDb.mockReturnValue({ kind: "db" });
    mocks.rawBucket.mockReturnValue("raw-bucket");
    mocks.exportsBucket.mockReturnValue("exports-bucket");
    mocks.keyForExportPng.mockImplementation((jobId: string, index: number, locale: string) => `jobs/${jobId}/${locale}/${index}.png`);
    mocks.keyForExportZip.mockImplementation((jobId: string) => `jobs/${jobId}/bundle.zip`);
    mocks.uploadDone.mockResolvedValue(undefined);
    mocks.s3Send.mockResolvedValue(undefined);
    mocks.getCanvasPreset.mockImplementation(() => ({ width: 1284, height: 2778 }));
  });

  it("refunds credits and fails the job when there are no uploaded screenshots", async () => {
    mocks.getExportJobById.mockResolvedValue({
      id: "job-1",
      status: "pending",
      projectId: "project-1",
      userId: "user-1",
      creditsDebited: 4,
      languages: ["en"],
      devicePresetIds: ["iphone67"],
      includeFeatureGraphic: false,
    });
    mocks.getProjectById.mockResolvedValue({ id: "project-1", config: {} });
    mocks.listScreenshots.mockResolvedValue([{ id: "shot-1", status: "pending", rawKey: null }]);

    const { runExportJob } = await import("./run-export-job");
    await runExportJob("job-1");

    expect(mocks.updateExportJob).toHaveBeenCalledWith({ kind: "db" }, "job-1", {
      status: "failed",
      errorMessage: "No uploaded screenshots",
    });
    expect(mocks.refund).toHaveBeenCalledWith({ userId: "user-1", amount: 4, jobId: "job-1" });
  });

  it("renders uploaded screenshots and marks the job succeeded", async () => {
    mocks.getExportJobById.mockResolvedValue({
      id: "job-1",
      status: "pending",
      projectId: "project-1",
      userId: "user-1",
      creditsDebited: 2,
      languages: ["en"],
      devicePresetIds: ["iphone67"],
      includeFeatureGraphic: false,
    });
    mocks.getProjectById.mockResolvedValue({ id: "project-1", config: { canvasPresetId: "iphone67" } });
    mocks.listScreenshots
      .mockResolvedValueOnce([
        {
          id: "shot-1",
          status: "uploaded",
          rawKey: "raw/1.png",
          localized: { en: { title: "Fast exports", accent: "No watermark" } },
          renderOverrides: {},
        },
      ])
      .mockResolvedValueOnce([
        {
          id: "shot-1",
          status: "uploaded",
          rawKey: "raw/1.png",
          localized: { en: { title: "Fast exports", accent: "No watermark" } },
          renderOverrides: {},
        },
      ]);
    mocks.createDefaultScene.mockReturnValue({ version: 1, canvasPresetId: "iphone67" });
    mocks.getObject.mockResolvedValue(Buffer.from("raw"));
    mocks.renderScene.mockResolvedValue(Buffer.from("png"));
    mocks.putObject.mockResolvedValue(undefined);
    mocks.deleteObject.mockResolvedValue(undefined);

    const { runExportJob } = await import("./run-export-job");
    await runExportJob("job-1");

    expect(mocks.renderScene).toHaveBeenCalledTimes(1);
    expect(mocks.putObject).toHaveBeenCalledWith(
      expect.objectContaining({
        bucket: "exports-bucket",
        contentType: "image/png",
      })
    );
    expect(mocks.updateExportJob).toHaveBeenLastCalledWith(
      { kind: "db" },
      "job-1",
      expect.objectContaining({
        status: "succeeded",
        zipKey: "jobs/job-1/bundle.zip",
      })
    );
    expect(mocks.updateScreenshot).toHaveBeenCalledWith({ kind: "db" }, "shot-1", {
      rawKey: null,
      status: "deleted",
    });
  });
});
