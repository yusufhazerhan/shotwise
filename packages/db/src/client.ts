import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

let _client: ReturnType<typeof postgres> | undefined;
let _db: ReturnType<typeof drizzle<typeof schema>> | undefined;

/**
 * Lazily create a singleton Postgres + Drizzle client.
 *
 * `DATABASE_URL` is read at first call (not module load) so that test
 * environments and Next.js route handlers can set it dynamically.
 */
export function getDb() {
  if (_db) return _db;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("[@shotwise/db] DATABASE_URL is not set");
  }

  _client = postgres(url, {
    max: 10,
    idle_timeout: 30,
    prepare: false, // recommended for serverless / Next.js
  });
  _db = drizzle(_client, { schema });
  return _db;
}

/** For tests / scripts that need a hard shutdown. */
export async function closeDb() {
  if (_client) {
    await _client.end({ timeout: 5 });
    _client = undefined;
    _db = undefined;
  }
}

export type Database = ReturnType<typeof getDb>;
