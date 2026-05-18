import { z } from "zod";
import { ApiError, defineRoute } from "@/lib/api-handler";
import { getDb, queries } from "@shotwise/db";
import { generateTitles } from "@shotwise/ai";

export const runtime = "nodejs";

const Body = z.object({
  screenshotId: z.string().uuid(),
  /** Force regeneration with different titles. */
  avoid: z.array(z.string()).optional(),
});

export const POST = defineRoute({ auth: true, body: Body }, async ({ user, body }) => {
  const db = getDb();
  const ss = await queries.getScreenshotById(db, body.screenshotId);
  if (!ss) throw new ApiError(404, "Screenshot not found");
  const project = await queries.getProjectById(db, ss.projectId, user.id);
  if (!project) throw new ApiError(403, "Forbidden");

  const meta = (project.appMetadata ?? {}) as {
    appName?: string;
    category?: string;
    tagline?: string;
  };
  const analysis = (ss.aiAnalysis ?? {}) as { description?: string };

  const result = await generateTitles({
    appName: meta.appName ?? project.name,
    category: meta.category,
    tagline: meta.tagline,
    screenDescription: analysis.description ?? `Screenshot for ${project.name}`,
    avoid: body.avoid,
  });
  return result;
});
