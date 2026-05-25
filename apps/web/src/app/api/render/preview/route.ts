import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError, defineRoute } from "@/lib/api-handler";
import { getDb, queries } from "@shotwise/db";
import { BUCKETS, getObject } from "@shotwise/storage";
import { createDefaultScene, getCanvasPreset, renderScene, type CanvasPresetId, type StoreScreenshotScene } from "@shotwise/core";

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

  const overrides = (ss.renderOverrides ?? {}) as { scene?: StoreScreenshotScene };
  const scene = overrides.scene ?? createDefaultScene({ canvasPresetId: body.canvasPresetId, title: text.title, accent: text.accent });
  const canvas = getCanvasPreset((scene.canvasPresetId || body.canvasPresetId) as CanvasPresetId);
  const raw = await getObject(BUCKETS.raw(), ss.rawKey);

  const png = await renderScene({
    source: raw,
    scene,
    canvas: { width: canvas.width, height: canvas.height },
    localeText: { title: text.title, accent: text.accent },
  });

  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
});
