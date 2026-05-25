import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { middleware } from "./middleware";

describe("middleware", () => {
  it("redirects legacy account-backed routes to local Studio", () => {
    const res = middleware(new NextRequest("http://localhost/editor/project-1"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/studio");
  });

  it("redirects legacy routes even if a session cookie exists", () => {
    const req = new NextRequest("http://localhost/editor/project-1", {
      headers: { cookie: "better-auth.session_token=session-1" },
    });
    const res = middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/studio");
  });

  it("ignores public routes", () => {
    const res = middleware(new NextRequest("http://localhost/pricing"));
    expect(res.status).toBe(200);
  });
});
