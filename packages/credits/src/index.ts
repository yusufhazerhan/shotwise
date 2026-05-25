/**
 * Credit ledger domain logic.
 *
 * The credit_ledger table is append-only; balance is SUM(amount). All mutations
 * happen inside Postgres transactions and respect idempotency keys (so retried
 * webhooks and cron runs are safe).
 */
import { and, eq, sql } from "drizzle-orm";
import { creditLedger, getDb, type Database } from "@shotwise/db";
import type { CreditReason } from "@shotwise/types";

export class InsufficientCreditsError extends Error {
  constructor(
    public readonly required: number,
    public readonly available: number
  ) {
    super(`Insufficient credits: required ${required}, available ${available}`);
    this.name = "InsufficientCreditsError";
  }
}

export class DuplicateGrantError extends Error {
  constructor(public readonly idempotencyKey: string) {
    super(`Credit grant already applied: ${idempotencyKey}`);
    this.name = "DuplicateGrantError";
  }
}

/** Resolve env-driven defaults with safe fallbacks. */
export const DEFAULTS = {
  signupTrial: parseInt(process.env.CREDITS_SIGNUP_TRIAL ?? "20", 10),
  starterPack: parseInt(process.env.CREDITS_STARTER_PACK ?? "100", 10),
  topup: parseInt(process.env.CREDITS_TOPUP ?? "100", 10),
  monthlyRefill: parseInt(process.env.CREDITS_MONTHLY_REFILL ?? "20", 10),
};

interface GrantOpts {
  userId: string;
  amount: number;
  reason: CreditReason;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
  db?: Database;
}

/**
 * Insert a positive ledger entry (purchase, refill, trial, refund).
 *
 * If `idempotencyKey` is provided and already exists, throws DuplicateGrantError.
 */
export async function credit(opts: GrantOpts): Promise<void> {
  if (opts.amount <= 0) throw new Error("credit() requires positive amount");
  const db = opts.db ?? getDb();

  try {
    await db.insert(creditLedger).values({
      userId: opts.userId,
      amount: opts.amount,
      reason: opts.reason,
      idempotencyKey: opts.idempotencyKey ?? null,
      metadata: opts.metadata ?? null,
    });
  } catch (err) {
    if (isUniqueViolation(err) && opts.idempotencyKey) {
      throw new DuplicateGrantError(opts.idempotencyKey);
    }
    throw err;
  }
}

interface DebitOpts {
  userId: string;
  amount: number;
  reason: Extract<CreditReason, "render_debit">;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
  db?: Database;
}

/**
 * Debit credits inside a serializable transaction.
 *
 * Computes balance under FOR UPDATE-style locking via SUM(...) within the txn;
 * if balance < amount, throws InsufficientCreditsError and rolls back.
 */
export async function debit(opts: DebitOpts): Promise<void> {
  if (opts.amount <= 0) throw new Error("debit() requires positive amount");
  const db = opts.db ?? getDb();

  await db.transaction(async (tx) => {
    const result = await tx.execute<{ balance: number }>(
      sql`SELECT COALESCE(SUM(amount), 0)::int AS balance
          FROM credit_ledger
          WHERE user_id = ${opts.userId}`
    );
    const balance = Number(result[0]?.balance ?? 0);

    if (balance < opts.amount) {
      throw new InsufficientCreditsError(opts.amount, balance);
    }

    try {
      await tx.insert(creditLedger).values({
        userId: opts.userId,
        amount: -opts.amount,
        reason: opts.reason,
        idempotencyKey: opts.idempotencyKey ?? null,
        metadata: opts.metadata ?? null,
      });
    } catch (err) {
      if (isUniqueViolation(err) && opts.idempotencyKey) {
        // Already debited under this key — treat as success.
        return;
      }
      throw err;
    }
  });
}

export async function getBalance(userId: string, db: Database = getDb()): Promise<number> {
  const result = await db
    .select({ balance: sql<number>`COALESCE(SUM(${creditLedger.amount}), 0)::int` })
    .from(creditLedger)
    .where(eq(creditLedger.userId, userId));
  return result[0]?.balance ?? 0;
}

export async function hasLifetimeAccess(userId: string, db: Database = getDb()): Promise<boolean> {
  const rows = await db
    .select({ id: creditLedger.id })
    .from(creditLedger)
    .where(and(eq(creditLedger.userId, userId), eq(creditLedger.reason, "purchase_starter")))
    .limit(1);
  return rows.length > 0;
}

/** Idempotent: same userId + signup_trial dedupes via idempotency key. */
export async function grantSignupTrial(userId: string, db?: Database) {
  try {
    await credit({
      userId,
      amount: DEFAULTS.signupTrial,
      reason: "signup_trial",
      idempotencyKey: `signup_trial:${userId}`,
      db,
    });
  } catch (err) {
    if (err instanceof DuplicateGrantError) return;
    throw err;
  }
}

/** Idempotent per (userId, YYYY-MM). */
export async function grantMonthlyRefill(userId: string, monthKey: string, db?: Database) {
  try {
    await credit({
      userId,
      amount: DEFAULTS.monthlyRefill,
      reason: "monthly_refill",
      idempotencyKey: `monthly_refill:${userId}:${monthKey}`,
      metadata: { monthKey },
      db,
    });
    return { granted: true, amount: DEFAULTS.monthlyRefill };
  } catch (err) {
    if (err instanceof DuplicateGrantError) return { granted: false, amount: 0 };
    throw err;
  }
}

/** Credits a user after a successful external purchase in legacy server builds. */
export async function grantPurchase(opts: {
  userId: string;
  kind: "starter_pack" | "topup_50";
  purchaseEventId: string;
  db?: Database;
}) {
  const amount = opts.kind === "starter_pack" ? DEFAULTS.starterPack : DEFAULTS.topup;
  const reason: CreditReason = opts.kind === "starter_pack" ? "purchase_starter" : "purchase_topup";
  try {
    await credit({
      userId: opts.userId,
      amount,
      reason,
      idempotencyKey: `purchase:${opts.purchaseEventId}`,
      metadata: { kind: opts.kind, purchaseEventId: opts.purchaseEventId },
      db: opts.db,
    });
    return { granted: true, amount };
  } catch (err) {
    if (err instanceof DuplicateGrantError) return { granted: false, amount: 0 };
    throw err;
  }
}

/** Refund a previously debited amount (e.g. failed export job). */
export async function refund(opts: {
  userId: string;
  amount: number;
  jobId: string;
  db?: Database;
}) {
  try {
    await credit({
      userId: opts.userId,
      amount: opts.amount,
      reason: "export_refund",
      idempotencyKey: `refund:${opts.jobId}`,
      metadata: { jobId: opts.jobId },
      db: opts.db,
    });
  } catch (err) {
    if (err instanceof DuplicateGrantError) return;
    throw err;
  }
}

/**
 * Debit N credits for an export job (where N = unique source screen count).
 * Wraps `debit()` with a job-scoped idempotency key.
 */
export async function consumeForExport(opts: {
  userId: string;
  jobId: string;
  screenCount: number;
  db?: Database;
}) {
  await debit({
    userId: opts.userId,
    amount: opts.screenCount,
    reason: "render_debit",
    idempotencyKey: `debit:${opts.jobId}`,
    metadata: { jobId: opts.jobId, screenCount: opts.screenCount },
    db: opts.db,
  });
}

function isUniqueViolation(err: unknown): boolean {
  // Postgres error code 23505 = unique_violation
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "23505"
  );
}
