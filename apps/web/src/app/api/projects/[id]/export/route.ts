import { z } from "zod";
import { ApiError, defineRoute } from "@/lib/api-handler";
import { getDb, queries } from "@shotwise/db";
import { consumeForExport, InsufficientCreditsError, getBalance } from "@shotwise/credits";
import { LOCALES } from "@shotwise/types";
import { runExportJob } from "@/lib/export/run-export-job";
import { getExportPlan } from "@/lib/export-cost";
import { summarizeExportMatrix } from "@/lib/export-matrix";

export const runtime = "nodejs";
export const maxDuration = 300;

const Body = z.object({
  languages: z.array(z.enum(LOCALES)).min(1),
  devicePresetIds: z.array(z.string()).min(1).optional(),
  includeFeatureGraphic: z.boolean().optional(),
  selectionMatrix: z.record(z.record(z.record(z.enum(["on", "off", "locked"])))).optional(),
});

export const POST = defineRoute({ auth: true, body: Body }, async ({ user, body, params }) => {
  const db = getDb();
  const project = await queries.getProjectById(db, params.id!, user.id);
  if (!project) throw new ApiError(404, "Project not found");

  const screenshots = await queries.listScreenshots(db, project.id);
  const uploaded = screenshots.filter((s) => s.status === "uploaded" && s.rawKey);
  if (uploaded.length === 0) throw new ApiError(400, "Upload screenshots before exporting");

  const selectionSummary = body.selectionMatrix ? summarizeExportMatrix(body.selectionMatrix) : null;
  const plan = getExportPlan({
    screenCount: uploaded.length,
    languages: body.languages,
    devicePresetIds: body.devicePresetIds,
    includeFeatureGraphic: body.includeFeatureGraphic,
  });
  const cost = selectionSummary ? selectionSummary.total + (body.includeFeatureGraphic ? body.languages.length : 0) : plan.credits;

  const job = await queries.createExportJob(db, {
    projectId: project.id,
    userId: user.id,
    status: "pending",
    creditsDebited: cost,
    languages: body.languages,
    devicePresetIds: body.devicePresetIds ?? [],
    includeFeatureGraphic: body.includeFeatureGraphic ?? false,
    selectionMatrix: body.selectionMatrix ?? null,
    progress: { total: cost, done: 0 },
  });

  try {
    await consumeForExport({ userId: user.id, jobId: job.id, screenCount: cost });
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      await queries.updateExportJob(db, job.id, { status: "failed", errorMessage: "insufficient_credits" });
      const balance = await getBalance(user.id);
      throw new ApiError(402, "Insufficient credits", "insufficient_credits", {
        required: cost,
        balance,
        buyUrl: "/credits",
      });
    }
    throw err;
  }

  // Fire and (mostly) forget. We don't `await` the full job — return jobId
  // so the client can poll status. The function instance still keeps the
  // promise alive due to Next's serverless execution model (waitUntil-ish).
  runExportJob(job.id).catch((err) => {
    // eslint-disable-next-line no-console
    console.error("[export] background error", job.id, err);
  });

  return {
    jobId: job.id,
    screenCount: plan.screenCount,
    finalImageCount: selectionSummary ? selectionSummary.total + (body.includeFeatureGraphic ? body.languages.length : 0) : plan.finalImageCount,
    languages: body.languages,
    devicePresetIds: body.devicePresetIds ?? [],
    includeFeatureGraphic: body.includeFeatureGraphic ?? false,
  };
});
