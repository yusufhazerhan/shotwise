import type { Project, Screenshot, User, ExportJob } from "@shotwise/db";
import type { StoreScreenshotScene } from "@shotwise/types";

export function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "project-1",
    userId: "user-1",
    name: "Test Project",
    mode: "manual",
    appMetadata: {},
    config: {
      editor: {
        canvasPresetId: "iphone69",
        languages: ["en"],
        themeId: "cream",
        layoutPreset: "single",
        defaultFont: "Fraunces, Georgia, serif",
      },
    },
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

export function makeScreenshot(overrides: Partial<Screenshot> = {}): Screenshot {
  return {
    id: "shot-1",
    projectId: "project-1",
    order: 0,
    status: "uploaded",
    rawKey: "raw/shot-1.png",
    rawSize: 1024,
    rawMime: "image/png",
    localized: { en: { title: "Welcome", accent: "Welcome", subtitle: "Sub copy" } },
    aiAnalysis: null,
    renderOverrides: {},
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    email: "founder@example.com",
    emailVerified: true,
    name: "Founder",
    image: null,
    monthlyRefillActive: false,
    paymentCustomerId: null,
    signupIp: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

export function makeExportJob(overrides: Partial<ExportJob> = {}): ExportJob {
  return {
    id: "job-1",
    projectId: "project-1",
    userId: "user-1",
    status: "pending",
    creditsDebited: 1,
    languages: ["en"],
    devicePresetIds: ["iphone69"],
    includeFeatureGraphic: false,
    selectionMatrix: null,
    progress: { total: 1, done: 0 },
    zipKey: null,
    expiresAt: null,
    errorMessage: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

export function makeScene(overrides: Partial<StoreScreenshotScene> = {}): StoreScreenshotScene {
  return {
    version: 1,
    canvasPresetId: "iphone69",
    background: { type: "solid", color: "#F4EFE5" },
    layoutPreset: "single",
    device: {
      enabled: true,
      kind: "iphone",
      frameStyle: "bezel",
      padding: 26,
      radius: 64,
      shadow: "strong",
      tilt: 0,
      hideStatusBar: false,
    },
    screenshot: {
      x: 0.5,
      y: 0.46,
      width: 0.54,
      scale: 1,
      rotation: 0,
      fit: "contain",
    },
    textBlocks: [
      {
        id: "title",
        role: "title",
        text: "Welcome",
        accent: "Welcome",
        x: 0.1,
        y: 0.075,
        width: 0.8,
        align: "center",
        fontFamily: "Fraunces, Georgia, serif",
        fontSize: 0.044,
        fontWeight: 800,
        lineHeight: 1.08,
        color: "#193D31",
        accentColor: "#DF7958",
      },
      {
        id: "subtitle",
        role: "subtitle",
        text: "Sub copy",
        x: 0.18,
        y: 0.165,
        width: 0.64,
        align: "center",
        fontFamily: "Sora, system-ui, sans-serif",
        fontSize: 0.018,
        fontWeight: 500,
        lineHeight: 1.24,
        color: "#587167",
        accentColor: "#DF7958",
      },
    ],
    callouts: [],
    advanced: {},
    ...overrides,
  };
}
