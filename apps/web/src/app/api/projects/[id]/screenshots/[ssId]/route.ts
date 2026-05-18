import { z } from "zod";
import { ApiError, defineRoute } from "@/lib/api-handler";
import { getDb, queries } from "@shotwise/db";
import { BUCKETS, deleteObject } from "@shotwise/storage";

export const runtime = "nodejs";

const PatchBody = z.object({
  localized: z.record(z.unknown()).optional(),
  renderOverrides: z.record(z.unknown()).optional(),
  aiAnalysis: z.record(z.unknown()).optional(),
});

export const PATCH = defineRoute({ auth: true, body: PatchBody }, async ({ user, body, params }) => {
  const db = getDb();
  const project = await queries.getProjectById(db, params.id!, user.id);
  if (!project) throw new ApiError(404, "Project not found");
  const ss = await queries.getScreenshotById(db, params.ssId!);
  if (!ss || ss.projectId !== project.id) throw new ApiError(404, "Screenshot not found");

  const updated = await queries.updateScreenshot(db, ss.id, body);
  return { screenshot: updated };
});

export const DELETE = defineRoute({ auth: true }, async ({ user, params }) => {
  const db = getDb();
  const project = await queries.getProjectById(db, params.id!, user.id);
  if (!project) throw new ApiError(404, "Project not found");
  const ss = await queries.getScreenshotById(db, params.ssId!);
  if (!ss || ss.projectId !== project.id) throw new ApiError(404, "Screenshot not found");

  if (ss.rawKey) {
    try {
      await deleteObject(BUCKETS.raw(), ss.rawKey);
    } catch {
      // tolerate missing object
    }
  }
  await queries.deleteScreenshot(db, ss.id);
  return { ok: true };
});
