import { z } from "zod";
import { ApiError, defineRoute } from "@/lib/api-handler";
import { getDb, queries } from "@shotwise/db";

export const runtime = "nodejs";

const Body = z.object({
  order: z.array(z.object({ id: z.string().uuid(), order: z.number().int().nonnegative() })),
});

export const PATCH = defineRoute({ auth: true, body: Body }, async ({ user, body, params }) => {
  const db = getDb();
  const project = await queries.getProjectById(db, params.id!, user.id);
  if (!project) throw new ApiError(404, "Project not found");
  await queries.setScreenshotsOrder(db, project.id, body.order);
  return { ok: true };
});
