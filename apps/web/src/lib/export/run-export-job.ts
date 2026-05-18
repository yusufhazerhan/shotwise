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
  keyForExportPng,
  keyForExportZip,
  putObject,
  getS3,
} from "@shotwise/storage";
import { refund } from "@shotwise/credits";
import { getCanvasPreset, getTheme, renderWithTheme, type CanvasPresetId } from "@shotwise/core";
import type { Locale } from "@shotwise/types";

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
  const themeId = config.themeId ?? "cream";
  const canvasPresetId = (config.canvasPresetId as CanvasPresetId) ?? "iphone67";
  const theme = getTheme(themeId);
  const canvas = getCanvasPreset(canvasPresetId);
  const languages = (job.languages ?? ["en"]) as Locale[];

  const total = uploaded.length * languages.length;
  let done = 0;

  await queries.updateExportJob(db, jobId, {
    status: "running",
    progress: { total, done: 0 },
  });

  const renderedKeys: string[] = [];

  try {
    for (let i = 0; i < uploaded.length; i++) {
      const ss = uploaded[i]!;
      const localized = (ss.localized ?? {}) as Record<string, { title: string; accent?: string }>;
      const rawBuffer = await getObject(BUCKETS.raw(), ss.rawKey!);

      for (const locale of languages) {
        const text = localized[locale] ?? localized.en;
        if (!text?.title) {
          done++;
          await updateProgress(jobId, total, done, i, locale, "skipped (no title)");
          continue;
        }
        const png = await renderWithTheme(
          { source: rawBuffer, title: text.title, accent: text.accent },
          theme,
          { width: canvas.width, height: canvas.height }
        );

        const key = keyForExportPng(jobId, i, locale);
        await putObject({
          bucket: BUCKETS.exports(),
          key,
          body: png,
          contentType: "image/png",
        });
        renderedKeys.push(key);
        done++;
        await updateProgress(jobId, total, done, i, locale, "rendered");
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
