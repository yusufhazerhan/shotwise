import { NextResponse } from "next/server";
import { ApiError, defineRoute } from "@/lib/api-handler";
import { getDb, queries } from "@shotwise/db";
import { BUCKETS, getSignedDownloadUrl } from "@shotwise/storage";

export const runtime = "nodejs";

export const GET = defineRoute({ auth: true }, async ({ user, params }) => {
  const job = await queries.getExportJobById(getDb(), params.jobId!);
  if (!job || job.userId !== user.id) throw new ApiError(404, "Job not found");
  if (job.status !== "succeeded" || !job.zipKey) {
    throw new ApiError(409, `Job is ${job.status}`);
  }
  const url = await getSignedDownloadUrl({
    bucket: BUCKETS.exports(),
    key: job.zipKey,
    expiresIn: 60 * 60,
  });
  return NextResponse.redirect(url, 302);
});
