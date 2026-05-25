import { defineRoute } from "@/lib/api-handler";
import { getDb, queries } from "@shotwise/db";
import { getBalance, hasLifetimeAccess } from "@shotwise/credits";

export const runtime = "nodejs";

export const GET = defineRoute({ auth: true }, async ({ user }) => {
  const db = getDb();
  const [dbUser, balance, lifetimeActive] = await Promise.all([
    queries.getUserById(db, user.id),
    getBalance(user.id, db),
    hasLifetimeAccess(user.id, db),
  ]);
  return {
    id: user.id,
    email: user.email,
    lifetimeActive: lifetimeActive || (dbUser?.monthlyRefillActive ?? false),
    balance,
  };
});
