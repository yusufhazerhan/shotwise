/**
 * Synchronous export orchestrator.
 *
 * MVP runs in a single Vercel/Node function. For each (screenshot × locale)
 * it composes the final PNG via `@shotwise/core.renderWithTheme`, uploads to
 * the exports bucket, then streams a ZIP archive to the same bucket. Progress
 * is mirrored to `export_jobs.progress` so the UI can poll.
 */
import archiver from "archiver";
import { PassThrough } from "node:stream";
import { Upload } from "@aws-sdk/lib-storage";
import { getDb, queries } from "@shotwise/db";
import {
  BUCKETS,
  getObject,
  keyForFeatureGraphic,
  keyForExportPng,
  keyForExportZip,
  putObject,
  getS3,
} from "@shotwise/storage";
import { refund } from "@shotwise/credits";
import { createDefaultScene, getCanvasPreset, renderScene, type CanvasPresetId, type StoreScreenshotScene } from "@shotwise/core";
import type { Locale } from "@shotwise/types";
import { summarizeExportMatrix, type ExportMatrixSelection } from "@/lib/export-matrix";

export async function runExportJob(jobId: string) {
  const db = getDb();
  const job = await queries.getExportJobById(db, jobId);
  if (!job) throw new Error(`Export job ${jobId} not found`);
  if (job.status !== "pending") return; // already running / done

  const project = await queries.getProjectById(db, job.projectId, job.userId);
  if (!project) {
    await markFailed(jobId, "Project not found");
    return;
  }

  const screenshots = await queries.listScreenshots(db, project.id);
  const uploaded = screenshots.filter((s) => s.status === "uploaded" && s.rawKey);
  if (uploaded.length === 0) {
    await markFailed(jobId, "No uploaded screenshots");
    await refund({ userId: job.userId, amount: job.creditsDebited, jobId });
    return;
  }

  const config = (project.config ?? {}) as {
    themeId?: string;
    canvasPresetId?: CanvasPresetId;
  };
  const canvasPresetId = (config.canvasPresetId as CanvasPresetId) ?? "iphone67";
  const languages = (job.languages ?? ["en"]) as Locale[];
  const devicePresetIds = ((job.devicePresetIds?.length ? job.devicePresetIds : [canvasPresetId]) as CanvasPresetId[]);
  const includeFeatureGraphic = job.includeFeatureGraphic ?? false;
  const selectionMatrix = (job.selectionMatrix ?? null) as ExportMatrixSelection | null;

  const total = (selectionMatrix ? summarizeExportMatrix(selectionMatrix).total : uploaded.length * languages.length * devicePresetIds.length) + (includeFeatureGraphic ? languages.length : 0);
  let done = 0;

  await queries.updateExportJob(db, jobId, {
    status: "running",
    progress: { total, done: 0 },
  });

  const renderedKeys: string[] = [];

  try {
    for (let i = 0; i < uploaded.length; i++) {
      const ss = uploaded[i]!;
      const localized = (ss.localized ?? {}) as Record<string, { title: string; accent?: string; subtitle?: string }>;
      const rawBuffer = await getObject(BUCKETS.raw(), ss.rawKey!);

      for (const locale of languages) {
        const text = localized[locale] ?? localized.en;
        if (!text?.title) {
          done += selectionMatrix
            ? devicePresetIds.filter((devicePresetId) => {
                const selection = selectionMatrix?.[devicePresetId]?.[ss.id]?.[locale];
                return selection === "on" || selection === "locked";
              }).length
            : devicePresetIds.length;
          await updateProgress(jobId, total, done, i, locale, "skipped (no title)");
          continue;
        }
        const overrides = (ss.renderOverrides ?? {}) as { scene?: StoreScreenshotScene };

        for (const devicePresetId of devicePresetIds) {
          const selection = selectionMatrix?.[devicePresetId]?.[ss.id]?.[locale];
          if (selectionMatrix && selection !== "on" && selection !== "locked") continue;
          const baseScene =
            overrides.scene ??
            createDefaultScene({
              canvasPresetId,
              title: text.title,
              accent: text.accent,
            });
          const scene = adaptSceneToPreset(baseScene, devicePresetId);
          const canvas = getCanvasPreset(devicePresetId) ?? getCanvasPreset(canvasPresetId) ?? { width: 1284, height: 2778, label: 'iPhone 6.7"' };
          const png = await renderScene({
            source: rawBuffer,
            scene,
            canvas: { width: canvas.width, height: canvas.height },
            localeText: { title: text.title, accent: text.accent, subtitle: text.subtitle },
          });

          const key = keyForExportPng(jobId, i, locale, devicePresetId);
          await putObject({
            bucket: BUCKETS.exports(),
            key,
            body: png,
            contentType: "image/png",
          });
          renderedKeys.push(key);
          done++;
          await updateProgress(jobId, total, done, i, locale, `rendered ${devicePresetId}`);
        }
      }
    }

    if (includeFeatureGraphic) {
      const hero = uploaded[0]!;
      const localized = (hero.localized ?? {}) as Record<string, { title: string; accent?: string; subtitle?: string }>;
      const rawBuffer = await getObject(BUCKETS.raw(), hero.rawKey!);

      for (const locale of languages) {
        const text = localized[locale] ?? localized.en;
        if (!text?.title) {
          done++;
          await updateProgress(jobId, total, done, uploaded.length, locale, "skipped feature graphic");
          continue;
        }

        const overrides = (hero.renderOverrides ?? {}) as { scene?: StoreScreenshotScene };
        const baseScene =
          overrides.scene ??
          createDefaultScene({
            canvasPresetId,
            title: text.title,
            accent: text.accent,
          });
        const scene = buildFeatureGraphicScene(baseScene, text.title, text.accent, text.subtitle);
        const png = await renderScene({
          source: rawBuffer,
          scene,
          canvas: { width: 1024, height: 500 },
          localeText: { title: text.title, accent: text.accent, subtitle: text.subtitle },
        });

        const key = keyForFeatureGraphic(jobId, locale);
        await putObject({
          bucket: BUCKETS.exports(),
          key,
          body: png,
          contentType: "image/png",
        });
        renderedKeys.push(key);
        done++;
        await updateProgress(jobId, total, done, uploaded.length, locale, "rendered feature graphic");
      }
    }

    // Stream a ZIP of all rendered PNGs
    const zipKey = keyForExportZip(jobId);
    await streamZipToBucket(renderedKeys, zipKey);

    const ttlHours = Number(process.env.EXPORT_TTL_HOURS ?? 24);
    const expiresAt = new Date(Date.now() + ttlHours * 3600 * 1000);
    await queries.updateExportJob(db, jobId, {
      status: "succeeded",
      zipKey,
      expiresAt,
      progress: { total, done, message: "complete" },
    });

    // Eagerly delete raws now that the export is finalized (ephemeral storage policy)
    await deleteRawsForProject(db, project.id);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.error("[export]", jobId, msg);
    await markFailed(jobId, msg);
    await refund({ userId: job.userId, amount: job.creditsDebited, jobId });
    // Clean up partial renders
    for (const key of renderedKeys) {
      try {
        await getS3().send;
      } catch {
        /* noop */
      }
    }
  }
}

