import type { Config } from "drizzle-kit";

const url = process.env.DATABASE_URL;
if (!url && process.env.NODE_ENV !== "test") {
  // Soft fail at config-load time — `db:push` will surface a clear error.
  // eslint-disable-next-line no-console
  console.warn("[drizzle.config] DATABASE_URL is not set");
}

export default {
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: url ?? "postgres://shotwise:shotwise@localhost:5432/shotwise",
  },
  strict: true,
  verbose: true,
} satisfies Config;
