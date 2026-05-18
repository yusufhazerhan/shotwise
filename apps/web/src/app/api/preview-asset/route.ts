import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb, queries } from "@shotwise/db";
import { BUCKETS, getObject } from "@shotwise/storage";

export const runtime = "nodejs";

/**
 * Returns the raw screenshot bytes for in-browser preview. Auth-gated to the
 * project owner. Used by `<LivePreview>` to embed the source image inside an
 * inline SVG without going through a public URL.
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("screenshotId");
  if (!id) return NextResponse.json({ error: "missing screenshotId" }, { status: 400 });

  const db = getDb();
  const ss = await queries.getScreenshotById(db, id);
  if (!ss || !ss.rawKey) return NextResponse.json({ error: "not found" }, { status: 404 });
  const project = await queries.getProjectById(db, ss.projectId, user.id);
  if (!project) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  try {
    const buf = await getObject(BUCKETS.raw(), ss.rawKey);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": ss.rawMime ?? "image/png",
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch {
    return NextResponse.json({ error: "object missing" }, { status: 404 });
  }
}