function adaptSceneToPreset(scene: StoreScreenshotScene, canvasPresetId: CanvasPresetId): StoreScreenshotScene {
  const device = scene.device ?? {
    enabled: true,
    kind: "iphone" as const,
    frameStyle: "bezel" as const,
    padding: 26,
    radius: 64,
    shadow: "strong" as const,
    tilt: 0,
    hideStatusBar: false,
  };
  const screenshot = scene.screenshot ?? {
    x: 0.5,
    y: 0.46,
    width: 0.54,
    scale: 1,
    rotation: 0,
    fit: "contain" as const,
  };
  return {
    ...scene,
    canvasPresetId,
    device: {
      ...device,
      kind:
        canvasPresetId.startsWith("ipad")
          ? "ipad"
          : canvasPresetId === "android" || canvasPresetId === "galaxy" || canvasPresetId === "playPhone"
            ? "android"
            : "iphone",
    },
    screenshot: {
      ...screenshot,
      width:
        canvasPresetId.startsWith("ipad")
          ? 0.68
          : canvasPresetId === "android" || canvasPresetId === "galaxy" || canvasPresetId === "playPhone"
            ? 0.58
            : screenshot.width,
    },
  };
}

function buildFeatureGraphicScene(scene: StoreScreenshotScene, title: string, accent?: string, subtitle?: string): StoreScreenshotScene {
  return {
    ...scene,
    canvasPresetId: "featureGraphic",
    layoutPreset: "card",
    device: {
      ...scene.device,
      enabled: true,
      frameStyle: "minimal",
      tilt: -3,
      padding: 18,
      radius: 38,
    },
    screenshot: {
      ...scene.screenshot,
      x: 0.77,
      y: 0.56,
      width: 0.33,
      scale: 1,
      rotation: 0,
    },
    textBlocks: scene.textBlocks.map((block) => {
      if (block.id === "title") {
        return {
          ...block,
          text: title,
          accent,
          x: 0.08,
          y: 0.16,
          width: 0.42,
          align: "left",
          fontSize: 0.112,
        };
      }
      if (block.id === "subtitle") {
        return {
          ...block,
          text: subtitle ?? "",
          x: 0.08,
          y: 0.44,
          width: 0.34,
          align: "left",
          fontSize: 0.038,
        };
      }
      return block;
    }),
    callouts: [],
  };
}

async function updateProgress(
  jobId: string,
  total: number,
  done: number,
  currentIndex: number,
  currentLocale: Locale,
  message: string
) {
  await queries.updateExportJob(getDb(), jobId, {
    progress: { total, done, currentIndex, currentLocale, message },
  });
}

async function markFailed(jobId: string, message: string) {
  await queries.updateExportJob(getDb(), jobId, {
    status: "failed",
    errorMessage: message,
  });
}

async function streamZipToBucket(keys: string[], zipKey: string) {
  const pass = new PassThrough();
  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.on("error", (e) => pass.destroy(e));
  archive.pipe(pass);

  const uploadPromise = new Upload({
    client: getS3(),
    params: {
      Bucket: BUCKETS.exports(),
      Key: zipKey,
      Body: pass,
      ContentType: "application/zip",
    },
  }).done();

  for (const key of keys) {
    const buf = await getObject(BUCKETS.exports(), key);
    // Inside the ZIP, mirror the locale/index layout: <locale>/<NN>.png
    const cleaned = key.replace(/^jobs\/[^/]+\//, "");
    archive.append(buf, { name: cleaned });
  }
  await archive.finalize();
  await uploadPromise;
}

async function deleteRawsForProject(db: ReturnType<typeof getDb>, projectId: string) {
  const screenshots = await queries.listScreenshots(db, projectId);
  for (const ss of screenshots) {
    if (!ss.rawKey) continue;
    try {
      const { deleteObject } = await import("@shotwise/storage");
      await deleteObject(BUCKETS.raw(), ss.rawKey);
    } catch {
      // tolerate
    }
    await queries.updateScreenshot(db, ss.id, { rawKey: null, status: "deleted" });
  }
}
