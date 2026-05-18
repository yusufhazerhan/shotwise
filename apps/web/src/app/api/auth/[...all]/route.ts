import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@shotwise/auth";

export const runtime = "nodejs";
// Disable build-time route data collection — Better-Auth needs runtime env.
export const dynamic = "force-dynamic";

// Lazily instantiate the handler on first request so `next build` doesn't
// blow up when env vars are missing in the build container.
let cached: ReturnType<typeof toNextJsHandler> | undefined;
function handlers() {
  if (!cached) cached = toNextJsHandler(getAuth());
  return cached;
}

export async function GET(req: Request) {
  return handlers().GET(req);
}
export async function POST(req: Request) {
  return handlers().POST(req);
}
