export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CreditsProvider } from "@/components/credit-balance";
import { getCurrentUser } from "@/lib/auth";
import { getBalance } from "@shotwise/credits";
import { queries, getDb } from "@shotwise/db";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  let balance = 0;
  let monthlyRefillActive = false;
  try {
    balance = await getBalance(user.id);
    const dbUser = await queries.getUserById(getDb(), user.id);
    monthlyRefillActive = dbUser?.monthlyRefillActive ?? false;
  } catch {
    // First-time signup race / DB unavailable: leave defaults
  }

  return (
    <CreditsProvider initialBalance={balance} initialActive={monthlyRefillActive}>
      <AppShell>{children}</AppShell>
    </CreditsProvider>
  );
}
