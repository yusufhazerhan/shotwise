export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CreditsProvider } from "@/components/credit-balance";
import { getCurrentUser } from "@/lib/auth";
import { getBalance, hasLifetimeAccess } from "@shotwise/credits";
import { queries, getDb } from "@shotwise/db";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/studio");

  let balance = 0;
  let lifetimeActive = false;
  try {
    const db = getDb();
    const [nextBalance, dbUser, paidLifetime] = await Promise.all([
      getBalance(user.id, db),
      queries.getUserById(db, user.id),
      hasLifetimeAccess(user.id, db),
    ]);
    balance = nextBalance;
    lifetimeActive = paidLifetime || (dbUser?.monthlyRefillActive ?? false);
  } catch {
    // First-time signup race / DB unavailable: leave defaults
  }

  return (
    <CreditsProvider initialBalance={balance} initialLifetimeActive={lifetimeActive}>
      <AppShell>{children}</AppShell>
    </CreditsProvider>
  );
}
