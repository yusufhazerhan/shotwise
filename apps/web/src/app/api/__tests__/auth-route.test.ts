import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const handler = {
    GET: vi.fn(async () => new Response("ok")),
    POST: vi.fn(async (req: Request) => {
      const body = await req.json();
      return Response.json(body);
    }),
  };
  return {
    handler,
    getAuth: vi.fn(() => ({ kind: "auth" })),
    toNextJsHandler: vi.fn(() => handler),
    getDb: vi.fn(() => ({ kind: "db" })),
    getUserByEmail: vi.fn(),
    countUsersBySignupIp: vi.fn(),
    setUserSignupIp: vi.fn(),
  };
});

vi.mock("@shotwise/auth", () => ({
  getAuth: mocks.getAuth,
}));

vi.mock("@shotwise/db", () => ({
  getDb: mocks.getDb,
  queries: {
    getUserByEmail: mocks.getUserByEmail,
    countUsersBySignupIp: mocks.countUsersBySignupIp,
    setUserSignupIp: mocks.setUserSignupIp,
  },
}));

vi.mock("better-auth/next-js", () => ({
  toNextJsHandler: mocks.toNextJsHandler,
}));

describe("/api/auth/[...all]", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.handler.GET.mockClear();
    mocks.handler.POST.mockClear();
    mocks.getAuth.mockClear();
    mocks.toNextJsHandler.mockClear();
    mocks.getDb.mockClear();
    mocks.getUserByEmail.mockReset();
    mocks.countUsersBySignupIp.mockReset();
    mocks.setUserSignupIp.mockReset();
    mocks.getUserByEmail.mockResolvedValue(undefined);
    mocks.countUsersBySignupIp.mockResolvedValue(0);
  });

  it("blocks disposable inboxes before forwarding to better-auth", async () => {
    const { POST } = await import("../auth/[...all]/route");
    const res = await POST(
      new Request("http://localhost/api/auth/sign-in/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "throwaway@mailinator.com" }),
      })
    );

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "blocked_email" },
    });
    expect(mocks.handler.POST).not.toHaveBeenCalled();
  });

  it("normalizes allowed aliases before forwarding to better-auth", async () => {
    const { POST } = await import("../auth/[...all]/route");
    const res = await POST(
      new Request("http://localhost/api/auth/sign-in/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "f.o.o+trial@gmail.com", password: "Secret123!" }),
      })
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ email: "foo@gmail.com", password: "Secret123!" });
    expect(mocks.handler.POST).toHaveBeenCalledTimes(1);
  });

  it("blocks sign-up when the signup IP already reached the limit", async () => {
    mocks.countUsersBySignupIp.mockResolvedValue(2);

    const { POST } = await import("../auth/[...all]/route");
    const res = await POST(
      new Request("http://localhost/api/auth/sign-up/email", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "203.0.113.7",
        },
        body: JSON.stringify({
          name: "Founder",
          email: "founder@example.com",
          password: "Secret123!",
        }),
      })
    );

    expect(res.status).toBe(429);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "ip_limit" },
    });
    expect(mocks.handler.POST).not.toHaveBeenCalled();
  });

  it("stores the normalized signup email and signup IP after a successful signup", async () => {
    mocks.handler.POST.mockImplementationOnce(async (req: Request) => {
      const body = await req.json();
      return Response.json({
        token: null,
        user: { id: "user-1", email: body.email },
      });
    });

    const { POST } = await import("../auth/[...all]/route");
    const res = await POST(
      new Request("http://localhost/api/auth/sign-up/email", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "203.0.113.11, 10.0.0.2",
        },
        body: JSON.stringify({
          name: "Founder",
          email: "F.o.o+trial@gmail.com",
          password: "Secret123!",
          callbackURL: "/dashboard",
        }),
      })
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      token: null,
      user: { id: "user-1", email: "foo@gmail.com" },
    });
    expect(mocks.countUsersBySignupIp).toHaveBeenCalledWith({ kind: "db" }, "203.0.113.11");
    expect(mocks.setUserSignupIp).toHaveBeenCalledWith({ kind: "db" }, "user-1", "203.0.113.11");
  });
});
