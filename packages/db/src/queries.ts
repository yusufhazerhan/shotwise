/**
 * Typed query helpers, scoped per domain.
 *
 * Each helper takes the `Database` instance so callers can stay testable
 * (pass a test DB) without coupling to `getDb()`.
 */
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import type { Database } from "./client.js";
import {
  creditLedger,
  exportJobs,
  projects,
  screenshots,
  users,
  webhooksLog,
  type NewExportJob,
  type NewProject,
  type NewScreenshot,
  type NewUser,
} from "./schema.js";

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getUserById(db: Database, id: string) {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0];
}

export async function getUserByEmail(db: Database, email: string) {
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0];
}

export async function activateMonthlyRefill(db: Database, userId: string) {
  await db
    .update(users)
    .set({ monthlyRefillActive: true, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function setPaddleCustomerId(db: Database, userId: string, paddleCustomerId: string) {
  await db
    .update(users)
    .set({ paddleCustomerId, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function listUsersWithActiveRefill(db: Database) {
  return db.select().from(users).where(eq(users.monthlyRefillActive, true));
}

// ─── Projects ────────────────────────────────────────────────────────────────

export async function createProject(db: Database, input: NewProject) {
  const rows = await db.insert(projects).values(input).returning();
  return rows[0]!;
}

export async function getProjectById(db: Database, id: string, userId: string) {
  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .limit(1);
  return rows[0];
}

export async function listProjects(db: Database, userId: string) {
  return db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.updatedAt));
}

export async function updateProject(
  db: Database,
  id: string,
  userId: string,
  patch: Partial<Pick<NewProject, "name" | "appMetadata" | "config" | "mode">>
) {
  const rows = await db
    .update(projects)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .returning();
  return rows[0];
}

export async function deleteProject(db: Database, id: string, userId: string) {
  await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, userId)));
}

// ─── Screenshots ─────────────────────────────────────────────────────────────

export async function createScreenshot(db: Database, input: NewScreenshot) {
  const rows = await db.insert(screenshots).values(input).returning();
  return rows[0]!;
}

export async function listScreenshots(db: Database, projectId: string) {
  return db
    .select()
    .from(screenshots)
    .where(eq(screenshots.projectId, projectId))
    .orderBy(asc(screenshots.order));
}

export async function getScreenshotById(db: Database, id: string) {
  const rows = await db.select().from(screenshots).where(eq(screenshots.id, id)).limit(1);
  return rows[0];
}

export async function updateScreenshot(
  db: Database,
  id: string,
  patch: Partial<NewScreenshot>
) {
  const rows = await db
    .update(screenshots)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(screenshots.id, id))
    .returning();
  return rows[0];
}

export async function deleteScreenshot(db: Database, id: string) {
  await db.delete(screenshots).where(eq(screenshots.id, id));
}

export async function setScreenshotsOrder(
  db: Database,
  projectId: string,
  order: { id: string; order: number }[]
) {
  await db.transaction(async (tx) => {
    for (const entry of order) {
      await tx
        .update(screenshots)
        .set({ order: entry.order, updatedAt: new Date() })
        .where(and(eq(screenshots.id, entry.id), eq(screenshots.projectId, projectId)));
    }
  });
}

// ─── Export jobs ─────────────────────────────────────────────────────────────

export async function createExportJob(db: Database, input: NewExportJob) {
  const rows = await db.insert(exportJobs).values(input).returning();
  return rows[0]!;
}

export async function getExportJobById(db: Database, id: string) {
  const rows = await db.select().from(exportJobs).where(eq(exportJobs.id, id)).limit(1);
  return rows[0];
}

export async function updateExportJob(
  db: Database,
  id: string,
  patch: Partial<NewExportJob>
) {
  const rows = await db
    .update(exportJobs)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(exportJobs.id, id))
    .returning();
  return rows[0];
}

export async function listExpiredExportJobs(db: Database, now: Date) {
  return db
    .select()
    .from(exportJobs)
    .where(and(eq(exportJobs.status, "succeeded"), lte(exportJobs.expiresAt, now)));
}

// ─── Credit ledger ───────────────────────────────────────────────────────────

export async function getCreditBalance(db: Database, userId: string): Promise<number> {
  const result = await db
    .select({ balance: sql<number>`COALESCE(SUM(${creditLedger.amount}), 0)::int` })
    .from(creditLedger)
    .where(eq(creditLedger.userId, userId));
  return result[0]?.balance ?? 0;
}

export async function listCreditLedger(db: Database, userId: string, limit = 50) {
  return db
    .select()
    .from(creditLedger)
    .where(eq(creditLedger.userId, userId))
    .orderBy(desc(creditLedger.createdAt))
    .limit(limit);
}

export async function userHasReceivedRefillThisMonth(
  db: Database,
  userId: string,
  monthStart: Date
) {
  const rows = await db
    .select({ id: creditLedger.id })
    .from(creditLedger)
    .where(
      and(
        eq(creditLedger.userId, userId),
        eq(creditLedger.reason, "monthly_refill"),
        gte(creditLedger.createdAt, monthStart)
      )
    )
    .limit(1);
  return rows.length > 0;
}

// ─── Webhook log ─────────────────────────────────────────────────────────────

export async function isWebhookProcessed(db: Database, source: string, eventId: string) {
  const rows = await db
    .select({ id: webhooksLog.id })
    .from(webhooksLog)
    .where(and(eq(webhooksLog.source, source), eq(webhooksLog.eventId, eventId)))
    .limit(1);
  return rows.length > 0;
}

export async function recordWebhook(
  db: Database,
  source: string,
  eventId: string,
  eventType: string,
  payload: unknown
) {
  await db.insert(webhooksLog).values({
    source,
    eventId,
    eventType,
    payload: payload as Record<string, unknown>,
    processedAt: new Date(),
  });
}
