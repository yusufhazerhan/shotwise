import { defineRoute } from "@/lib/api-handler";
import { getDb, queries } from "@shotwise/db";
import { getBalance } from "@shotwise/credits";

export const runtime = "nodejs";

export const GET = defineRoute({ auth: true }, async ({ user }) => {
  const db = getDb();
  const dbUser = await queries.getUserById(db, user.id);
  const balance = await getBalance(user.id, db);
  return {
    id: user.id,
    email: user.email,
    monthlyRefillActive: dbUser?.monthlyRefillActive ?? false,
    balance,
  };
});
