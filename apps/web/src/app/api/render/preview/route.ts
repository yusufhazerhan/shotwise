import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError, defineRoute } from "@/lib/api-handler";
import { getDb, queries } from "@shotwise/db";
import { BUCKETS, getObject } from "@shotwise/storage";
import { getTheme, getCanvasPreset, renderWithTheme } from "@shotwise/core";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({
  screenshotId: z.string().uuid(),
  themeId: z.string().default("cream"),
  canvasPresetId: z.string().default("iphone67"),
  locale: z.string().default("en"),
});

export const POST = defineRoute({ auth: true, body: Body }, async ({ user, body }) => {
  const db = getDb();
  const ss = await queries.getScreenshotById(db, body.screenshotId);
  if (!ss) throw new ApiError(404, "Screenshot not found");
  const project = await queries.getProjectById(db, ss.projectId, user.id);
  if (!project) throw new ApiError(403, "Forbidden");
  if (!ss.rawKey) throw new ApiError(400, "Screenshot raw not uploaded yet");

  const localized = (ss.localized ?? {}) as Record<string, { title?: string; accent?: string }>;
  const text = localized[body.locale] ?? localized.en ?? { title: project.name };
  if (!text.title) throw new ApiError(400, "No title set for this locale");

  const theme = getTheme(body.themeId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canvas = getCanvasPreset(body.canvasPresetId as any);
  const raw = await getObject(BUCKETS.raw(), ss.rawKey);

  const png = await renderWithTheme(
    { source: raw, title: text.title, accent: text.accent },
    theme,
    { width: canvas.width, height: canvas.height }
  );

  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
});
