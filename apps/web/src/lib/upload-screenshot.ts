/**
 * Client-side helper for uploading a screenshot to S3 via signed URL.
 * Returns the created screenshot row (id, key) so the caller can refresh state.
 */
export async function uploadScreenshot(opts: {
  projectId: string;
  file: File;
  order: number;
}) {
  const form = new FormData();
  form.set("file", opts.file);
  form.set("order", String(opts.order));

  const res = await fetch(`/api/projects/${opts.projectId}/screenshots/upload-file`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    throw new Error(`Screenshot upload failed: ${res.status}`);
  }
  const { screenshotId } = (await res.json()) as { screenshotId: string };
  return { screenshotId };
}
