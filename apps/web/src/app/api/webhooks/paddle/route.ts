import { NextResponse, type NextRequest } from "next/server";
import { getDb, queries } from "@shotwise/db";
import { toPurchaseEvent, verifyAndParse } from "@shotwise/billing";
import { grantPurchase } from "@shotwise/credits";

export const runtime = "nodejs";

/**
 * Paddle webhook receiver.
 *
 * - Verifies signature against PADDLE_WEBHOOK_SECRET
 * - Logs every event (idempotent)
 * - On transaction.completed: credits user + activates monthly refill (starter only)
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("paddle-signature") ?? req.headers.get("Paddle-Signature");

  let event;
  try {
    event = await verifyAndParse(body, signature);
  } catch (err) {
    return NextResponse.json(
      { error: "invalid_signature", detail: err instanceof Error ? err.message : "unknown" },
      { status: 401 }
    );
  }

  const db = getDb();

  if (await queries.isWebhookProcessed(db, "paddle", event.eventId)) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const purchase = toPurchaseEvent(event);
  if (!purchase) {
    await queries.recordWebhook(db, "paddle", event.eventId, event.eventType, event.data);
    return NextResponse.json({ ok: true, ignored: true });
  }

  // Apply credits
  await grantPurchase({
    userId: purchase.userId,
    kind: purchase.kind,
    paddleEventId: purchase.eventId,
  });

  // Activate monthly refill on starter pack
  if (purchase.kind === "starter_pack") {
    await queries.activateMonthlyRefill(db, purchase.userId);
  }
  if (purchase.paddleCustomerId) {
    await queries.setPaddleCustomerId(db, purchase.userId, purchase.paddleCustomerId);
  }

  await queries.recordWebhook(db, "paddle", event.eventId, event.eventType, event.data);
  return NextResponse.json({ ok: true });
}
