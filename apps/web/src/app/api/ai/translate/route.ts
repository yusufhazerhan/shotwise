import { z } from "zod";
import { ApiError, defineRoute } from "@/lib/api-handler";
import { getDb, queries } from "@shotwise/db";
import { translateBatch } from "@shotwise/ai";
import { LOCALES, type Locale } from "@shotwise/types";

export const runtime = "nodejs";

const Body = z.object({
  projectId: z.string().uuid(),
  sourceLocale: z.enum(LOCALES).default("en"),
  targets: z.array(z.enum(LOCALES)).min(1),
});

export const POST = defineRoute({ auth: true, body: Body }, async ({ user, body }) => {
  const db = getDb();
  const project = await queries.getProjectById(db, body.projectId, user.id);
  if (!project) throw new ApiError(404, "Project not found");

  const screenshots = await queries.listScreenshots(db, project.id);
  if (screenshots.length === 0) throw new ApiError(400, "No screenshots in project");

  const meta = (project.appMetadata ?? {}) as { appName?: string };
  const targetsExcludingSource = body.targets.filter((l) => l !== body.sourceLocale);

  const updated: { screenshotId: string; locales: Locale[] }[] = [];

  for (const ss of screenshots) {
    const localized = (ss.localized ?? {}) as Record<string, { title: string; accent?: string }>;
    const source = localized[body.sourceLocale];
    if (!source?.title) continue;

    const translations = await translateBatch({
      sourceLocale: body.sourceLocale,
      targets: targetsExcludingSource,
      title: source.title,
      accent: source.accent,
      appContext: meta.appName,
      concurrency: 4,
    });

    const merged = { ...localized, ...translations } as Record<string, { title: string; accent?: string }>;
    await queries.updateScreenshot(db, ss.id, { localized: merged });
    updated.push({ screenshotId: ss.id, locales: Object.keys(merged) as Locale[] });
  }

  return { updated };
});
