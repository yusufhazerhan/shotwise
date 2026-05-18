import { NextResponse, type NextRequest } from "next/server";
import { getDb, queries } from "@shotwise/db";
import { grantMonthlyRefill } from "@shotwise/credits";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Grants monthly_refill to every user with monthlyRefillActive=true.
 * Idempotent per (userId, YYYY-MM) via grantMonthlyRefill's idempotency key.
 *
 * Auth: `x-cron-secret` header must match CRON_SECRET.
 */
export async function POST(req: NextRequest) {
  const provided = req.headers.get("x-cron-secret");
  const expected = process.env.CRON_SECRET;
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const users = await queries.listUsersWithActiveRefill(db);

  const now = new Date();
  const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  let granted = 0;
  let skipped = 0;
  for (const u of users) {
    const res = await grantMonthlyRefill(u.id, monthKey, db);
    if (res?.granted) granted++;
    else skipped++;
  }
  return NextResponse.json({ ok: true, granted, skipped, total: users.length, monthKey });
}
