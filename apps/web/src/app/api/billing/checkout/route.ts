import { z } from "zod";
import { defineRoute } from "@/lib/api-handler";
import { createCheckoutTransaction } from "@shotwise/billing";
import { getDb, queries } from "@shotwise/db";

export const runtime = "nodejs";

const Body = z.object({
  kind: z.enum(["starter_pack", "topup_50"]),
});

export const POST = defineRoute({ auth: true, body: Body }, async ({ user, body }) => {
  const db = getDb();
  const dbUser = await queries.getUserById(db, user.id);
  const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
  const tx = await createCheckoutTransaction({
    userId: user.id,
    email: user.email,
    kind: body.kind,
    paddleCustomerId: dbUser?.paddleCustomerId ?? null,
    successUrl: `${baseUrl}/credits?purchase=success`,
  });
  return tx;
});
