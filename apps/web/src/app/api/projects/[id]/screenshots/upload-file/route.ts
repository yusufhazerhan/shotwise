import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb, queries } from "@shotwise/db";
import { BUCKETS, keyForRawScreenshot, putObject } from "@shotwise/storage";

export const runtime = "nodejs";

const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_SIZE = 20 * 1024 * 1024;

export async function POST(req: NextRequest, segmentCtx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: "unauthorized", message: "Unauthorized" } }, { status: 401 });
  }

  const { id } = await segmentCtx.params;
  const db = getDb();
  const project = await queries.getProjectById(db, id, user.id);
  if (!project) {
    return NextResponse.json({ error: { code: "not_found", message: "Project not found" } }, { status: 404 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const orderRaw = form.get("order");
  const order = typeof orderRaw === "string" ? Number(orderRaw) : 0;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: { code: "validation", message: "Missing file" } }, { status: 400 });
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: { code: "validation", message: "Unsupported image type" } }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_SIZE) {
    return NextResponse.json({ error: { code: "validation", message: "File size must be 1 byte to 20 MB" } }, { status: 400 });
  }
  if (!Number.isInteger(order) || order < 0) {
    return NextResponse.json({ error: { code: "validation", message: "Invalid order" } }, { status: 400 });
  }

  const screenshot = await queries.createScreenshot(db, {
    projectId: project.id,
    order,
    status: "pending_upload",
    rawMime: file.type,
    rawSize: file.size,
  });

  const ext = file.type.replace("image/", "");
  const key = keyForRawScreenshot(project.id, screenshot.id, ext);
  const bytes = Buffer.from(await file.arrayBuffer());

  await putObject({
    bucket: BUCKETS.raw(),
    key,
    body: bytes,
    contentType: file.type,
  });

  const updated = await queries.updateScreenshot(db, screenshot.id, {
    status: "uploaded",
    rawKey: key,
    rawSize: file.size,
  });

  return NextResponse.json({ screenshotId: screenshot.id, key, screenshot: updated });
}
