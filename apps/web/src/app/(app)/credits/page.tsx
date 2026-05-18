import { requireUser } from "@/lib/auth";
import { getDb, queries } from "@shotwise/db";
import { getBalance } from "@shotwise/credits";
import { CreditsView } from "./credits-view";

export default async function CreditsPage() {
  const user = await requireUser();
  const db = getDb();
  const [balance, ledger, dbUser] = await Promise.all([
    getBalance(user.id, db),
    queries.listCreditLedger(db, user.id, 20),
    queries.getUserById(db, user.id),
  ]);

  return (
    <CreditsView
      balance={balance}
      monthlyRefillActive={dbUser?.monthlyRefillActive ?? false}
      ledger={ledger.map((row) => ({
        id: row.id,
        amount: row.amount,
        reason: row.reason,
        createdAt: row.createdAt.toISOString(),
      }))}
    />
  );
}
