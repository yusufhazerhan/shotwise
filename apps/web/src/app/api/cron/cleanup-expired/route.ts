import { NextResponse, type NextRequest } from "next/server";
import { getDb, queries } from "@shotwise/db";
import { BUCKETS, deletePrefix } from "@shotwise/storage";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Deletes expired export jobs' artifacts (PNGs + ZIP) and marks the row done.
 * Run hourly (or more often) on the VPS host crontab.
 *
 * Auth: `x-cron-secret` header.
 */
export async function POST(req: NextRequest) {
  const provided = req.headers.get("x-cron-secret");
  const expected = process.env.CRON_SECRET;
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const now = new Date();
  const expired = await queries.listExpiredExportJobs(db, now);

  let cleaned = 0;
  for (const job of expired) {
    try {
      await deletePrefix(BUCKETS.exports(), `jobs/${job.id}/`);
      await queries.updateExportJob(db, job.id, { zipKey: null });
      cleaned++;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[cleanup]", job.id, err);
    }
  }
  return NextResponse.json({ ok: true, cleaned, total: expired.length });
}
