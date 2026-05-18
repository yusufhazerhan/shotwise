/**
 * S3-compatible storage client (MinIO local, R2/Backblaze/AWS S3 in prod).
 *
 * Bucket names come from env (`S3_BUCKET_RAW`, `S3_BUCKET_EXPORTS`).
 * Use `getSignedUploadUrl()` so clients PUT directly to storage without
 * proxying bytes through the API.
 */
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let _client: S3Client | undefined;

export function getS3() {
  if (_client) return _client;

  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const region = process.env.S3_REGION ?? "us-east-1";

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("[@shotwise/storage] S3_ENDPOINT / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY required");
  }

  _client = new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
  });
  return _client;
}

export const BUCKETS = {
  raw: () => process.env.S3_BUCKET_RAW ?? "shotwise-raw",
  exports: () => process.env.S3_BUCKET_EXPORTS ?? "shotwise-exports",
};

export function keyForRawScreenshot(projectId: string, screenshotId: string, ext = "png") {
  return `projects/${projectId}/raw/${screenshotId}.${ext}`;
}

export function keyForExportPng(jobId: string, screenIndex: number, locale: string) {
  const padded = String(screenIndex + 1).padStart(2, "0");
  return `jobs/${jobId}/${locale}/${padded}.png`;
}

export function keyForExportZip(jobId: string) {
  return `jobs/${jobId}/shotwise-${jobId}.zip`;
}

export interface SignedUrlOpts {
  bucket: string;
  key: string;
  expiresIn?: number; // seconds
  contentType?: string;
}

export async function getSignedUploadUrl(opts: SignedUrlOpts): Promise<string> {
  const client = getS3();
  const cmd = new PutObjectCommand({
    Bucket: opts.bucket,
    Key: opts.key,
    ContentType: opts.contentType,
  });
  return getSignedUrl(client, cmd, { expiresIn: opts.expiresIn ?? 60 * 10 });
}

export async function getSignedDownloadUrl(opts: SignedUrlOpts): Promise<string> {
  const client = getS3();
  const cmd = new GetObjectCommand({ Bucket: opts.bucket, Key: opts.key });
  const internal = await getSignedUrl(client, cmd, { expiresIn: opts.expiresIn ?? 60 * 60 });

  // Rewrite endpoint for client-facing URLs if a public endpoint is configured
  // (useful when MinIO runs at minio:9000 internally but is exposed at s3.example.com).
  const publicEndpoint = process.env.S3_PUBLIC_ENDPOINT;
  const internalEndpoint = process.env.S3_ENDPOINT;
  if (publicEndpoint && internalEndpoint && publicEndpoint !== internalEndpoint) {
    return internal.replace(internalEndpoint, publicEndpoint);
  }
  return internal;
}

export interface PutObjectOpts {
  bucket: string;
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
}

export async function putObject(opts: PutObjectOpts) {
  const client = getS3();
  await client.send(
    new PutObjectCommand({
      Bucket: opts.bucket,
      Key: opts.key,
      Body: opts.body,
      ContentType: opts.contentType,
    })
  );
}

export async function getObject(bucket: string, key: string): Promise<Buffer> {
  const client = getS3();
  const out = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  if (!out.Body) throw new Error(`Object not found: ${bucket}/${key}`);
  // Body is a Readable stream in Node
  const chunks: Buffer[] = [];
  for await (const chunk of out.Body as AsyncIterable<Buffer>) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function objectExists(bucket: string, key: string): Promise<boolean> {
  const client = getS3();
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

export async function deleteObject(bucket: string, key: string) {
  const client = getS3();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export async function deletePrefix(bucket: string, prefix: string) {
  const client = getS3();
  let continuationToken: string | undefined;
  do {
    const list = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );
    const objects = (list.Contents ?? []).map((o) => ({ Key: o.Key! })).filter((o) => o.Key);
    if (objects.length > 0) {
      await client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: objects, Quiet: true },
        })
      );
    }
    continuationToken = list.IsTruncated ? list.NextContinuationToken : undefined;
  } while (continuationToken);
}
