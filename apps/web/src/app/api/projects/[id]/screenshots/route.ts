import { z } from "zod";
import { ApiError, defineRoute } from "@/lib/api-handler";
import { getDb, queries } from "@shotwise/db";

export const runtime = "nodejs";

export const GET = defineRoute({ auth: true }, async ({ user, params }) => {
  const db = getDb();
  const project = await queries.getProjectById(db, params.id!, user.id);
  if (!project) throw new ApiError(404, "Project not found");
  const screenshots = await queries.listScreenshots(db, project.id);
  return { screenshots };
});

// Confirm an upload has completed — flip status to "uploaded"
const ConfirmBody = z.object({
  screenshotId: z.string().uuid(),
  size: z.number().int().positive().optional(),
});

export const POST = defineRoute({ auth: true, body: ConfirmBody }, async ({ user, body, params }) => {
  const db = getDb();
  const project = await queries.getProjectById(db, params.id!, user.id);
  if (!project) throw new ApiError(404, "Project not found");

  const ss = await queries.getScreenshotById(db, body.screenshotId);
  if (!ss || ss.projectId !== project.id) throw new ApiError(404, "Screenshot not found");

  const updated = await queries.updateScreenshot(db, ss.id, {
    status: "uploaded",
    rawSize: body.size ?? ss.rawSize ?? null,
  });
  return { screenshot: updated };
});
