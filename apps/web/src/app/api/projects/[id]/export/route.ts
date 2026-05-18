import { z } from "zod";
import { ApiError, defineRoute } from "@/lib/api-handler";
import { getDb, queries } from "@shotwise/db";
import { consumeForExport, InsufficientCreditsError, getBalance } from "@shotwise/credits";
import { LOCALES } from "@shotwise/types";
import { runExportJob } from "@/lib/export/run-export-job";

export const runtime = "nodejs";
export const maxDuration = 300;

const Body = z.object({
  languages: z.array(z.enum(LOCALES)).min(1),
});

export const POST = defineRoute({ auth: true, body: Body }, async ({ user, body, params }) => {
  const db = getDb();
  const project = await queries.getProjectById(db, params.id!, user.id);
  if (!project) throw new ApiError(404, "Project not found");

  const screenshots = await queries.listScreenshots(db, project.id);
  const uploaded = screenshots.filter((s) => s.status === "uploaded" && s.rawKey);
  if (uploaded.length === 0) throw new ApiError(400, "Upload screenshots before exporting");

  const cost = uploaded.length; // 1 credit per source screen, across all locales

  const job = await queries.createExportJob(db, {
    projectId: project.id,
    userId: user.id,
    status: "pending",
    creditsDebited: cost,
    languages: body.languages,
    progress: { total: uploaded.length * body.languages.length, done: 0 },
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

  return { jobId: job.id, screenCount: cost, languages: body.languages };
});
