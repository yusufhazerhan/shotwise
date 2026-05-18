import { getPaddle } from "./client.js";
import { resolvePriceId } from "./products.js";
import type { PaddleProductKind } from "@shotwise/types";

export interface CreateCheckoutInput {
  userId: string;
  email: string;
  kind: PaddleProductKind;
  /** Optional: existing Paddle customer id. If absent, Paddle will collect email at checkout. */
  paddleCustomerId?: string | null;
  successUrl: string;
}

export interface CheckoutTransaction {
  transactionId: string;
  checkoutUrl: string | null;
}

/**
 * Create a Paddle transaction that the frontend opens with Paddle.js
 * (`Paddle.Checkout.open({ transactionId })`) for an inline overlay.
 *
 * `customData` rides the webhook so we can map back to (userId, kind).
 */
export async function createCheckoutTransaction(
  input: CreateCheckoutInput
): Promise<CheckoutTransaction> {
  const paddle = getPaddle();
  const priceId = resolvePriceId(input.kind);

  // Paddle's `create()` accepts customerId; if we don't have one yet, look up
  // or create by email so we can attribute future transactions to the same
  // customer record.
  let customerId = input.paddleCustomerId ?? null;
  if (!customerId) {
    try {
      // Try to find an existing customer by email
      const existing = paddle.customers.list({ email: [input.email] });
      const firstPage = await existing.next();
      const first = Array.isArray(firstPage) ? firstPage[0] : null;
      if (first?.id) {
        customerId = first.id;
      }
    } catch {
      // Listing might 404 or 422; fall through to create
    }
  }
  if (!customerId) {
    try {
      const created = await paddle.customers.create({ email: input.email });
      customerId = created.id;
    } catch {
      // If creation fails (e.g. customer already exists with that email),
      // leave customerId null and let checkout collect email.
      customerId = null;
    }
  }

  const tx = await paddle.transactions.create({
    items: [{ priceId, quantity: 1 }],
    customerId: customerId ?? undefined,
    customData: {
      userId: input.userId,
      kind: input.kind,
    },
    checkout: { url: input.successUrl },
  });

  return {
    transactionId: tx.id,
    checkoutUrl: tx.checkout?.url ?? null,
  };
}
