/**
 * Shotwise database schema (Drizzle / Postgres).
 *
 * Includes Better-Auth required tables (users, sessions, accounts, verifications)
 * and Shotwise domain tables (projects, screenshots, export_jobs, credit_ledger,
 * payment metadata, webhooks_log).
 */
import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  pgEnum,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────────────────────
// Better-Auth tables (https://www.better-auth.com/docs/concepts/database)
// ─────────────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Better-Auth issues string ids
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  name: text("name"),
  image: text("image"),

  // Shotwise extensions
  monthlyRefillActive: boolean("monthly_refill_active").notNull().default(false),
  paymentCustomerId: text("payment_customer_id"),
  signupIp: text("signup_ip"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("sessions_user_idx").on(t.userId),
  })
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    providerIdx: uniqueIndex("accounts_provider_idx").on(t.providerId, t.accountId),
  })
);

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Shotwise domain
// ─────────────────────────────────────────────────────────────────────────────

export const projectModeEnum = pgEnum("project_mode", ["manual"]);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull().default("Untitled project"),
    mode: projectModeEnum("mode").notNull().default("manual"),
    appMetadata: jsonb("app_metadata").$type<Record<string, unknown>>().default({}),
    config: jsonb("config").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("projects_user_idx").on(t.userId),
  })
);

export const screenshotStatusEnum = pgEnum("screenshot_status", [
  "pending_upload",
  "uploaded",
  "deleted",
]);

export const screenshots = pgTable(
  "screenshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    order: integer("order").notNull().default(0),
    status: screenshotStatusEnum("status").notNull().default("pending_upload"),

    /** S3 key for raw upload (deleted post-export, kept for re-export only if needed). */
    rawKey: text("raw_key"),
    rawSize: integer("raw_size"),
    rawMime: text("raw_mime"),

    /** Localized per-locale: { en: {title, accent}, tr: {title, accent}, ... } */
    localized: jsonb("localized").$type<Record<string, unknown>>().default({}),

    /** Draft metadata from legacy screenshot analysis or importer flows. */
    aiAnalysis: jsonb("ai_analysis").$type<Record<string, unknown>>(),

    /** Per-screen render overrides (font, colors, etc.). */
    renderOverrides: jsonb("render_overrides").$type<Record<string, unknown>>().default({}),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    projectIdx: index("screenshots_project_idx").on(t.projectId),
  })
);

export const exportJobStatusEnum = pgEnum("export_job_status", [
  "pending",
  "running",
  "succeeded",
  "failed",
  "refunded",
]);

export const exportJobs = pgTable(
  "export_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: exportJobStatusEnum("status").notNull().default("pending"),

    /** Screen-count debited at job start. Used for refund if failed. */
    creditsDebited: integer("credits_debited").notNull().default(0),

    languages: jsonb("languages").$type<string[]>().notNull().default([]),
    devicePresetIds: jsonb("device_preset_ids").$type<string[]>().notNull().default([]),
    includeFeatureGraphic: boolean("include_feature_graphic").notNull().default(false),
    selectionMatrix: jsonb("selection_matrix").$type<Record<string, unknown>>(),

    progress: jsonb("progress").$type<Record<string, unknown>>().default({}),
    /** ZIP S3 key once succeeded. */
    zipKey: text("zip_key"),
    /** When the ZIP becomes eligible for cleanup (now + EXPORT_TTL_HOURS). */
    expiresAt: timestamp("expires_at", { withTimezone: true }),

    errorMessage: text("error_message"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("export_jobs_user_idx").on(t.userId),
    projectIdx: index("export_jobs_project_idx").on(t.projectId),
    expiresIdx: index("export_jobs_expires_idx").on(t.expiresAt),
  })
);

export const creditReasonEnum = pgEnum("credit_reason", [
  "signup_trial",
  "purchase_starter",
  "purchase_topup",
  "monthly_refill",
  "render_debit",
  "export_refund",
  "manual_grant",
]);

export const creditLedger = pgTable(
  "credit_ledger",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    /** Positive = credit, negative = debit. Sum across user = balance. */
    amount: integer("amount").notNull(),
    reason: creditReasonEnum("reason").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),

    /** For idempotency on retries (e.g. webhook id, job id). NULL = no dedupe. */
    idempotencyKey: text("idempotency_key"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("credit_ledger_user_idx").on(t.userId),
    idemIdx: uniqueIndex("credit_ledger_idem_idx")
      .on(t.idempotencyKey)
      .where(sql`${t.idempotencyKey} IS NOT NULL`),
  })
);

export const webhooksLog = pgTable(
  "webhooks_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    source: text("source").notNull(),
    eventId: text("event_id").notNull(),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload").notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    sourceEventIdx: uniqueIndex("webhooks_source_event_idx").on(t.source, t.eventId),
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// Inferred row types
// ─────────────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Screenshot = typeof screenshots.$inferSelect;
export type NewScreenshot = typeof screenshots.$inferInsert;
export type ExportJob = typeof exportJobs.$inferSelect;
export type NewExportJob = typeof exportJobs.$inferInsert;
export type CreditLedgerRow = typeof creditLedger.$inferSelect;
export type NewCreditLedgerRow = typeof creditLedger.$inferInsert;
