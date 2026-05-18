import { defineRoute } from "@/lib/api-handler";
import { getDb, queries } from "@shotwise/db";
import { getBalance } from "@shotwise/credits";

export const runtime = "nodejs";

export const GET = defineRoute({ auth: true }, async ({ user }) => {
  const db = getDb();
  const [balance, ledger, dbUser] = await Promise.all([
    getBalance(user.id, db),
    queries.listCreditLedger(db, user.id, 20),
    queries.getUserById(db, user.id),
  ]);
  return {
    balance,
    monthlyRefillActive: dbUser?.monthlyRefillActive ?? false,
    ledger,
  };
});
