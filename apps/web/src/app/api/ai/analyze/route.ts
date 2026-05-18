import { z } from "zod";
import { ApiError, defineRoute } from "@/lib/api-handler";
import { getDb, queries } from "@shotwise/db";
import { BUCKETS, getObject } from "@shotwise/storage";
import { analyzeScreenshot } from "@shotwise/ai";

export const runtime = "nodejs";

const Body = z.object({ screenshotId: z.string().uuid() });

export const POST = defineRoute({ auth: true, body: Body }, async ({ user, body }) => {
  const db = getDb();
  const ss = await queries.getScreenshotById(db, body.screenshotId);
  if (!ss) throw new ApiError(404, "Screenshot not found");

  const project = await queries.getProjectById(db, ss.projectId, user.id);
  if (!project) throw new ApiError(403, "Forbidden");
  if (!ss.rawKey) throw new ApiError(400, "Screenshot raw not uploaded yet");

  const buffer = await getObject(BUCKETS.raw(), ss.rawKey);
  const meta = (project.appMetadata ?? {}) as {
    appName?: string;
    category?: string;
    tagline?: string;
    description?: string;
  };

  const analysis = await analyzeScreenshot({
    image: buffer,
    mimeType: ss.rawMime ?? "image/png",
    appName: meta.appName ?? project.name,
    category: meta.category,
    tagline: meta.tagline,
    description: meta.description,
  });

  const generatedAt = new Date().toISOString();
  const persisted = { ...analysis, generatedAt };

  // Stash analysis + seed an English title/accent so the editor has something to render
  const existingLocalized = (ss.localized ?? {}) as Record<string, { title: string; accent?: string }>;
  const localized = {
    ...existingLocalized,
    en: existingLocalized.en ?? {
      title: analysis.suggestedTitles[0]!,
      accent: analysis.suggestedAccent,
    },
  };

  await queries.updateScreenshot(db, ss.id, {
    aiAnalysis: persisted,
    localized,
  });

  return { analysis: persisted };
});
