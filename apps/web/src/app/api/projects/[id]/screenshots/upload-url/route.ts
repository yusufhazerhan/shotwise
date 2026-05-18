import { z } from "zod";
import { ApiError, defineRoute } from "@/lib/api-handler";
import { getDb, queries } from "@shotwise/db";
import { BUCKETS, getSignedUploadUrl, keyForRawScreenshot } from "@shotwise/storage";

export const runtime = "nodejs";

const Body = z.object({
  filename: z.string().min(1),
  mime: z.enum(["image/png", "image/jpeg", "image/webp"]),
  order: z.number().int().nonnegative().optional(),
  size: z.number().int().positive().max(20 * 1024 * 1024).optional(),
});

export const POST = defineRoute({ auth: true, body: Body }, async ({ user, body, params }) => {
  const db = getDb();
  const project = await queries.getProjectById(db, params.id!, user.id);
  if (!project) throw new ApiError(404, "Project not found");

  // 1) Insert screenshot row in pending_upload state to reserve an id + order.
  const ext = body.mime.replace("image/", "");
  const screenshot = await queries.createScreenshot(db, {
    projectId: project.id,
    order: body.order ?? 0,
    status: "pending_upload",
    rawMime: body.mime,
    rawSize: body.size ?? null,
  });

  const key = keyForRawScreenshot(project.id, screenshot.id, ext);
  const uploadUrl = await getSignedUploadUrl({
    bucket: BUCKETS.raw(),
    key,
    contentType: body.mime,
    expiresIn: 600,
  });

  // Persist the key now so confirm step is cheap
  await queries.updateScreenshot(db, screenshot.id, { rawKey: key });

  return { screenshotId: screenshot.id, key, uploadUrl };
});
