/**
 * Client-side helper for uploading a screenshot to S3 via signed URL.
 * Returns the created screenshot row (id, key) so the caller can refresh state.
 */
export async function uploadScreenshot(opts: {
  projectId: string;
  file: File;
  order: number;
}) {
  // 1) Request a signed URL
  const sigRes = await fetch(`/api/projects/${opts.projectId}/screenshots/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: opts.file.name,
      mime: opts.file.type as "image/png" | "image/jpeg" | "image/webp",
      order: opts.order,
      size: opts.file.size,
    }),
  });
  if (!sigRes.ok) {
    throw new Error(`Upload URL request failed: ${sigRes.status}`);
  }
  const { screenshotId, uploadUrl } = (await sigRes.json()) as {
    screenshotId: string;
    uploadUrl: string;
    key: string;
  };

  // 2) PUT the file directly to S3 (MinIO in dev)
  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": opts.file.type },
    body: opts.file,
  });
  if (!putRes.ok) {
    throw new Error(`S3 PUT failed: ${putRes.status}`);
  }

  // 3) Confirm
  const confirm = await fetch(`/api/projects/${opts.projectId}/screenshots`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ screenshotId, size: opts.file.size }),
  });
  if (!confirm.ok) {
    throw new Error(`Confirm failed: ${confirm.status}`);
  }
  return { screenshotId };
}
