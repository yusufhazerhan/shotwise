/**
 * Better-Auth server instance.
 *
 * Uses the Postgres pool from `@shotwise/db` via the drizzleAdapter, enables
 * email/password auth with required email verification for legacy API routes.
 */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb, accounts, sessions, users, verifications } from "@shotwise/db";
import { sendVerificationEmail } from "./email.js";

function buildAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("[@shotwise/auth] BETTER_AUTH_SECRET is not set");

  const baseURL = process.env.BETTER_AUTH_URL ?? process.env.APP_URL ?? "http://localhost:3000";
  return betterAuth({
    appName: "Shotwise",
    secret,
    baseURL,
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema: { user: users, session: sessions, account: accounts, verification: verifications },
    }),
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24, // refresh once per day
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      async sendVerificationEmail({ user, url }) {
        await sendVerificationEmail({
          to: user.email,
          url,
          name: user.name ?? undefined,
        });
      },
    },
  });
}

export type AuthInstance = ReturnType<typeof buildAuth>;

let _auth: AuthInstance | undefined;

export function getAuth(): AuthInstance {
  if (!_auth) _auth = buildAuth();
  return _auth;
}

export type Session = Awaited<ReturnType<AuthInstance["api"]["getSession"]>>;
