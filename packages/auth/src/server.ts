/**
 * Better-Auth server instance.
 *
 * Uses the Postgres pool from `@shotwise/db` via the drizzleAdapter, configures
 * the magic-link plugin to send via Resend, and runs a user.create.after hook
 * to grant the signup trial credits.
 */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { getDb, accounts, sessions, users, verifications } from "@shotwise/db";
import { grantSignupTrial } from "@shotwise/credits";
import { sendMagicLink } from "./email.js";

function buildAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("[@shotwise/auth] BETTER_AUTH_SECRET is not set");

  const baseURL = process.env.BETTER_AUTH_URL ?? process.env.APP_URL ?? "http://localhost:3000";
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

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
    emailAndPassword: { enabled: false },
    socialProviders:
      googleClientId && googleClientSecret
        ? { google: { clientId: googleClientId, clientSecret: googleClientSecret } }
        : undefined,
    plugins: [
      magicLink({
        async sendMagicLink({ email, url }) {
          await sendMagicLink({ to: email, url });
        },
      }),
    ],
    databaseHooks: {
      user: {
        create: {
          after: async (user: { id: string }) => {
            try {
              await grantSignupTrial(user.id);
            } catch (err) {
              // Don't block signup if trial grant fails; cron will pick it up
              // eslint-disable-next-line no-console
              console.error("[auth] signup trial grant failed:", err);
            }
          },
        },
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
