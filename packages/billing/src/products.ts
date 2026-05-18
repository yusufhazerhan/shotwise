import type { PaddleProduct, PaddleProductKind } from "@shotwise/types";

/**
 * Logical product catalog. Paddle price IDs come from env so the same code
 * works against sandbox and production accounts.
 */
export const PRODUCTS: Record<PaddleProductKind, PaddleProduct> = {
  starter_pack: {
    kind: "starter_pack",
    priceEnvVar: "PADDLE_PRICE_STARTER",
    displayUsd: 4.99,
    creditsGranted: parseInt(process.env.CREDITS_STARTER_PACK ?? "100", 10),
    activatesMonthlyRefill: true,
    label: "Starter pack",
  },
  topup_50: {
    kind: "topup_50",
    priceEnvVar: "PADDLE_PRICE_TOPUP",
    displayUsd: 2.99,
    creditsGranted: parseInt(process.env.CREDITS_TOPUP ?? "50", 10),
    activatesMonthlyRefill: false,
    label: "Top up 50",
  },
};

export function resolvePriceId(kind: PaddleProductKind): string {
  const product = PRODUCTS[kind];
  const id = process.env[product.priceEnvVar];
  if (!id) {
    throw new Error(`[@shotwise/billing] env var ${product.priceEnvVar} is not set`);
  }
  return id;
}

export function priceIdToKind(priceId: string): PaddleProductKind | null {
  if (priceId === process.env.PADDLE_PRICE_STARTER) return "starter_pack";
  if (priceId === process.env.PADDLE_PRICE_TOPUP) return "topup_50";
  return null;
}
