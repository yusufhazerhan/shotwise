import { ApiError, defineRoute } from "@/lib/api-handler";
import { getDb, queries } from "@shotwise/db";

export const runtime = "nodejs";

export const GET = defineRoute({ auth: true }, async ({ user, params }) => {
  const job = await queries.getExportJobById(getDb(), params.jobId!);
  if (!job || job.userId !== user.id) throw new ApiError(404, "Job not found");
  return {
    id: job.id,
    status: job.status,
    progress: job.progress,
    zipKey: job.zipKey,
    languages: job.languages,
    creditsDebited: job.creditsDebited,
    errorMessage: job.errorMessage,
    expiresAt: job.expiresAt,
  };
});
