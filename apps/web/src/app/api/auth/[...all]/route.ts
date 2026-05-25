import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@shotwise/auth";
import { getDb, queries } from "@shotwise/db";
import { assertAllowedLoginEmail, extractClientIp } from "@/lib/email-guard";

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
  const url = new URL(req.url);
  if (url.pathname.endsWith("/sign-in/email") || url.pathname.endsWith("/sign-up/email")) {
    const body = (await req.json()) as { email?: unknown };
    const email = typeof body.email === "string" ? body.email : "";
    const allowed = assertAllowedLoginEmail(email);
    if (!allowed.ok) {
      return Response.json({ error: { code: "blocked_email", message: allowed.message } }, { status: 400 });
    }

    if (url.pathname.endsWith("/sign-up/email")) {
      const db = getDb();
      const clientIp = extractClientIp(new Headers(req.headers));
      const existingUser = await queries.getUserByEmail(db, allowed.email);
      const maxSignupsPerIp = Number(process.env.MAX_SIGNUPS_PER_IP ?? 2);
      if (!existingUser && clientIp) {
        const totalForIp = await queries.countUsersBySignupIp(db, clientIp);
        if (totalForIp >= maxSignupsPerIp) {
          return Response.json(
            {
              error: {
                code: "ip_limit",
                message: "Too many signups came from this IP. Please use your existing account or try again later.",
              },
            },
            { status: 429 }
          );
        }
      }
      const response = await forwardAuthRequest(req, body, allowed.email);
      if (response.ok && clientIp) {
        const json = (await response.clone().json()) as { user?: { id?: string } };
        if (json.user?.id) {
          await queries.setUserSignupIp(db, json.user.id, clientIp);
        }
      }
      return response;
    }

    return forwardAuthRequest(req, body, allowed.email);
  }
  return handlers().POST(req);
}

function forwardAuthRequest(req: Request, body: Record<string, unknown>, email: string) {
  const headers = new Headers(req.headers);
  headers.delete("content-length");
  headers.set("content-type", "application/json");
  return handlers().POST(
    new Request(req.url, {
      method: req.method,
      headers,
      body: JSON.stringify({ ...body, email }),
    })
  );
}
