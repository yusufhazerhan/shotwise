/**
 * Typed Next.js route handler wrapper.
 *
 * - Authenticates via Better-Auth
 * - Validates body/query with Zod
 * - Surfaces errors as JSON with stable shape
 * - Captures unexpected errors to console (Sentry hook can be added later)
 */
import { NextResponse, type NextRequest } from "next/server";
import { z, type ZodSchema } from "zod";
import { getCurrentUser } from "./auth.js";

export interface RouteContext<Body, Query> {
  req: NextRequest;
  user: { id: string; email: string };
  body: Body;
  query: Query;
  params: Record<string, string>;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly extra?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface HandlerOpts<B extends ZodSchema | undefined, Q extends ZodSchema | undefined> {
  auth?: boolean;
  body?: B;
  query?: Q;
}

type Inferred<S> = S extends ZodSchema ? z.infer<S> : undefined;

export function defineRoute<
  B extends ZodSchema | undefined = undefined,
  Q extends ZodSchema | undefined = undefined,
>(
  opts: HandlerOpts<B, Q>,
  handler: (ctx: RouteContext<Inferred<B>, Inferred<Q>>) => Promise<unknown> | unknown
) {
  return async (req: NextRequest, segmentCtx: { params: Promise<Record<string, string>> }) => {
    try {
      const user = await getCurrentUser();
      if (opts.auth !== false && !user) {
        throw new ApiError(401, "Unauthorized", "unauthorized");
      }

      let body: unknown = undefined;
      if (opts.body) {
        try {
          body = await req.json();
        } catch {
          throw new ApiError(400, "Invalid JSON body", "bad_json");
        }
        const parsed = opts.body.safeParse(body);
        if (!parsed.success) {
          throw new ApiError(400, "Validation failed", "validation", {
            issues: parsed.error.issues,
          });
        }
        body = parsed.data;
      }

      let query: unknown = undefined;
      if (opts.query) {
        const obj = Object.fromEntries(req.nextUrl.searchParams);
        const parsed = opts.query.safeParse(obj);
        if (!parsed.success) {
          throw new ApiError(400, "Query validation failed", "validation", {
            issues: parsed.error.issues,
          });
        }
        query = parsed.data;
      }

      const params = (await segmentCtx.params) ?? {};

      const result = await handler({
        req,
        user: user ? { id: user.id, email: user.email } : ({} as { id: string; email: string }),
        body: body as Inferred<B>,
        query: query as Inferred<Q>,
        params,
      });

      if (result instanceof NextResponse) return result;
      if (result instanceof Response) return result;
      return NextResponse.json(result ?? { ok: true });
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json(
          { error: { code: err.code ?? "error", message: err.message, ...err.extra } },
          { status: err.status }
        );
      }
      // eslint-disable-next-line no-console
      console.error("[api-handler] unhandled:", err);
      return NextResponse.json(
        { error: { code: "internal", message: "Internal server error" } },
        { status: 500 }
      );
    }
  };
}
