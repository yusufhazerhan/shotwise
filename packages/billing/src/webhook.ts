import { EventName, type EventEntity } from "@paddle/paddle-node-sdk";
import { getPaddle } from "./client.js";
import { priceIdToKind } from "./products.js";
import type { PaddleProductKind } from "@shotwise/types";

export { EventName } from "@paddle/paddle-node-sdk";

/**
 * Verify Paddle webhook signature against the request body + header.
 * Throws if invalid.
 *
 * `body` must be the raw request body string (Next.js: `await req.text()`).
 */
export async function verifyAndParse(
  body: string,
  signatureHeader: string | null
): Promise<EventEntity> {
  if (!signatureHeader) throw new Error("[webhook] missing Paddle-Signature header");
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) throw new Error("[webhook] PADDLE_WEBHOOK_SECRET not set");
  const paddle = getPaddle();
  const event = paddle.webhooks.unmarshal(body, secret, signatureHeader);
  if (!event) throw new Error("[webhook] failed to parse Paddle event");
  return event;
}

export interface PurchaseEvent {
  eventId: string;
  eventType: string;
  userId: string;
  kind: PaddleProductKind;
  paddleCustomerId: string | null;
  amountUsd: number | null;
}

/**
 * Narrow a verified Paddle event into our domain shape.
 * Returns null for events we don't care about (e.g. subscription.created).
 */
export function toPurchaseEvent(event: EventEntity): PurchaseEvent | null {
  if (event.eventType !== EventName.TransactionCompleted) return null;
  const data = event.data as unknown as {
    id: string;
    customer_id?: string | null;
    customerId?: string | null;
    items?: Array<{ price?: { id?: string } | null }>;
    details?: { totals?: { total?: string | number } };
    custom_data?: { userId?: string; kind?: PaddleProductKind } | null;
    customData?: { userId?: string; kind?: PaddleProductKind } | null;
  };

  const custom = data.customData ?? data.custom_data ?? null;
  if (!custom?.userId) return null;

  // Prefer the kind we stored, else infer from price id
  let kind: PaddleProductKind | null = custom.kind ?? null;
  if (!kind) {
    for (const item of data.items ?? []) {
      const priceId = item?.price?.id;
      if (!priceId) continue;
      kind = priceIdToKind(priceId);
      if (kind) break;
    }
  }
  if (!kind) return null;

  const totalRaw = data.details?.totals?.total;
  const amountUsd =
    typeof totalRaw === "string" || typeof totalRaw === "number" ? Number(totalRaw) / 100 : null;

  return {
    eventId: event.eventId,
    eventType: event.eventType,
    userId: custom.userId,
    kind,
    paddleCustomerId: data.customer_id ?? data.customerId ?? null,
    amountUsd,
  };
}
