import { z } from "zod";
import { ApiError, defineRoute } from "@/lib/api-handler";
import { getDb, queries } from "@shotwise/db";

export const runtime = "nodejs";

export const GET = defineRoute({ auth: true }, async ({ user, params }) => {
  const project = await queries.getProjectById(getDb(), params.id!, user.id);
  if (!project) throw new ApiError(404, "Project not found");
  return { project };
});

const PatchBody = z.object({
  name: z.string().min(1).max(120).optional(),
  mode: z.literal("manual").optional(),
  appMetadata: z.record(z.unknown()).optional(),
  config: z.record(z.unknown()).optional(),
});

export const PATCH = defineRoute({ auth: true, body: PatchBody }, async ({ user, body, params }) => {
  const project = await queries.updateProject(getDb(), params.id!, user.id, body);
  if (!project) throw new ApiError(404, "Project not found");
  return { project };
});

export const DELETE = defineRoute({ auth: true }, async ({ user, params }) => {
  await queries.deleteProject(getDb(), params.id!, user.id);
  return { ok: true };
});
